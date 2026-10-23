#!/usr/bin/env python3
"""Build the Between Us multi-language single-file SPA.

Reads question banks from src/lang/<locale>/questions.json and injects them
into src/index.template.html (__ALL_LANGS__ placeholder), producing
dist/index.html and index.html.
"""
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
LANG_DIR = SRC / "lang"
TEMPLATE = SRC / "index.template.html"
DIST = ROOT / "dist"

LOCALES = ["zh-TW", "zh-CN", "en"]
LABELS = {
    "zh-TW": "繁體中文",
    "zh-CN": "简体中文",
    "en": "English",
}

# category internal key -> display label per locale
CAT_LABELS = {
    "zh-TW": {
        "vision": "價值與未來",
        "soul": "心靈與情緒",
        "finance": "家庭理財",
        "intimacy": "親密與連結",
        "fun": "日常與陪伴",
        "growth": "成長與對話",
        "faith": "基督信仰",
    },
    "zh-CN": {
        "vision": "价值与未来",
        "soul": "心灵与情绪",
        "finance": "家庭理财",
        "intimacy": "亲密与连结",
        "fun": "日常与陪伴",
        "growth": "成长与对话",
        "faith": "基督信仰",
    },
    "en": {
        "vision": "Values & Future",
        "soul": "Heart & Emotions",
        "finance": "Family & Finance",
        "intimacy": "Intimacy & Connection",
        "fun": "Daily & Companionship",
        "growth": "Growth & Conversation",
        "faith": "Christian Faith",
    },
}

# UI strings per locale
UI_STRINGS = {
    "zh-TW": {
        "title": "在我們之間 · Between Us",
        "subtitle": "雙人對話沙龍：700 個問題、7 個主題，抽卡、翻面、好好說話。",
        "all": "全部",
        "favorites_only": "僅看收藏",
        "search_placeholder": "搜尋問題…",
        "card_front_hint": "點擊翻面看提示",
        "card_back_hint": "點擊翻回題目",
        "timer_title": "5 分鐘計時器",
        "timer_prompt": "給彼此五分鐘，一個人說，另一個人只聽。",
        "timer_start": "開始",
        "timer_pause": "暫停",
        "timer_reset": "重設",
        "timer_end": "時間到",
        "mute": "靜音",
        "unmute": "開啟音效",
        "add_favorite": "加入收藏",
        "remove_favorite": "移除收藏",
        "language": "語言",
        "next_question": "換一題",
        "drawer_btn": "從題庫挑",
        "drawer_title": "題庫抽屜",
        "drawer_all": "全部",
        "drawer_fav": "僅看收藏",
        "back_title": "在我們之間",
        "back_quote": "慢慢說，慢慢聽。沒有標準答案。",
        "close": "關閉",
        "keyboard_hint": "空白鍵：翻牌 ｜ →：換一題 ｜ F：收藏 ｜ T：計時器",
        "shuffle": "重新排序",
        "deck_empty": "這個分類目前沒有問題。",
        "load_from_drawer": "從抽屜中點選一題載入",
        "fav_added": "已加入收藏",
        "fav_removed": "已取消收藏",
    },
    "zh-CN": {
        "title": "在我们之间 · Between Us",
        "subtitle": "双人对话沙龙：700 个问题、7 个主题，抽卡、翻面、好好说话。",
        "all": "全部",
        "favorites_only": "仅看收藏",
        "search_placeholder": "搜索问题…",
        "card_front_hint": "点击翻面看提示",
        "card_back_hint": "点击翻回题目",
        "timer_title": "5 分钟计时器",
        "timer_prompt": "给彼此五分钟，一个人说，另一个人只听。",
        "timer_start": "开始",
        "timer_pause": "暂停",
        "timer_reset": "重设",
        "timer_end": "时间到",
        "mute": "静音",
        "unmute": "开启音效",
        "add_favorite": "加入收藏",
        "remove_favorite": "移除收藏",
        "language": "语言",
        "next_question": "换一题",
        "drawer_btn": "从题库挑",
        "drawer_title": "题库抽屉",
        "drawer_all": "全部",
        "drawer_fav": "仅看收藏",
        "back_title": "在我们之间",
        "back_quote": "慢慢说，慢慢听。没有标准答案。",
        "close": "关闭",
        "keyboard_hint": "空格键：翻牌 ｜ →：换一题 ｜ F：收藏 ｜ T：计时器",
        "shuffle": "重新排序",
        "deck_empty": "这个分类目前没有问题。",
        "load_from_drawer": "从抽屉中点选一题载入",
        "fav_added": "已加入收藏",
        "fav_removed": "已取消收藏",
    },
    "en": {
        "title": "Between Us · 在我們之間",
        "subtitle": "A couples conversation card deck: 700 questions, 7 themes. Draw, flip, talk.",
        "all": "All",
        "favorites_only": "Favorites only",
        "search_placeholder": "Search questions…",
        "card_front_hint": "Tap to flip for hint",
        "card_back_hint": "Tap to flip back to question",
        "timer_title": "5-Minute Timer",
        "timer_prompt": "Five minutes for each other. One speaks, one listens.",
        "timer_start": "Start",
        "timer_pause": "Pause",
        "timer_reset": "Reset",
        "timer_end": "Time's up",
        "mute": "Mute",
        "unmute": "Unmute",
        "add_favorite": "Add to favorites",
        "remove_favorite": "Remove from favorites",
        "language": "Language",
        "next_question": "Next question",
        "drawer_btn": "Question Library",
        "drawer_title": "Question Drawer",
        "drawer_all": "All",
        "drawer_fav": "Favorites",
        "back_title": "Between Us",
        "back_quote": "Speak slowly, listen gently. There are no right answers.",
        "close": "Close",
        "keyboard_hint": "Space: Flip | →: Next | F: Favorite | T: Timer",
        "shuffle": "Shuffle",
        "deck_empty": "No questions in this category yet.",
        "load_from_drawer": "Pick a question from the drawer to load",
        "fav_added": "Added to favorites",
        "fav_removed": "Removed from favorites",
    },
}


def load_bank(locale):
    path = LANG_DIR / locale / "questions.json"
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def main():
    banks = {}
    for loc in LOCALES:
        banks[loc] = load_bank(loc)

    # Validate each locale has the 7 categories
    cats = ["vision", "soul", "finance", "intimacy", "fun", "growth", "faith"]
    for loc in LOCALES:
        missing = [c for c in cats if c not in banks[loc]]
        if missing:
            raise SystemExit(f"{loc} missing categories: {missing}")

    # Build the language bundle
    bundle = {}
    for loc in LOCALES:
        cat_list = []
        for c in cats:
            cat_list.append({
                "key": c,
                "label": CAT_LABELS[loc][c],
                "questions": banks[loc][c],
            })
        bundle[loc] = {
            "label": LABELS[loc],
            "ui": UI_STRINGS[loc],
            "categories": cat_list,
        }

    payload = json.dumps(bundle, ensure_ascii=False, indent=2)

    with open(TEMPLATE, encoding="utf-8") as f:
        html = f.read()

    with open(SRC / "app.js", encoding="utf-8") as f:
        app_js = f.read()

    assert "__ALL_LANGS_PAYLOAD__" in html, "__ALL_LANGS_PAYLOAD__ placeholder not found in template"
    html = html.replace("__ALL_LANGS_PAYLOAD__", payload)

    if "__APP_JS_PAYLOAD__" in html:
        html = html.replace("__APP_JS_PAYLOAD__", app_js)

    # Replace static {key} UI placeholders with default-locale (zh-TW) strings
    default_ui = bundle[LOCALES[0]]["ui"]
    for key, val in default_ui.items():
        html = html.replace("{" + key + "}", val)

    DIST.mkdir(parents=True, exist_ok=True)
    for out_path in (DIST / "index.html", ROOT / "index.html"):
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(html)

    for js_path in (DIST / "app.js", ROOT / "app.js"):
        with open(js_path, "w", encoding="utf-8") as f:
            f.write(app_js)

    total = sum(sum(len(banks[loc][c]) for c in cats) for loc in LOCALES)
    print(f"index.html {len(html.encode('utf-8'))} bytes, {total} questions across {len(LOCALES)} languages")
    for loc in LOCALES:
        print(f"  {loc} ({LABELS[loc]}):", {c: len(banks[loc][c]) for c in cats})


if __name__ == "__main__":
    main()
