# MyGO Meme Bot (BanG Dream! It's MyGO!!!!! 截圖搜尋器)

![Status](https://img.shields.io/badge/Status-Beta%20(2026)-yellow)
![Platform](https://img.shields.io/badge/Platform-LINE%20Bot-green)
![Backend](https://img.shields.io/badge/Backend-Google%20Apps%20Script-blue)
![Database](https://img.shields.io/badge/Database-Google%20Sheets-success)

## 🎸 專案緣起 (Intro)

> **「為什麼要演奏春日影！」**
> **"Why did you play Haruhikage?!"**

《BanG Dream! It's MyGO!!!!!》自播出以來，憑藉其沈重的人際關係描寫與胃痛劇情，在 ACG 圈內誕生了無數經典名言與梗圖。
身為一個忠實觀眾 (MyGOer)，常常在聊天時想用某張特定的截圖（例如爽世的沈重表情、燈的迷茫眼神），卻在相簿裡翻半天找不到。

於是我在 **2026 年初** 開發了這個 **MyGO Meme Bot**。
這是一個基於 LINE 的搜尋機器人，讓使用者輸入關鍵字（如：`春日影`, `一輩子`, `鬼屋`），就能快速召喚出對應的經典場景。

*(目前專案剛建立，尚未正式對外宣傳，處於早期測試階段)*

---

## 📸 功能展示 (Demo)

### 1. 關鍵字搜尋 & 圖片回傳
使用者輸入關鍵字後，機器人會從資料庫檢索相關標籤，並回傳對應的圖片 ID。
輸入 ID 即可獲得高畫質截圖（適合拿來做貼圖或戰術性回覆）。

![Bot Demo](docs/images/bot_demo_chat.png)

### 2. 輕量化後端 (Google Sheets as Database)
為了降低維護成本，我沒有架設傳統資料庫，而是使用 **Google Sheets** 搭配 **Google Drive**。
* **Google Drive**: 存放截圖檔案。
* **Google Sheets**: 記錄 `File_ID`, `Tag` (字幕內容), `URL`。
* **Auto-Sync**: 寫了一個 `sync` 腳本，只要我把圖片丟進 Drive，機器人會自動更新 Excel 列表，無需手動輸入。

![Database Preview](docs/images/database_preview.png)

---

## 🛠️ 技術架構 (Tech Stack)

這個專案主打 **Serverless** 與 **Zero Cost** (零成本) 部署：

* **Google Apps Script (GAS)**:
    * 接收 LINE Messaging API 的 Webhook (`doPost`)。
    * 處理邏輯判斷與關鍵字比對。
* **Google Sheets API**:
    * 充當關聯式資料庫 (Relational Database)，儲存圖片索引與標籤。
* **Google Drive**:
    * 作為圖床 (Image Hosting)，提供圖片的公開連結。

### 核心邏輯
1.  **User** 傳送文字訊息 -> **LINE Server**。
2.  LINE Server 觸發 Webhook -> **GAS Script**。
3.  GAS 讀取 **Google Sheet** 進行模糊搜尋。
4.  GAS 回傳結果列表或圖片 -> **User**。

---

## 🚀 如何部署 (Setup)

如果你也想做一個類似的「梗圖機器人」，可以參考以下步驟：

1.  **準備資料庫**：
    * 建立一個 Google Sheet，欄位包含 `ID`, `Tags`, `ImageURL`。
    * 建立一個 Google Drive 資料夾存放圖片。
2.  **建立 LINE Channel**：
    * 至 LINE Developers Console 申請 Messaging API。
    * 取得 `Channel Access Token`。
3.  **部署程式碼**：
    * 建立 Google Apps Script 專案。
    * 複製 `src/main.gs` 內容。
    * 填入你的 `TOKEN`, `SPREADSHEET_ID`, `FOLDER_ID`。
    * 發布為網頁應用程式 (Web App)，並將網址填回 LINE Webhook URL。
4.  **開始使用**：
    * 加入機器人好友，開始輸入關鍵字！

---