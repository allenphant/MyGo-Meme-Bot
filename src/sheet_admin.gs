/**
 * MyGO Meme Bot - Sheet Admin Tool
 * Container-bound script for Google Sheets UI.
 */

var IMAGE_FOLDER_ID = 'YOUR_DRIVE_FOLDER_ID'; 

// === 建立選單 ===
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('MyGO 機器人管理')
      .addItem('📥 從 Drive 同步圖片列表', 'syncImagesFromDrive')
      .addToUi();
}

// === 同步核心邏輯 ===
function syncImagesFromDrive() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var folder = DriveApp.getFolderById(IMAGE_FOLDER_ID);
  var files = folder.getFiles();
  var outputData = [];

  while (files.hasNext()) {
    var file = files.next();
    var filename = file.getName();
    var fileId = file.getId();
    
    // 轉換為 Direct Link
    var directLink = "https://drive.google.com/uc?export=view&id=" + fileId;
    
    // 解析檔名 (ID_Keyword.jpg)
    var nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
    var parts = nameWithoutExt.split('_');
    
    if (parts.length >= 2) {
      var id = parts[0];
      var keyword = parts[1];
      outputData.push([id, keyword, directLink, 'image']);
    } else {
      // 格式不符的檔案處理
      outputData.push(['Check_Name', filename, directLink, 'check']);
    }
  }
  
  // 寫入 Sheet
  if (outputData.length > 0) {
    // 從第 2 列開始覆寫，保留標題
    // 清除舊資料，避免殘留
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
       sheet.getRange(2, 1, lastRow - 1, 4).clearContent();
    }
    
    sheet.getRange(2, 1, outputData.length, 4).setValues(outputData);
    SpreadsheetApp.getUi().alert('✅ 同步完成！共 ' + outputData.length + ' 張圖片。');
  } else {
    SpreadsheetApp.getUi().alert('⚠️ 資料夾中沒有檔案。');
  }
}