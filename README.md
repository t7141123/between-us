# 在我們之間 · Between Us

雙人對話沙龍：700 個問題、7 個主題，抽卡、翻面、好好說話。

零依賴單檔 SPA（`index.html`），部署於 Cloudflare Pages，適合情侶、夫妻或親密關係的兩人一起使用。

## 線上網址
👉 https://between-us-72v.pages.dev

## 這個專案是什麼？

「在我們之間」是一款專為兩人關係設計的對話卡片應用。內建 700 個精心編寫的問題，涵蓋七個主題：

- **價值與未來**（100 題）—— 未來規劃、人生目標、家庭價值觀
- **心靈與情緒**（100 題）—— 情感需求、內心世界、情緒連結
- **家庭理財**（100 題）—— 金錢觀念、預算、財務規劃
- **親密與連結**（100 題）—— 親密關係、浪漫、身心連結
- **日常與陪伴**（100 題）—— 休閒、共同興趣、生活細節
- **成長與對話**（100 題）—— 溝通、衝突處理、關係成長
- **基督信仰**（100 題）—— 信仰生活、禱告、靈命成長

適用於約會夜、夫妻對話、婚前輔導、或任何想要加深兩人關係的場合。

## 主要功能

- **抽卡翻面**：點擊卡片 3D 翻轉，正面顯示題目與編號，背面顯示封面與提示
- **分類篩選**：七個主題晶片，可單獨選擇或全部顯示
- **收藏夾**：將喜歡的問題加入收藏，持久儲存在 localStorage
- **題庫抽屜**：模糊搜尋所有問題，支援「僅看收藏」過濾，點擊自動切換分類
- **5 分鐘計時器**：視窗計時器與結束音效，適合限時對話
- **音效開關**：Web Audio 音效與靜音切換
- **紙屑彩帶**：完成對話後的慶祝效果
- **鍵盤操作**：空白鍵翻面、→ 換題、F 收藏、T 計時器
- **行動優先響應式**：手機與桌面皆適配

## 專案結構

```
index.html              最終產出單檔 SPA（題庫已內嵌，可直接開啟或部署）
index.template.html     版型來源（__QUESTIONS__ 為題庫佔位符）
questions.json          題庫資料（700 題，7 個分類各 100 題）
build_bank.py           產生 questions.json（題庫來源與切分）
build_site.py           將 questions.json 注入版型，產生 index.html 與 dist/
validate.py             題庫驗證（總數、分類、重複、禁用主題、長度）
dist/                   部署載荷（僅包含 index.html）
```

## 重新建置與部署

```bash
# 1. 產生題庫（700 題，7 類各 100 題）
python3 build_bank.py

# 2. 產生單檔 SPA
python3 build_site.py

# 3. 驗證題庫
python3 validate.py

# 4. 部署到 Cloudflare Pages（需設定 CLOUDFLARE_ACCOUNT_ID）
CLOUDFLARE_ACCOUNT_ID=4a9d7d8a3cf4e6361ff78b54e157881c \
  npx wrangler pages deploy dist --project-name between-us --branch main
```

## 技術說明

- 零依賴：僅使用 CDN 引入 Tailwind CSS、Lucide 圖示與 canvas-confetti
- 資料儲存：僅使用 localStorage（收藏、靜音、分類偏好等），不需後端或資料庫
- 部署：Cloudflare Pages 靜態託管
- 授權：公開原始碼，歡迎 Fork 與貢獻

## 授權

MIT License
