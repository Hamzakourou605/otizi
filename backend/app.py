import os
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from bson import ObjectId
import bcrypt
from datetime import datetime, timedelta
from fpdf import FPDF
from dotenv import load_dotenv
from flask_socketio import SocketIO, emit
import json

load_dotenv()

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'creditpro-super-robust-secret-key-2024-ahmed')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
jwt = JWTManager(app)

# MongoDB Connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/otizi')
client = MongoClient(MONGO_URI)
db = client.get_database()

# Collections
users_col = db.users
transactions_col = db.transactions
admin_logs_col = db.admin_logs

def log_admin_action(admin_id, action, client_id=None, amount=0, note=""):
    admin_logs_col.insert_one({
        'admin_id': admin_id,
        'action': action,
        'client_id': client_id,
        'amount': amount,
        'note': note,
        'timestamp': datetime.utcnow()
    })

# --- AUTH ROUTES ---

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('nom')
    phone = data.get('telephone', '')
    role = data.get('role', 'client') # Default to client

    if users_col.find_one({'email': email}):
        return jsonify({'msg': 'Email already exists'}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    user_id = users_col.insert_one({
        'nom': name,
        'email': email,
        'telephone': phone,
        'password': hashed_password,
        'role': role,
        'created_at': datetime.utcnow()
    }).inserted_id

    return jsonify({'msg': 'User created successfully', 'id': str(user_id)}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = users_col.find_one({'email': email})
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password']):
        return jsonify({'msg': 'Invalid credentials'}), 401

    # Store role and ID in the identity string for simplicity and compatibility
    identity_str = f"{str(user['_id'])}:{user['role']}"
    access_token = create_access_token(identity=identity_str)
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': str(user['_id']),
            'nom': user['nom'],
            'email': user['email'],
            'telephone': user.get('telephone', ''),
            'role': user['role']
        }
    }), 200

# --- ADMIN ROUTES ---

@app.route('/clients', methods=['GET'])
@jwt_required()
def get_clients():
    identity = get_jwt_identity()
    user_id, role = identity.split(':')
    
    if role != 'admin':
        return jsonify({'msg': 'Admin access required'}), 403

    clients = list(users_col.find({'role': 'client'}, {'password': 0}))
    print(f"Found {len(clients)} clients in DB")
    
    all_txs = list(transactions_col.find())
    
    for c in clients:
        c['_id'] = str(c['_id'])
        # Safety: compare as strings
        c_txs = [t for t in all_txs if str(t.get('client_id')) == str(c['_id'])]
        c['total_achats'] = sum(t.get('montant', 0) for t in c_txs if t.get('type') == 'achat')
        c['total_paiements'] = sum(t.get('montant', 0) for t in c_txs if t.get('type') == 'paiement')
        c['credit_total'] = c['total_achats'] - c['total_paiements']
        print(f"Client {c['nom']}: {len(c_txs)} transactions, credit {c['credit_total']}")

    return jsonify(clients), 200

@app.route('/clients/<id>', methods=['GET'])
@jwt_required()
def get_client_details(id):
    identity = get_jwt_identity()
    user_id, role = identity.split(':')
    if role != 'admin' and user_id != id:
        return jsonify({'msg': 'Unauthorized'}), 403

    user = users_col.find_one({'_id': ObjectId(id)}, {'password': 0})
    if not user:
        return jsonify({'msg': 'User not found'}), 404

    user['_id'] = str(user['_id'])
    
    # Calculate current balance
    all_txs = list(transactions_col.find({'client_id': id}))
    total_achats = sum(t.get('montant', 0) for t in all_txs if t.get('type') in ['achat', 'correction'])
    total_paiements = sum(t.get('montant', 0) for t in all_txs if t.get('type') in ['paiement', 'bonus', 'remise'])
    user['current_balance'] = total_achats - total_paiements

    return jsonify(user), 200

@app.route('/admin/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    identity = get_jwt_identity()
    user_id, role = identity.split(':')
    if role != 'admin':
        return jsonify({'msg': 'Admin access required'}), 403

    total_clients = users_col.count_documents({'role': 'client'})
    
    all_txs = list(transactions_col.find())
    
    # Global Cumulative Credit
    total_achats = sum(t.get('montant', 0) for t in all_txs if t.get('type') in ['achat', 'correction'])
    total_paiements = sum(t.get('montant', 0) for t in all_txs if t.get('type') in ['paiement', 'bonus', 'remise'])
    global_credit = total_achats - total_paiements

    # Monthly Statistics
    now = datetime.utcnow()
    this_month_str = now.strftime('%Y-%m')
    
    # Get previous month string
    first_day_this_month = now.replace(day=1)
    last_day_prev_month = first_day_this_month - timedelta(days=1)
    prev_month_str = last_day_prev_month.strftime('%Y-%m')

    this_month_txs = [t for t in all_txs if t.get('mois') == this_month_str]
    prev_month_txs = [t for t in all_txs if t.get('mois') == prev_month_str]

    this_month_credit = sum(t.get('montant', 0) for t in this_month_txs if t.get('type') == 'achat')
    prev_month_credit_total = sum(t.get('montant', 0) for t in prev_month_txs if t.get('type') == 'achat')

    # Top debtors
    clients = list(users_col.find({'role': 'client'}, {'password': 0, 'created_at': 0}))
    for c in clients:
        c['_id'] = str(c['_id'])
        c_txs = [t for t in all_txs if str(t.get('client_id')) == str(c['_id'])]
        c['credit_total'] = sum(t.get('montant', 0) for t in c_txs if t.get('type') in ['achat', 'correction']) - \
                           sum(t.get('montant', 0) for t in c_txs if t.get('type') in ['paiement', 'bonus', 'remise'])
    
    top_debtors = sorted([c for c in clients if c['credit_total'] > 0], key=lambda x: x['credit_total'], reverse=True)[:5]

    recent_txs = list(transactions_col.find().sort('created_at', -1).limit(10))
    for t in recent_txs:
        t['_id'] = str(t['_id'])
        client_doc = users_col.find_one({'_id': ObjectId(t['client_id'])})
        t['client_name'] = client_doc['nom'] if client_doc else 'Unknown'

    return jsonify({
        'total_clients': total_clients,
        'global_credit': global_credit,
        'this_month_credit': this_month_credit,
        'prev_month_credit': prev_month_credit_total,
        'total_revenue': total_paiements,
        'recent_transactions': recent_txs,
        'top_debtors': top_debtors
    }), 200

@app.route('/admin/logs', methods=['GET'])
@jwt_required()
def get_admin_logs():
    identity = get_jwt_identity()
    user_id, role = identity.split(':')
    if role != 'admin':
        return jsonify({'msg': 'Admin access required'}), 403
    
    logs = list(admin_logs_col.find().sort('timestamp', -1).limit(100))
    for l in logs:
        l['_id'] = str(l['_id'])
        
        # Safe Admin lookup
        try:
            admin = users_col.find_one({'_id': ObjectId(l['admin_id'])})
            l['admin_name'] = admin['nom'] if admin else 'Unknown'
        except:
            l['admin_name'] = 'Unknown'

        # Safe Client lookup
        if l.get('client_id'):
            try:
                client = users_col.find_one({'_id': ObjectId(l['client_id'])})
                l['client_name'] = client['nom'] if client else 'Client supprimé'
            except:
                l['client_name'] = 'ID Invalide'
        else:
            l['client_name'] = 'N/A'
            
    return jsonify(logs), 200

@app.route('/search', methods=['GET'])
@jwt_required()
def search():
    identity = get_jwt_identity()
    user_id, role = identity.split(':')
    if role != 'admin':
        return jsonify({'msg': 'Admin access required'}), 403
        
    q = request.args.get('q', '')
    if not q: return jsonify([]), 200
    
    # Search in clients
    clients = list(users_col.find({
        'role': 'client',
        '$or': [
            {'nom': {'$regex': q, '$options': 'i'}},
            {'email': {'$regex': q, '$options': 'i'}},
            {'telephone': {'$regex': q, '$options': 'i'}}
        ]
    }, {'password': 0}))
    
    for c in clients: c['_id'] = str(c['_id'])
    return jsonify(clients), 200

# --- TRANSACTION ROUTES ---

@app.route('/transactions', methods=['POST'])
@jwt_required()
def add_transaction():
    try:
        identity = get_jwt_identity()
        user_id, role = identity.split(':')
        if role != 'admin':
            return jsonify({'msg': 'Only admin can add transactions'}), 403

        data = request.get_json()
        client_id = data.get('client_id')
        t_type = data.get('type') # 'achat', 'paiement', 'correction', 'bonus', 'remise'
        amount = float(data.get('montant'))
        description = data.get('description')
        note = data.get('note', '')
        date_str = data.get('date', datetime.now().strftime('%Y-%m-%d'))
        
        # Get current balance before transaction
        all_txs = list(transactions_col.find({'client_id': client_id}))
        old_balance = sum(t.get('montant', 0) for t in all_txs if t.get('type') in ['achat', 'correction']) - \
                      sum(t.get('montant', 0) for t in all_txs if t.get('type') in ['paiement', 'bonus', 'remise'])
        
        new_balance = old_balance + amount if t_type in ['achat', 'correction'] else old_balance - amount

        # Extract month for filtering (YYYY-MM)
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        mois = date_obj.strftime('%Y-%m')

        transaction_id = transactions_col.insert_one({
            'client_id': client_id,
            'type': t_type,
            'montant': amount,
            'description': description,
            'note': note,
            'old_balance': old_balance,
            'new_balance': new_balance,
            'date': date_str,
            'mois': mois,
            'created_at': datetime.utcnow(),
            'created_by': user_id
        }).inserted_id

        # Log action
        log_admin_action(user_id, f"ADD_{t_type.upper()}", client_id, amount, description)

        # Emit WebSocket event for real-time update
        socketio.emit('credit_update', {
            'client_id': client_id,
            'new_balance': new_balance,
            'type': t_type,
            'amount': amount
        }, room=client_id)

        return jsonify({'msg': 'Transaction added', 'id': str(transaction_id), 'new_balance': new_balance}), 201

    except Exception as e:
        import traceback
        print(f"ERROR IN add_transaction: {e}")
        traceback.print_exc()
        return jsonify({'msg': f'Error adding transaction: {str(e)}'}), 500

@app.route('/transactions/my', methods=['GET'])
@jwt_required()
def get_my_transactions():
    identity = get_jwt_identity()
    user_id, role = identity.split(':')
    client_id = user_id
    mois = request.args.get('mois') # Optional filter

    query = {'client_id': client_id}
    if mois:
        query['mois'] = mois

    transactions = list(transactions_col.find(query).sort('date', -1))
    for t in transactions:
        t['_id'] = str(t['_id'])
    
    return jsonify(transactions), 200

@app.route('/transactions/client/<id>', methods=['GET'])
@jwt_required()
def get_client_transactions(id):
    identity = get_jwt_identity()
    user_id, role = identity.split(':')
    if role != 'admin':
        return jsonify({'msg': 'Admin access required'}), 403

    mois = request.args.get('mois')
    query = {'client_id': id}
    if mois:
        query['mois'] = mois

    transactions = list(transactions_col.find(query).sort('date', -1))
    for t in transactions:
        t['_id'] = str(t['_id'])
    
    return jsonify(transactions), 200

# --- PDF EXPORT ---

@app.route('/export/pdf', methods=['GET'])
@jwt_required()
def export_pdf():
    identity = get_jwt_identity()
    current_user_id, role = identity.split(':')
    client_id = request.args.get('client_id', current_user_id)
    mois = request.args.get('mois')

    # Security check
    if role != 'admin' and current_user_id != client_id:
        return jsonify({'msg': 'Unauthorized'}), 403

    user = users_col.find_one({'_id': ObjectId(client_id)})
    query = {'client_id': client_id}
    if mois:
        query['mois'] = mois

    transactions = list(transactions_col.find(query).sort('date', 1))

    # PDF Logic
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(200, 10, txt=f"Historique de Credit - {user['nom']}", ln=True, align='C')
    
    if mois:
        pdf.set_font("Arial", 'I', 12)
        pdf.cell(200, 10, txt=f"Periode: {mois}", ln=True, align='C')

    pdf.ln(10)
    pdf.set_font("Arial", 'B', 10)
    pdf.cell(30, 10, "Date", 1)
    pdf.cell(30, 10, "Type", 1)
    pdf.cell(80, 10, "Description", 1)
    pdf.cell(40, 10, "Montant", 1)
    pdf.ln()

    pdf.set_font("Arial", '', 10)
    total_achats = 0
    total_paiements = 0

    for t in transactions:
        pdf.cell(30, 10, t['date'], 1)
        pdf.cell(30, 10, t['type'].capitalize(), 1)
        pdf.cell(80, 10, t['description'], 1)
        pdf.cell(40, 10, f"{t['montant']:.2f}", 1)
        pdf.ln()
        if t['type'] == 'achat':
            total_achats += t['montant']
        else:
            total_paiements += t['montant']

    pdf.ln(10)
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(100, 10, f"Total Achats: {total_achats:.2f}")
    pdf.ln()
    pdf.cell(100, 10, f"Total Paiements: {total_paiements:.2f}")
    pdf.ln()
    pdf.cell(100, 10, f"Credit Total: {total_achats - total_paiements:.2f}")

    pdf_output = f"report_{client_id}_{mois if mois else 'global'}.pdf"
    
    # Use /tmp for temporary files on Render if needed, or stick to exports
    export_dir = 'exports'
    if not os.path.exists(export_dir):
        os.makedirs(export_dir)
        
    pdf_path = os.path.join(export_dir, pdf_output)
    
    # Clean up old reports in the same thread (simple approach)
    try:
        pdf.output(pdf_path)
    except Exception as e:
        # Fallback for Unicode errors (very common with FPDF and French accents)
        # We can try to encode as latin-1 or just ignore
        pdf.output(pdf_path.encode('latin-1', 'ignore').decode('latin-1'))

    return send_file(pdf_path, as_attachment=True)

# --- CREDIT CALCULATION (AGGREGATION) ---

@app.route('/my-credit', methods=['GET'])
@jwt_required()
def get_my_credit():
    identity = get_jwt_identity()
    client_id, role = identity.split(':')
    
    pipeline = [
        { '$match': { 'client_id': client_id } },
        {
            '$group': {
                '_id': None,
                'total_achats': { 
                    '$sum': { '$cond': [{ '$eq': ['$type', 'achat'] }, '$montant', 0] } 
                },
                'total_paiements': { 
                    '$sum': { '$cond': [{ '$eq': ['$type', 'paiement'] }, '$montant', 0] } 
                }
            }
        }
    ]
    
    result = list(transactions_col.aggregate(pipeline))
    if not result:
        return jsonify({'total_achats': 0, 'total_paiements': 0, 'credit': 0}), 200
        
    res = result[0]
    return jsonify({
        'total_achats': res['total_achats'],
        'total_paiements': res['total_paiements'],
        'credit': res['total_achats'] - res['total_paiements']
    }), 200

@app.route('/client/summary', methods=['GET'])
@jwt_required()
def get_client_summary():
    identity = get_jwt_identity()
    client_id, role = identity.split(':')
    
    # Get all transactions
    txs = list(transactions_col.find({'client_id': client_id}).sort('date', 1))
    
    total_achats = sum(t.get('montant', 0) for t in txs if t.get('type') in ['achat', 'correction'])
    total_paiements = sum(t.get('montant', 0) for t in txs if t.get('type') in ['paiement', 'bonus', 'remise'])
    
    # Monthly evolution
    evolution = {}
    for t in txs:
        # Use .get() to avoid KeyError if 'mois' is missing
        m = t.get('mois') or (t.get('date')[:7] if t.get('date') else 'Inconnu')
        
        if m not in evolution: evolution[m] = 0
        
        amt = t.get('montant', 0)
        if t.get('type') in ['achat', 'correction']:
            evolution[m] += amt
        else:
            evolution[m] -= amt
            
    # Format for Recharts
    chart_data = [{"month": m, "balance": b} for m, b in sorted(evolution.items())]

    return jsonify({
        'total_credit': total_achats,
        'total_paid': total_paiements,
        'balance': total_achats - total_paiements,
        'monthly_evolution': chart_data
    }), 200

@socketio.on('join')
def on_join(data):
    # Clients join a room named after their ID to receive private updates
    client_id = data.get('client_id')
    from flask_socketio import join_room
    join_room(client_id)
    print(f"Client {client_id} joined room")

if __name__ == '__main__':
    # socketio.run instead of app.run for WebSocket support
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=os.environ.get('DEBUG', 'True') == 'True')
