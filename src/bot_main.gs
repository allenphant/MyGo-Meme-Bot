/**
 * MyGO Meme Bot - Main Webhook Logic
 * Handle LINE messaging events and search logic.
 */

// ==========================================
// ⚙️ 環境變數設定 (請至 Project Settings 設定或直接填入)
// ==========================================

// LINE Channel Access Token
var CHANNEL_ACCESS_TOKEN = 'YOUR_CHANNEL_ACCESS_TOKEN'; 

// Google 試算表 ID
var SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';

// Google Drive 圖片資料夾 ID
var IMAGE_FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID';

// 搜尋結果最大顯示數量
var MAX_RESULTS = 15; // 建議設小一點避免洗版，原設定 150 太多了

// ==========================================
// 🚀 主程式 Entry Point
// ==========================================

function doPost(e) {
  // console.log('🔥 收到請求');
  try {
    var msg = JSON.parse(e.postData.contents);
    var replyToken = msg.events[0].replyToken;
    var userMessage = msg.events[0].message.text;

    if (typeof replyToken === 'undefined') {
      return;
    }

    // 讀取資料庫
    var app = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = app.getSheets()[0]; 
    var data = sheet.getDataRange().getValues();

    // 管理員指令：從聊天室觸發同步
    if (userMessage === 'sync_db_admin') {
      handleSync(replyToken, sheet);
      return;
    }

    // 判斷是 ID 搜尋還是關鍵字搜尋
    // 假設 ID 格式為 a0000 這種英數組合
    if (userMessage.match(/^[a-zA-Z]\d{4}$/)) {
      handleGetImageById(replyToken, userMessage, data);
    } else {
      handleSearch(replyToken, userMessage, data);
    }

  } catch (error) {
    console.error('❌ 發生錯誤:', error);
  }
}

// ... (以下為搜尋邏輯與 Line API 呼叫函式，保持原本邏輯即可) ...

function handleSearch(replyToken, keyword, data) {
  var results = [];
  // 從第 2 列開始 (避開標題)
  for (var i = 1; i < data.length; i++) {
    var id = data[i][0];
    var tags = data[i][1];
    if (tags.toString().indexOf(keyword) > -1) {
      results.push(id + " : " + tags);
    }
  }

  if (results.length === 0) {
    replyText(replyToken, "找不到關於「" + keyword + "」的 MyGO 截圖 😢");
  } else {
    var replyMsg = "🔍 搜尋「" + keyword + "」的結果：\n\n";
    var displayCount = Math.min(results.length, MAX_RESULTS);
    for (var k = 0; k < displayCount; k++) {
      replyMsg += results[k] + "\n";
    }
    replyMsg += "\n👉 請輸入 ID 來獲取圖片！";
    replyText(replyToken, replyMsg);
  }
}

function handleGetImageById(replyToken, targetId, data) {
  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString() == targetId.toString()) {
      var content = data[i][2]; 
      var type = data[i][3];    
      if (type == 'image') {
        // Line 有時需要明確的副檔名結尾才能預覽
        replyImage(replyToken, content + "&.jpg");
      } else {
        replyText(replyToken, data[i][1]);
      }
      return;
    }
  }
  replyText(replyToken, "找不到這個 ID 耶 🤔");
}

// 同步邏輯 (Chat Trigger 版本)
function handleSync(replyToken, sheet) {
  try {
    var folder = DriveApp.getFolderById(IMAGE_FOLDER_ID);
    var files = folder.getFiles();
    var output = [];
    while (files.hasNext()) {
      var file = files.next();
      var url = "https://drive.google.com/uc?export=view&id=" + file.getId();
      var name = file.getName(); 
      // 簡單解析檔名 ID_Tag.jpg
      var parts = name.split('_');
      if (parts.length >= 2) {
          output.push([parts[0], parts[1].split('.')[0], url, 'image']);
      }
    }
    if (output.length > 0) {
      // 清空舊資料 (保留標題) 並寫入
      sheet.getRange(2, 1, sheet.getLastRow(), 4).clearContent(); 
      sheet.getRange(2, 1, output.length, 4).setValues(output);
      replyText(replyToken, "✅ 資料庫同步完成！");
    }
  } catch (e) {
    replyText(replyToken, "❌ 同步失敗: " + e.toString());
  }
}

// API Call Helpers
function replyText(replyToken, text) {
  callLineApi({'replyToken': replyToken, 'messages': [{'type': 'text', 'text': text}]});
}
function replyImage(replyToken, url) {
  callLineApi({'replyToken': replyToken, 'messages': [{'type': 'image', 'originalContentUrl': url, 'previewImageUrl': url}]});
}
function callLineApi(payload) {
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    'headers': {'Content-Type': 'application/json; charset=UTF-8', 'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN},
    'method': 'post', 'payload': JSON.stringify(payload)
  });
}