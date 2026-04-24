from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv('MONGO_URI')

if not MONGO_URI:
    print("MONGO_URI not found in .env")
    exit(1)

client = MongoClient(MONGO_URI)
db = client.get_database()
transactions_col = db.transactions

print("Creating index on transactions collection: {client_id: 1, mois: 1}...")
transactions_col.create_index([("client_id", 1), ("mois", 1)])
print("Index created successfully.")
