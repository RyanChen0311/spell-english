# spell-english

> 聽單字、拼字母、讀翻譯 — 三段式語音英文單字學習工具

一個純瀏覽器的單字學習 App，核心功能是點一下 🔊 後：**完整朗讀單字 → 逐字母拼讀 → 念出中文翻譯**，透過反覆聽覺刺激加深記憶，完全不需要伺服器或 API Key。

---

## Live Demo

👉 https://ryanchen0311.github.io/learn_english_for_resite/

---

## 核心：三段式語音朗讀

這是 spell-english 與一般單字卡工具最大的不同：

```
點擊 🔊
    │
    ├─ 1. 朗讀完整單字        (en-US，自然語音)
    ├─ 2. 停頓 800 ms
    ├─ 3. 逐字母拼讀          (en-US，每字母間隔 300 ms)
    ├─ 4. 停頓 800 ms
    └─ 5. 念出中文翻譯        (zh-TW)
```

使用瀏覽器內建的 **Web Speech API**（`SpeechSynthesis`），無需任何外部服務。

---

## 功能

- **三段式語音朗讀** — 單字 → 逐字母拼讀 → 中文翻譯，強化聽覺記憶
- **自動例句** — 新增單字時自動從英漢字典 API 取得例句顯示於單字卡
- **自動拼字格式** — 新增單字時自動產生 `c • a • t` 格式顯示
- **離線可用** — 所有資料存於 `localStorage`，無需網路、重整不遺失
- **命名記錄** — 儲存、載入、刪除命名單字表（例如「Week 1」、「多益」）
- **鍵盤快捷** — 在任一輸入欄按 `Enter` 即可新增單字
- **手機適配** — RWD 設計，支援手機與桌機

---

## 自動例句

新增單字時，自動向 [Free Dictionary API](https://dictionaryapi.dev/) 查詢例句：

```
輸入 "cat" → Add Word
    │
    ├─ 查詢 API（約 0.5–1 秒）
    └─ 例句顯示於單字卡：📖 The cat sat on the mat.
```

- 無需 API Key，完全免費
- 查無例句時，單字照常新增，僅不顯示例句欄位

---

## Browser Support

| 瀏覽器 | 支援狀況 |
|---|---|
| Chrome / Edge | ✅ 完整支援 |
| Safari | ✅ 完整支援 |
| Firefox | ⚠️ 語音選擇受限 |

---

## 資料儲存

所有資料存在瀏覽器的 `localStorage`，不會傳送至任何伺服器：

| Key | 內容 |
|---|---|
| `vocabulary` | 當前單字表（JSON array） |
| `vocabulary_records` | 命名記錄（JSON object） |

---

## 本地執行

```bash
npx serve .
# 開啟 http://localhost:3000
```

無需 build、無需安裝，純 HTML / CSS / JS。

---

## 專案結構

```
spell-english/
├── index.html    # HTML 結構與單字卡 template
├── styles.css    # 版面與元件樣式（含 RWD）
└── script.js     # VocabularyManager — 全部應用邏輯
```

---

## License

MIT
