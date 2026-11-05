# -*- coding: utf-8 -*-
"""
Apply hints to authoritative_data Python files and expansion pack JS files.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from authoritative_data.vision import VISION_QUESTIONS
from authoritative_data.soul import SOUL_QUESTIONS
from authoritative_data.finance import FINANCE_QUESTIONS
from authoritative_data.intimacy import INTIMACY_QUESTIONS
from authoritative_data.growth import GROWTH_QUESTIONS

from hints_data.vision_hints import VISION_HINTS
from hints_data.soul_hints import SOUL_HINTS
from hints_data.finance_hints import FINANCE_HINTS
from hints_data.intimacy_hints import INTIMACY_HINTS
from hints_data.growth_hints import GROWTH_HINTS

from hints_data.sensual_hints import SENSUAL_HINTS
from hints_data.marriage_hints import MARRIAGE_HINTS
from hints_data.parenting_hints import PARENTING_HINTS

CORE_MAP = [
    ("vision", "VISION_QUESTIONS", VISION_QUESTIONS, VISION_HINTS),
    ("soul", "SOUL_QUESTIONS", SOUL_QUESTIONS, SOUL_HINTS),
    ("finance", "FINANCE_QUESTIONS", FINANCE_QUESTIONS, FINANCE_HINTS),
    ("intimacy", "INTIMACY_QUESTIONS", INTIMACY_QUESTIONS, INTIMACY_HINTS),
    ("growth", "GROWTH_QUESTIONS", GROWTH_QUESTIONS, GROWTH_HINTS),
]

def format_python_file(cat_name, var_name, questions, hints):
    lines = [
        "# -*- coding: utf-8 -*-",
        f'"""',
        f'Category: {cat_name}',
        f'Psychology-backed authoritative question bank with 3-locale listening hints.',
        f'"""',
        "",
        f"{var_name} = [",
    ]
    for idx, (q, h) in enumerate(zip(questions, hints)):
        lines.append("    {")
        lines.append(f'        "id": "{cat_name}_{idx+1:03d}",')
        lines.append(f'        "question_tw": {repr(q["tw"])},')
        lines.append(f'        "question_cn": {repr(q["cn"])},')
        lines.append(f'        "question_en": {repr(q["en"])},')
        lines.append(f'        "hint_tw": {repr(h["hint_tw"])},')
        lines.append(f'        "hint_cn": {repr(h["hint_cn"])},')
        lines.append(f'        "hint_en": {repr(h["hint_en"])},')
        lines.append("    }," if idx < len(questions) - 1 else "    },")
    lines.append("]")
    lines.append("")
    return "\n".join(lines)

def update_core():
    base_dir = os.path.join(os.path.dirname(__file__), "authoritative_data")
    for cat_name, var_name, questions, hints in CORE_MAP:
        assert len(questions) == 50
        assert len(hints) == 50
        content = format_python_file(cat_name, var_name, questions, hints)
        target_path = os.path.join(base_dir, f"{cat_name}.py")
        with open(target_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated core {target_path} (50 questions + 50 hints)")

PACK_MAP = [
    ("sensual", "Late Night Whispers (深夜私語)", SENSUAL_HINTS),
    ("marriage", "Marriage Vows Eve (婚姻誓約前夕)", MARRIAGE_HINTS),
    ("parenting", "Newborn & New Parents (新生兒與新手父母)", PARENTING_HINTS),
]

def update_packs():
    import json
    import subprocess

    base_dir = os.path.join(os.path.dirname(__file__), "questions-data")
    for pack_id, title, hints in PACK_MAP:
        source_path = os.path.join(base_dir, f"{pack_id}.js")
        # Load existing JS array using node
        node_cmd = f"node -e \"console.log(JSON.stringify(require('./scripts/questions-data/{pack_id}.js')))\""
        out = subprocess.check_output(node_cmd, shell=True, text=True)
        items = json.loads(out)
        assert len(items) == 50
        assert len(hints) == 50

        # Construct JS module export
        js_lines = [
            "/**",
            f" * Expansion Pack: {title} - 50 curated prompts with 3-locale listening hints.",
            " * Fully compliant with Apple App Store Guideline 1.1.4 & Google Play Policies.",
            " */",
            "module.exports = [",
        ]
        for idx, (item, h) in enumerate(zip(items, hints)):
            js_lines.append("  {")
            js_lines.append(f"    tw: {json.dumps(item['tw'], ensure_ascii=False)},")
            js_lines.append(f"    cn: {json.dumps(item['cn'], ensure_ascii=False)},")
            js_lines.append(f"    en: {json.dumps(item['en'], ensure_ascii=False)},")
            js_lines.append(f"    hint_tw: {json.dumps(h['hint_tw'], ensure_ascii=False)},")
            js_lines.append(f"    hint_cn: {json.dumps(h['hint_cn'], ensure_ascii=False)},")
            js_lines.append(f"    hint_en: {json.dumps(h['hint_en'], ensure_ascii=False)},")
            js_lines.append("  }," if idx < len(items) - 1 else "  },")
        js_lines.append("];")
        js_lines.append("")

        with open(source_path, "w", encoding="utf-8") as f:
            f.write("\n".join(js_lines))
        print(f"Updated pack {source_path} (50 questions + 50 hints)")

if __name__ == "__main__":
    update_core()
    update_packs()
