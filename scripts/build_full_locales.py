# scripts/build_full_locales.py
import json
import sys
import os

from authoritative_data.vision import VISION_QUESTIONS
from authoritative_data.soul import SOUL_QUESTIONS
from authoritative_data.intimacy import INTIMACY_QUESTIONS
from authoritative_data.growth import GROWTH_QUESTIONS
from authoritative_data.finance import FINANCE_QUESTIONS
from authoritative_data.faith import FAITH_QUESTIONS
from authoritative_data.fun import FUN_QUESTIONS

DATA_MAP = {
    "vision": VISION_QUESTIONS,
    "soul": SOUL_QUESTIONS,
    "finance": FINANCE_QUESTIONS,
    "intimacy": INTIMACY_QUESTIONS,
    "fun": FUN_QUESTIONS,
    "growth": GROWTH_QUESTIONS,
    "faith": FAITH_QUESTIONS,
}

# Verify question counts
total_questions = 0
for cat_key, q_list in DATA_MAP.items():
    print(f"Category [{cat_key}]: {len(q_list)} authoritative questions.")
    assert len(q_list) == 50, f"Category {cat_key} must have exactly 50 questions, got {len(q_list)}"
    total_questions += len(q_list)

print(f"Verified all 7 categories: total {total_questions} questions!")

LOCALES = [
    ("zh-TW", "tw", "question_tw", "hint_tw"),
    ("zh-CN", "cn", "question_cn", "hint_cn"),
    ("en", "en", "question_en", "hint_en"),
]

for locale_name, short_k, long_k, hint_k in LOCALES:
    file_path = f"../src/locales/{locale_name}.json"
    with open(file_path, "r", encoding="utf-8") as f:
        loc_data = json.load(f)

    categories = loc_data.get("categories", {})
    for cat_id, questions in DATA_MAP.items():
        if cat_id not in categories:
            categories[cat_id] = {"label": cat_id}

        q_texts = []
        q_hints = []
        for q in questions:
            text = q.get(long_k) or q.get(short_k)
            q_texts.append(text)
            hint = q.get(hint_k, "")
            q_hints.append(hint)

        categories[cat_id]["questions"] = q_texts
        # Store hints if available
        if any(q_hints):
            categories[cat_id]["hints"] = q_hints

    loc_data["categories"] = categories

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(loc_data, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"Successfully updated {file_path}")

print("All 3 locale files updated successfully with 350 psychology-backed authoritative questions!")
