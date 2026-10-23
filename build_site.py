import json

with open("questions.json", encoding="utf-8") as fh:
    data = json.load(fh)

LABELS = {
    "vision": "價值與未來",
    "soul": "心靈與情緒",
    "finance": "家庭理財",
    "intimacy": "親密與連結",
    "fun": "日常與陪伴",
    "growth": "成長與對話",
    "faith": "基督信仰",
}
bank = [{"key": k, "label": LABELS[k], "questions": v} for k, v in data.items()]

with open("index.template.html", encoding="utf-8") as fh:
    html = fh.read()

assert "__QUESTIONS__" in html
html = html.replace("__QUESTIONS__", json.dumps(bank, ensure_ascii=False, indent=2))
with open("index.html", "w", encoding="utf-8") as fh:
    fh.write(html)

total = sum(len(b["questions"]) for b in bank)
print("index.html", len(html.encode()), "bytes,", total, "questions")
