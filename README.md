# 在我們之間 · Between Us

雙人對話沙龍：700 個問題、7 個主題，抽卡、翻面、好好說話。
零依賴單檔 SPA（`index.html`），部署於 Cloudflare Pages。

## 線上網址
https://between-us-72v.pages.dev

## 專案結構
- `index.html` — 最終產出（可直接開啟或部署，題庫已內嵌）
- `index.template.html` — 版型（`__QUESTIONS__` 為題庫佔位符）
- `build_bank.py` — 題庫來源與切分（7 類各 100 題，共 700 題）
- `build_site.py` — 將 `questions.json` 注入版型，產生 `index.html` 與 `dist/`
- `questions.json` — 題庫資料
- `validate.py` — 題庫驗證（總數、分類、重複、禁用主題、長度）

## 重新建置與部署
```bash
python3 build_bank.py      # 產生 questions.json
python3 build_site.py      # 產生 index.html / dist/index.html
python3 validate.py        # 驗證題庫
CLOUDFLARE_ACCOUNT_ID=4a9d7d8a3cf4e6361ff78b54e157881c \
  npx wrangler pages deploy dist --project-name between-us --branch main
```

## 功能
分類篩選、3D 翻卡、收藏（localStorage）、題庫抽屜（模糊搜尋／僅看收藏）、
5 分鐘計時器、Web Audio 音效、紙片彩紙、音效開關、鍵盤操作（空白翻面、→ 換題、F 收藏、T 計時）。
