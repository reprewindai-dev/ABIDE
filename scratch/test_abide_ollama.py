import requests
import json
import time

url = "https://abide.veklom.com/api/generate"
payload = {
    "intent": "Create a simple hello world API",
    "context": "Context...",
    "architect": "Antigravity",
    "notes": "Testing Ollama Integration directly in Production without synthetic fallbacks."
}

print("Initiating POST request to ABIDE production endpoint...")
start_time = time.time()
response = requests.post(url, json=payload)
end_time = time.time()

print(f"Status Code: {response.status_code}")
print(f"Response Time: {end_time - start_time:.2f} seconds")

try:
    data = response.json()
    print("Response JSON:")
    print(json.dumps(data, indent=2))
except Exception as e:
    print("Raw Response:", response.text)
