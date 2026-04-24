import requests
import json

def test():
    # 1. Login
    res = requests.post("http://127.0.0.1:5000/login", json={
        "email": "admin@creditpro.com",
        "password": "admin"
    })
    print("Login:", res.status_code)
    token = res.json().get("access_token")

    # 2. Get clients
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.get("http://127.0.0.1:5000/clients", headers=headers)
    clients = res.json()
    if not clients:
        print("No clients found.")
        return
    client_id = clients[0]["_id"]
    print("Client ID:", client_id)

    # 3. Add transaction
    res = requests.post("http://127.0.0.1:5000/transactions", json={
        "client_id": client_id,
        "type": "achat",
        "montant": 15000,
        "description": "Test Backend Script",
        "note": "A note"
    }, headers=headers)
    print("Add Transaction:", res.status_code)
    try:
        print(json.dumps(res.json(), indent=2))
    except:
        print(res.text)

if __name__ == "__main__":
    test()
