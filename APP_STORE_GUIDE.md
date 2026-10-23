# iOS App Store 上架完整手冊與素材指南 · 在我們之間 Between Us

這份文件為「在我們之間 (Between Us)」量身打造，涵蓋本機打包步驟、App Store Connect 後台欄位直接複製範本、隱私與年齡問卷指引，確保 100% 順暢通過 Apple 官方審核。

---

## 🚀 第一部分：本機 Xcode 打包與上傳（無需 EAS）

由於你使用 Mac 且本機已配置 Xcode 與 CocoaPods，你可以直接在本機編譯並上傳，免去任何雲端等待。

### 步驟 1：開啟 Xcode 專案工作區
在專案根目錄終端機執行：
```bash
open ios/BetweenUs.xcworkspace
```
*(注意：務必打開 `.xcworkspace`，而非 `.xcodeproj`)*

### 步驟 2：配置開發者帳號與簽名 (Signing)
1. 在 Xcode 左側導覽列，點擊最頂端的 **BetweenUs** 專案圖示。
2. 在中間面板選擇 Target：**BetweenUs**。
3. 切換到頂部的 **Signing & Capabilities** 標籤。
4. 勾選 **Automatically manage signing**。
5. 在 **Team** 下拉選單中，選擇你的 Apple 開發者帳號（若未登入，點選 *Add an Account...* 登入你的 Apple ID 即可）。
6. Bundle Identifier 確認為：`com.lovebetweenus.app`。

### 步驟 3：封存 (Archive) 與一鍵上傳
1. 在 Xcode 頂部視窗中央的「執行目標設備」選單，將原本的模擬器切換為：
   👉 **Any iOS Device (arm64)**
2. 點選頂部工具列：**Product -> Archive**。
3. 等待 Xcode 本機編譯完成後，會自動彈出 **Organizer** 視窗。
4. 點選右側的藍色按鈕 **Distribute App**。
5. 選擇 **App Store Connect** -> 點選 **Upload**。
6. 後續選項維持預設值（自動管理憑證、發布符號等），一路點選 **Next** 並按下 **Upload**。
7. 上傳完成後，約 5~15 分鐘即可在 [App Store Connect](https://appstoreconnect.apple.com) 後台的 TestFlight 看到該版本！

---

## 📝 第二部分：App Store Connect 商店文案（直接複製使用）

### 1. 繁體中文（台灣 / 香港）
- **App 名稱**：`在我們之間 · Between Us`
- **副標題（Subtitle，30 字以內）**：`情侶雙人真心話卡牌，深度對話沙龍`
- **關鍵字（Keywords，100 字元，逗號分隔）**：
  `情侶,真心話,卡牌,深度交流,戀愛話題,破冰,交往,婚姻,伴侶,情感,關係,抽卡,話題庫`
- **宣傳文字（Promotional Text）**：
  `700 道精選靈魂題目、7 大主題分類，放下手機，給彼此五分鐘好好說話。`
- **詳細描述（Description）**：
  ```text
  「在我們之間」是一款專為伴侶、情侶與摯友設計的雙人深度對話卡牌 App。

  在快節奏的日常生活中，我們常常談論行程、家務與生活瑣事，卻很久沒有好好聊聊彼此的內心世界。

  【核心特色】
  ✦ 700 道精心撰寫的話題：涵蓋「價值與未來」、「靈魂與內心」、「金錢與生活」、「親密與浪漫」、「趣味與童心」、「個人成長」與「信念與世界觀」。
  ✦ 沉浸式擬真 3D 翻牌體驗：像實體卡牌一樣翻轉，每一張牌背面都附有溫暖的引導心法。
  ✦ 5 分鐘專注傾聽計時器：一人專注分享、一人純粹聆聽，學習不打斷、不評判的溝通藝術。
  ✦ 極致隱私承諾：無使用者帳號、不收集任何個人身分資料、無第三方廣告追蹤，所有收藏與設定純粹保存在您的裝置本機。
  ✦ 深淺色模式與優雅字型：專為夜晚睡前床頭談心設計的暖色與暗色模式。

  慢慢說，慢慢聽。在我們之間，沒有標準答案。
  ```

### 2. 英文（English - US / Global）
- **App Name**：`Between Us: Couple Questions`
- **Subtitle**：`Deep questions for couples`
- **Keywords**：
  `couple questions,relationship,conversation starters,dating cards,deep talk,intimacy,couples games`
- **Description**：
  ```text
  "Between Us" is an intimate conversation card deck designed for couples and partners to reconnect on a deeper level.

  【Key Features】
  ✦ 700 Curated Thought-Provoking Questions: Across 7 meaningful categories—Values & Future, Soul & Inner Self, Finances, Intimacy, Fun & Play, Growth, and Faith.
  ✦ Tactile 3D Card Flipping: Experience the warmth of physical cards with reflective prompts on the reverse.
  ✦ 5-Minute Active Listening Timer: Practice true listening without interruption.
  ✦ Absolute Privacy: Zero personal data collected, no account required, no ad tracking. Everything stays on your device.
  ✦ Calming Dual Themes: Tailored light and dark modes designed for quiet evening conversations.
  ```

---

## 🔒 第三部分：合規網址與問卷填寫指南

在 App Store Connect 送審時，系統會要求填寫以下資訊：

### 1. 必填網址（已部署生效）
- **隱私權政策網址 (Privacy Policy URL)**：
  👉 `https://love-between-us.pages.dev/privacy`
- **技術支援網址 (Support URL)**：
  👉 `https://love-between-us.pages.dev`
- **行銷網址 (Marketing URL，選填)**：
  👉 `https://love-between-us.pages.dev`

### 2. App 隱私問卷 (App Privacy Nutrition Label)
- 當系統詢問「您或您的第三方合作夥伴是否會從此 App 收集資料？」：
  👉 **選擇「否，我們不收集任何資料 (Data Not Collected)」**。
  *(因本 App 無任何追蹤 SDK，所有收藏與偏好皆存在本機 AsyncStorage)*

### 3. 年齡分級 (Age Rating)
- 在問卷中，各項暴力、賭博、藥物等均勾選「無 (None)」。
- 在「成熟/暗示性內容 (Mature/Suggestive Themes)」或「性內容」項目中：
  - 勾選 **「偶爾/輕微 (Infrequent/Mild)」**（因為包含「親密與浪漫」類型的戀愛/情感對話話題）。
  - 系統最終分級會落在 **12+**，可順利在全球各區上架。

### 4. 螢幕截圖需求
- **必備**：**6.7 吋 iPhone**（例如 iPhone 16 Pro Max / 15 Pro Max 截圖，1290 x 2796 像素）。
- **建議截圖畫面**（可直接在 Simulator 執行 Command+S 截圖）：
  1. 首頁翻牌卡片正面（展示大字體與質感排版）
  2. 卡片翻面背面的引導小語
  3. 題庫抽屜選單（展示 700 題分類與搜尋）
  4. 5 分鐘專注對話計時器畫面
  5. 深色模式畫面（展示夜間床頭談心氛圍）

---

祝上架順利！若有任何 Xcode 憑證或審查回覆問題，可隨時提出討論。
