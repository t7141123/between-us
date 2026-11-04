# 在我們之間 · Between Us

以最新版 **Expo SDK 58** 與 **React Native (`0.88`)** 建構的跨平台雙人對話沙龍應用，支援單一 TypeScript 程式碼庫同時發佈至 **iOS (App Store)**、**Android (Google Play)** 及 **Web (Cloudflare Pages)**。

精選 **1050 道權威深度對話問題**（3 種語言 × 7 個核心主題 × 各 50 題，全數附帶心理學深度傾聽引導）、**3 款專題擴充包**（深夜私語、婚姻誓約前夕、新生兒與新手父母），並具備 **純 Cloudflare 原生架構** 的跨平台帳號與全通路購買權益互通。

---

## 🌟 核心特色與亮點

- **全平台一致體驗**：單一 TypeScript 程式碼庫，無縫適配 iOS、Android 與 Web，兼顧桌面快捷鍵（空白鍵翻牌、箭頭換題）與手機原生手勢。
- **純 Cloudflare 原生後端架構**：
  - 基於 **Cloudflare Pages Functions** 與 **Cloudflare D1** 輕量關聯式資料庫。
  - **三合一安全認證**：支援 **Email + 密碼（PBKDF2-SHA256 10 萬次雜湊）**、**Apple 登入**、**Google 登入**。
  - **HMAC-SHA256 Session 防偽簽章**：嚴密防範 IDOR 越權存取與時序旁路攻擊。
- **全平台購買權益 100% 互通（Cross-Platform Entitlements）**：
  - **購買前強制登入攔截（Auth Gate before Checkout）**：平時抽卡 100% 免登入（符合 Apple 審核規範）；點擊購買時引導登入/註冊，登入後自動智慧接續結帳確認框。
  - **雙軌金流雙向歸戶**：Web 端走 **綠界 ECPay**、App 端支援 **StoreKit / Google Play Billing 原生 IAP**，只要登入同一個帳號，在任一平台購買的擴充包或卡背主題，全平台裝置自動同步解鎖！
- **雙人即時同步連線（Room Sync）**：雙手機輸入 4 位數房間代碼即可即時配對；支援跨分類題庫連動、雙向翻面絕對對齊，以及系統原生分享（AirDrop / LINE / iMessage）。
- **3D 流暢卡片與換題過場**：支援 60fps Y 軸翻牌動效、正面雙層微光邊框、背面心理學深度傾聽引導，以及溫潤的文字淡入位移過場（Fade + Slide）。
- **雙色質感設計與手動切換**：精心調配淺色（溫暖紙感 `#FAF7F2`）與深色（夜談護眼 `#141312`）雙色主題，支援選單內隨時一鍵手動切換與系統外觀自動感應。
- **5 分鐘深度計時器**：浮層倒數、等寬字型顯示、時間結束和弦音效與彩紙慶祝動效。
- **極致隱私保護**：無第三方廣告追蹤 SDK、嚴格最小權限原則，本機收藏與設定透過安全加密儲存。

---

## 📁 專案模組化結構

```
between-us/
├── app.json                  # Expo 跨平台配置、版本號 (1.2.0) 與權限管理
├── eas.json                  # EAS Build 商店建置自動化設定
├── package.json              # 專案相依與 npm 自動化指令
├── tsconfig.json             # 嚴格 TypeScript 設定
├── .eslintrc.js              # ESLint 程式碼品質規範
├── APP_STORE_GUIDE.md        # App Store 上架手冊與審核指南
├── assets/                   # 上架專用圖標 (1024x1024) 與啟動畫面
├── public/                   # 靜態 PWA 資源、隱私政策、_headers、_redirects
├── functions/                # Cloudflare Pages Functions 後端無伺服器 API
│   ├── api/
│   │   ├── auth/             # 認證 API (Email+密碼登入/註冊、OAuth、帳號刪除)
│   │   ├── payment/          # 綠界 ECPay 收銀台、訂單驗證、原生 IAP 登記
│   │   ├── room/             # 雙人即時連線 (建立、加入、同步、輪詢)
│   │   ├── sync/             # 跨平台雲端權益同步 (擴充包、卡背、支持者)
│   │   └── track.js          # 隱私友善匿名統計
│   └── _middleware.js        # 安全回應標頭與全域防護
├── src/
│   ├── locales/              # 獨立三語系檔案 (zh-TW, zh-CN, en) 各 350 題 + 引導
│   ├── components/           # 模組化 UI 元件 (Card3D, StoreModal, RoomModal, AuthModal, MenuModal 等)
│   ├── hooks/                # 自訂 Hooks (主題切換、音效播放、觸覺震動)
│   ├── services/             # 前端服務層 (i18n、auth、payment、room、storage、telemetry)
│   ├── constants/            # 設計 Tokens、擴充包定義、分類清單、跨平台 API 路徑
│   ├── types/                # TypeScript 型別宣告
│   └── App.tsx               # 應用主架構與狀態協調器
└── scripts/
    ├── validate-locales.js   # 1050 題題庫與擴充包格式完整性校驗腳本
    └── postbuild.js          # Web 建置後 PWA 與 Meta 標籤注入腳本
```

---

## 🚀 快速上手與本地開發

### 1. 安裝相依套件

```bash
npm install
```

### 2. 本地執行

```bash
# 啟動網頁版開發伺服器 (瀏覽器預覽)
npm run web

# 啟動 Expo 開發伺服器 (使用 Expo Go 掃描 QR Code)
npm start

# 在 iOS 模擬器中執行 (需 macOS 與 Xcode)
npm run ios

# 在 Android 模擬器中執行
npm run android
```

---

## 🛠️ 品質檢驗指令

提交程式碼或發布前，請執行以下三道嚴格檢驗：

```bash
# 1. TypeScript 型別檢查
npm run typecheck

# 2. ESLint 程式碼規範檢查
npm run lint

# 3. 1050 題核心題庫與專題包完整性校驗
npm run validate
```

---

## 📦 發布與部署流程

### 1. Web 部署至 Cloudflare Pages（一鍵部署）

專案已配置標準一鍵打包與部署指令：

```bash
npm run deploy:web
```

> **背後執行步驟：**
> 1. `npm run build:web`：調用 Metro 將 React Native Web 輸出為靜態產物至 `dist/`，並自動複製 `_headers`、`_redirects` 與執行 `postbuild.js` 注入 PWA 標籤。
> 2. `npx wrangler pages deploy dist --project-name love-between-us --branch main`：將產物與 `functions/` 後端 API 部署至 Cloudflare Pages 全球邊緣網路。

#### 💡 Cloudflare 後台環境變數設置（正式站）
* **`AUTH_SECRET`**：HMAC-SHA256 防偽簽章密鑰（在 Cloudflare Pages Dashboard -> Settings -> Environment variables 設定為隨機字串）。

---

### 2. iOS App Store 上架

您可以選擇 **本機 Xcode 打包** 或 **EAS Build 雲端建置**：

#### 方法 A：本機 Xcode 打包（推薦，免雲端排隊）
```bash
open ios/BetweenUs.xcworkspace
```
* 切換目標為 **Any iOS Device (arm64)**。
* 點選 **Product -> Archive**，編譯完成後點選 **Distribute App -> App Store Connect -> Upload**。
* 詳細欄位複製範本請參閱 [`APP_STORE_GUIDE.md`](./APP_STORE_GUIDE.md)。

#### 方法 B：Expo EAS Build 自動化建置
```bash
eas build --platform ios --auto-submit
```

---

### 3. Android Google Play 上架

```bash
eas build --platform android --auto-submit
```

---

## 🔒 資安與隱私規範

1. **零危險權限原則**：`app.json` 未索取相機、麥克風、通訊錄或定位權限，100% 符合 App Store 與 Google Play 審查規範。
2. **密碼資安防線**：使用者密碼不以明文傳輸或儲存，後端以 Web Crypto API PBKDF2-SHA256 加密儲存於 Cloudflare D1。
3. **Session 防偽**：全面採用 HMAC-SHA256 Token 驗證請求身分，防止 IDOR 越權存取。
4. **GitHub 安全守則**：`.env`、金鑰（`*.keystore`、`*.p8`）均已自版本控管徹底排除。

---

## 📄 授權條款

MIT License
