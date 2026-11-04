# iOS App Store 上架完整手冊與素材指南 · 在我們之間 Between Us

這份文件為「在我們之間 (Between Us)」量身打造，涵蓋本機打包步驟、App Store Connect 後台欄位直接複製範本、隱私與年齡問卷指引，確保 100% 順暢通過 Apple 官方審核。

---

## 🚀 第一部分：建置與上傳

> `ios/` 為 `expo prebuild` 產生的資料夾（已被 gitignore），**不要直接信任舊的 `ios/` 內容**（例如版本號可能過期）。請用以下任一方式，從 `app.json` 重新產生。

### 方式 A：EAS Build（建議）
```bash
npm i -g eas-cli && eas login
eas build --platform ios --profile production
eas submit --platform ios --profile production   # 首次需填入 Apple ID / ASC App ID / Team ID
```
`eas.json` 使用 `appVersionSource: remote`，build number 由 EAS 自動遞增。

### 方式 B：本機 Xcode
```bash
npx expo prebuild --clean --platform ios
open ios/BetweenUs.xcworkspace
```
在 **Signing & Capabilities** 選擇你的 Team，Bundle Identifier 為 `com.lovebetweenus.app`；
選擇 **Any iOS Device (arm64)** → **Product → Archive** → **Distribute App → App Store Connect → Upload**。

### 送審前檢查清單
- [ ] Apple Developer Program 已啟用；App Store Connect 已建立 App
- [ ] 建立 IAP 商品，Product ID 與 `functions/api/payment/_lib.js` 的 `STORE_ITEMS` key 完全一致（`pack_sensual`、`pack_marriage`、`pack_parenting`、`skin_noir_gold`、`skin_rose_wine`、`skin_forest_sage`、`bundle_skins`、`tip_coffee`、`tip_afternoon`）；贊助項目（`tip_*`）設為 Consumable，其餘 Non-Consumable
- [ ] App Store Connect → Integrations → In-App Purchase 產生 API Key，設定 Cloudflare 變數 `APPLE_IAP_ISSUER_ID`、`APPLE_IAP_KEY_ID`、`APPLE_IAP_PRIVATE_KEY`
- [ ] Apple 登入（程式已完成）：在 Apple Developer 為 App ID 啟用 *Sign in with Apple*（EAS 會自動同步）。要在刪除帳號時撤銷 Apple 授權，另建一把 *Sign in with Apple* Key，設定 `APPLE_TEAM_ID`、`APPLE_SIGNIN_KEY_ID`、`APPLE_SIGNIN_PRIVATE_KEY`
- [ ] Google 登入（選填，程式已完成）：在 Google Cloud 建立 OAuth Client（類型 iOS，Bundle ID `com.lovebetweenus.app`），把 Client ID 設為 `GOOGLE_CLIENT_IDS`（Cloudflare）與 `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`（EAS 環境變數）。未設定時只顯示 Apple 登入
- [ ] 以 TestFlight + Sandbox 帳號實機測試：購買、恢復購買、Apple 登入、刪除帳號
- [ ] 確認 Apple 目前要求的最低 Xcode / iOS SDK 版本，必要時升級 Expo SDK
- [ ] 填寫隱私問卷、年齡分級、審核備註（見第三部分）

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
  ✦ 隱私優先：免註冊即可使用免費功能、無廣告、無第三方追蹤；收藏與偏好保存在您的裝置本機，帳號為選填，並可在 App 內隨時刪除。
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
  ✦ Privacy First: No ads, no third-party tracking, and no account required for free features. Favorites stay on your device; an optional account can be deleted in-app at any time.
  ✦ Calming Dual Themes: Tailored light and dark modes designed for quiet evening conversations.
  ```

---

## 🔒 第三部分：合規網址與問卷填寫指南

在 App Store Connect 送審時，系統會要求填寫以下資訊：

### 1. 必填網址（部署後生效）
- **隱私權政策網址 (Privacy Policy URL)**：
  👉 `https://between-us.ark-studio.app/privacy`
- **技術支援網址 (Support URL)**：
  👉 `https://between-us.ark-studio.app/support`
- **行銷網址 (Marketing URL，選填)**：
  👉 `https://between-us.ark-studio.app`

### 2. App 隱私問卷 (App Privacy Nutrition Label)
本 App **有**收集資料，不可選「Data Not Collected」。請如實勾選（需與 `app.json` 的 `ios.privacyManifests` 一致）：

| 資料類型 | 是否連結到使用者 | 用於追蹤 | 用途 |
|---|---|---|---|
| Contact Info → Email Address | 是 | 否 | App Functionality（帳號、跨裝置同步） |
| Identifiers → User ID | 是 | 否 | App Functionality |
| Purchases → Purchase History | 是 | 否 | App Functionality（恢復購買） |
| Usage Data → Product Interaction（匿名裝置編號、時長、平台） | 否 | 否 | Analytics（可在 App 內關閉） |

- 「Do you use data for tracking?」→ **否**（無廣告 SDK、不與第三方共享）。
- 不需要 ATT（App Tracking Transparency）提示。

### 3. 年齡分級 (Age Rating)
- 「深夜私語」「親密與浪漫」等題包含性相關話題，請在問卷中如實填寫「成熟/暗示性主題」，**不要低報**；預期分級會高於 12+（約 17+/18+，以 Apple 問卷結果為準）。
- 暴力、賭博、藥物等勾選「無」。

### 3.1 審核備註 (App Review Notes)
- 提供一組**測試用 Email 帳號與密碼**，讓審核員能測試登入、恢復購買、刪除帳號。
- 說明：免費功能無須登入；購買使用 Apple 應用程式內購買（IAP）；刪除帳號位於「帳號」頁面。

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
