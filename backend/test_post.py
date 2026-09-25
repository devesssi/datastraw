import urllib.request
import json

url = "http://127.0.0.1:8000/api/tickets"
data = {
    "customer_name": "John Wick",
    "customer_email": "john@continental.com",
    "subject": "Account locked out",
    "description": "My account was locked after 3 failed login attempts.",
    "priority": "High"
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req) as response:
        print(response.status, response.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
