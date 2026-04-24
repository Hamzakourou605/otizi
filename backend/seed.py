import os
from pymongo import MongoClient
import bcrypt
from dotenv import load_dotenv

load_dotenv()

def seed_admin():
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/otizi')
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    users_col = db.users

    admin_email = 'ahmed@otizi.com'
    admin_password = 'adminpassword123'

    if users_col.find_one({'email': admin_email}):
        print("Admin Ahmed Baissi already exists")
        return

    hashed_password = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt())
    
    users_col.insert_one({
        'nom': 'Ahmed Baissi',
        'email': admin_email,
        'password': hashed_password,
        'role': 'admin',
        'title': 'super admin caisse'
    })
    print(f"Admin created: {admin_email} / {admin_password}")

if __name__ == '__main__':
    seed_admin()
