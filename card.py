import requests
import json

url = "https://db.ygoprodeck.com/api/v7/cardinfo.php"

data = requests.get(url).json()
with open("card.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=4)