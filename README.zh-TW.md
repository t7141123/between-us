# 在我們之間 · Between Us

以最新版 **Expo SDK 52** 與 **React Native** 建構的跨平台雙人對話沙龍應用，支援單一 TypeScript 程式碼庫同時發佈至 **iOS (App Store)**、**Android (Google Play)** 及 **Web**。

精選 2100 個深度對話問題（3 種語言 × 7 個主題 × 各 100 題）。

---

## 🌟 核心特色

- **全平台支援**：從同一套 TypeScript 專案同時上架 iOS App Store、Android Google Play 以及部署 Web 網站。
- **獨立語系檔案架構**：繁中、簡中、英文採用獨立 JSON 檔案結構 (`src/locales/{zh-TW,zh-CN,en}.json`)，切換即時流暢。
- **雙色質感設計**：兼顧深色與淺色主題模式（陶土紅、紙感白、深炭灰、金箔金），支援系統外觀自動感應與手動開關。
- **3D 流暢卡片翻面**：支援 60fps Y 軸翻牌動效、雙層金箔微光邊框、以及滑動手勢換題。
- **觸覺震動回饋（Haptics）**：在手機端支援翻牌、收藏時的微震動回饋 (`expo-haptics`)。
- **5 分鐘深度計時器**：浮層倒數、等寬時間顯示、時間結束和弦音效與彩紙慶祝動畫。
- **題庫抽屜與即時搜尋**：支援 700 題全文即時檢索、主題篩選與收藏過濾。
- **資安防護零洩漏**：嚴格的最小權限原則（不索取相機、麥克風、定位等危險權限），嚴密 `.gitignore` 阻絕 GitHub 敏感金鑰外洩。

---

## 📁 簡潔模組化結構

```
between-us/
├── app.json                  # Expo 跨平台配置與權限管理
├── eas.json                  # EAS Build 商店建置自動化設定
├── package.json              # 專案相依與 npm 指令
├── tsconfig.json             # 嚴格 TypeScript 設定
├── .eslintrc.js              # ESLint 規範設定
├── .gitignore                # 資安專用忽略清單 (防金鑰外洩)
├── assets/                   # 上架專用圖標 (1024x1024) 與啟動畫面
├── src/
│   ├── locales/              # 獨立語系檔案 (UI 字串 + 各 700 題題庫)
│   │   ├── zh-TW.json        # 繁體中文
│   │   ├── zh-CN.json        # 簡體中文
│   │   └── en.json           # 英文
│   ├── components/           # 模組化 UI 元件
│   │   ├── Card3D.tsx        # 3D 翻轉對話卡片
│   │   ├── CategoryChips.tsx # 主題標籤導覽
│   │   ├── HeaderBar.tsx     # 頂部導航列 (語言、音效、外觀模式)
│   │   ├── DrawerModal.tsx   # 題庫搜尋抽屜
│   │   └── TimerModal.tsx    # 5 分鐘計時器彈窗
│   ├── hooks/                # 自訂 Hooks (主題、音效、觸覺)
│   ├── services/             # 服務層 (i18n、安全 AsyncStorage)
│   ├── constants/            # 設計色彩 Tokens 與分類常數
│   ├── types/                # TypeScript 型別宣告
│   └── App.tsx               # 應用主架構
└── scripts/
    └── validate-locales.js   # 題庫完整性校驗腳本
```

---

## 🚀 快速上手

### 安裝相依

```bash
npm install
```

### 本地開發

```bash
# 啟動 Expo 開發伺服器 (使用手機 Expo Go 掃描 QR Code)
npm start

# 在網頁瀏覽器中執行
npm run web

# 在 iOS 模擬器中執行 (需 macOS)
npm run ios

# 在 Android 模擬器中執行
npm run android
```

---

## 🛠️ 品質檢驗指令

```bash
# 1. TypeScript 型別檢查
npm run typecheck

# 2. ESLint 程式碼規範檢查
npm run lint

# 3. 2100 題題庫完整性與敏感詞校驗
npm run validate
```

---

## 📦 發布與部署流程

### 1. Web 部署 (Cloudflare Pages)

```bash
# 輸出靜態 Web 產物至 dist/
npm run build:web

# 部署至 Cloudflare Pages
npx wrangler pages deploy dist --project-name love-between-us --branch main
```

### 2. iOS App Store 上架 (透過 EAS Build)

```bash
# 1. 安裝 EAS CLI
npm install -g eas-cli

# 2. 登入 Expo 帳號
eas login

# 3. 建置並自動提交至 App Store Connect
eas build --platform ios --auto-submit
```

### 3. Android Google Play 上架 (透過 EAS Build)

```bash
# 建置 Android App Bundle (AAB) 並提交至 Google Play Console
eas build --platform android --auto-submit
```

---

## 🔒 資安與安全規範

1. **零多餘權限原則**：`app.json` 未宣告任何多餘危險權限，滿足 App Store / Google Play 審查規範。
2. **GitHub 安全防護**：`.env`、金鑰（`*.keystore`、`*.p8`）均已自版本控管永久排除。
3. **套件資安校驗**：相依套件經嚴格驗證，關鍵依賴維持高安全性。

---

## 📄 授權條款

MIT License
