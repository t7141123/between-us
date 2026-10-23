#!/usr/bin/env python3
"""Validate the Between Us multi-language question bank."""
import json
import sys

LOCALES = ["zh-TW", "zh-CN", "en"]
CATS = ["vision", "soul", "finance", "intimacy", "fun", "growth", "faith"]
BANNED = ["末日", "超能力", "荒島", "平行宇宙", "轉世", "時光機", "外星", "魔法", "平行世界", "丧尸", "僵尸"]

errors = []
total = 0

for loc in LOCALES:
    p = f"src/lang/{loc}/questions.json"
    try:
        with open(p, encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        errors.append(f"{loc}: 檔案不存在 {p}")
        continue
    seen = {}
    loc_total = 0
    for key in CATS:
        qs = data.get(key)
        if qs is None:
            errors.append(f"{loc}/{key}: 缺少分類")
            continue
        if len(qs) != 100:
            errors.append(f"{loc}/{key}: 題數 {len(qs)}，應為 100")
        for q in qs:
            if not isinstance(q, str):
                errors.append(f"{loc}/{key}: 非字串項目 {q!r}")
                continue
            loc_total += 1
            total += 1
            for bad in BANNED:
                if bad in q:
                    errors.append(f"{loc}/{key}: 禁用詞「{bad}」：{q}")
            if q in seen:
                errors.append(f"{loc}/{key}: 重複題目：{q}")
            seen[q] = key
            if not q.endswith(("？", "。", "?", ".")):
                errors.append(f"{loc}/{key}: 標點未收尾：{q}")
            maxlen = 140 if loc == "en" else 60
            if not 8 <= len(q) <= maxlen:
                errors.append(f"{loc}/{key}: 長度異常（{len(q)}）：{q}")
            if "{" in q or "}" in q:
                errors.append(f"{loc}/{key}: 疑似模板殘留：{q}")
    print(f"  {loc}: {loc_total} 題")

print(f"總題數（3 語系 × 7 分類 × 100）：{total}")
if total != 2100:
    errors.append(f"總題數為 {total}，應為 2100")

if errors:
    print("\n❌ 驗證未通過：")
    for e in errors:
        print(" -", e)
    sys.exit(1)
print("\n✅ 驗證通過：3 語系、7 分類各 100 題、共 2100 題、無重複、無禁用主題。")
