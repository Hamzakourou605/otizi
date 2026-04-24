from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/otizi')
client = MongoClient(MONGO_URI)
db = client.get_database()
users_col = db.users

print("Total users:", users_col.count_documents({}))
print("Clients:", users_col.count_documents({'role': 'client'}))
print("Roles found:", users_col.distinct('role'))

for user in users_col.find().limit(5):
    print(f"ID: {user['_id']}, Name: {user.get('nom')}, Role: {user.get('role')}")
