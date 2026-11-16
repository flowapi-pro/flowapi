# Send a WhatsApp message and a file with Flow API (flowapi.pro). pip install requests
import os, requests

BASE = f"https://flowapi.pro/waInstance{os.environ['ID_INSTANCE']}/{{method}}/{os.environ['API_TOKEN']}"

def call(method, body=None):
    url = BASE.format(method=method)
    r = requests.post(url, json=body, timeout=30) if body is not None else requests.get(url, timeout=30)
    r.raise_for_status()
    return r.json()

print(call("getStateInstance"))                       # {"stateInstance": "authorized"}
print(call("sendMessage", {"chatId": "972501234567@c.us", "message": "Hello from Python"}))
print(call("sendFileByUrl", {"chatId": "972501234567@c.us", "urlFile": "https://flowapi.pro/og.png", "fileName": "flowapi.png", "caption": "Sent with Flow API"}))
