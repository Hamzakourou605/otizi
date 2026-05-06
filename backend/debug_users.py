from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client.get_database()
users_col = db.users

print("Liste des utilisateurs :")
for user in users_col.find():
    print(f"Role: {user.get('role')}, Email: {user.get('email')}, Nom: {user.get('nom')}")
