#!/usr/bin/env python3
"""Validate the Between Us question bank against the PRD."""
import json
import re
import sys

CATEGORIES = {
    "vision": "價值與未來",
    "soul": "心靈與情緒",
    "finance": "家庭理財",
    "intimacy": "親密與連結",
    "fun": "日常與陪伴",
    "growth": "成長與對話",
    "faith": "基督信仰",
}
BANNED = ["末日", "超能力", "荒島", "平行宇宙", "轉世", "時光機", "外星", "魔法", "平行世界"]

with open(sys.argv[1] if len(sys.argv) > 1 else "questions.json", encoding="utf-8") as f:
    data = json.load(f)

errors = []
total = 0
seen = {}
for key, label in CATEGORIES.items():
    qs = data.get(key)
    if qs is None:
        errors.append(f"缺少分類：{key}")
        continue
    if not isinstance(qs, list):
        errors.append(f"{key} 不是陣列：{type(qs)}")
        continue
    if not 98 <= len(qs) <= 102:
        errors.append(f"{label} 題數為 {len(qs)}，應在 98～102 之間")
    for q in qs:
        if not isinstance(q, str):
            errors.append(f"{key} 含非字串項目：{q!r}")
            continue
        total += 1
        for bad in BANNED:
            if bad in q:
                errors.append(f"禁用詞「{bad}」：{q}")
        if q in seen:
            errors.append(f"重複題目（{seen[q]} / {key}）：{q}")
        seen[q] = key
        if not q.endswith(("？", "。")):
            errors.append(f"標點未收尾：{q}")
        if not 8 <= len(q) <= 60:
            errors.append(f"長度異常（{len(q)}）：{q}")
        if "{" in q or "}" in q or re.search(r"[A-Za-z]{4,}", q):
            errors.append(f"疑似模板或英文殘留：{q}")

extra = set(data) - set(CATEGORIES)
if extra:
    errors.append(f"未知分類：{sorted(extra)}")

print(f"總題數：{total}")
for key, label in CATEGORIES.items():
    qs = data.get(key) or []
    print(f"  {label:<8} {len(qs):>3} 題")
if total != 700:
    errors.append(f"總題數為 {total}，應為 700")

if errors:
    print("\n❌ 驗證未通過：")
    for e in errors:
        print(" -", e)
    sys.exit(1)

print("\n✅ 驗證通過：700 題、7 分類每類 100 題、無重複、無禁用主題。")
