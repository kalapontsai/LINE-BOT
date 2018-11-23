var CHANNEL_ACCESS_TOKEN = 'jZh9Peu7uqaHQVIRC3T73ZIQnJY8hNZmNqfbivb7Txv285Dksk2i2ziK8iudL2iav/vCzeCTiDzvbBMAlsw7hz38+Hr4B2s0NQ0opZzWJZZlTUSlRsnked3fgbhnq4wdB04t89/1O/w1cDnyilFU=';

//抓取IP位置
function doGet(e) {
  return ContentService.createTextOutput(UrlFetchApp.fetch("http://ip-api.com/json"));
}

//處理Line server傳進來訊息，再送出訊息到用戶端
function doPost(e) {
  var events = JSON.parse(e.postData.contents).events[0];
  var reply_token = events.replyToken;
  
  if (typeof reply_token === 'undefined') 
    return;
  
  var url = 'https://api.line.me/v2/bot/message/reply';
  
  var header = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
  }

  var payload = {
    'replyToken': reply_token,
    'messages' : ProcMsg(events.message,events.source.userId)
  }
  
  var options = {
    'headers': header,
    'method': 'post',
    'payload': JSON.stringify(payload)
  }
  
  UrlFetchApp.fetch(url, options);

  return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
}

function id_process(cmd,uid) 
{
  var url = 'https://docs.google.com/spreadsheets/d/TvVd2VfwR-ez0/edit?usp=sharing';
  var Sheet = SpreadsheetApp.openByUrl(url);
  var St = Sheet.getSheetByName('工作表1');
  var lastRow = St.getLastRow();
  //var user_id = St.getSheetValues(1,1,1,1);
  var result = '';
  var temp = '';
  switch (cmd)
  {
    case 'getid':
      for (row=1;row <= lastRow;row++)
      {
        if ( uid === String(St.getSheetValues(row,1,1,1)))
        {
          result = uid;
          break;
        }
      }
      if (result == '')
      {
        result = '此帳號未登錄,請先輸入[id add]';
      }
      break;
    case 'add':
      //sheet.appendRow(["a man", "a plan", "panama"]);
      for (row=1;row <= lastRow;row++)
      {
        if ( uid === String(St.getSheetValues(row,1,1,1)))
        {
          result = '你的ID已經登錄過';
          break;
        }
      }
      if (result =='')
      {
        St.appendRow([uid]);
        lastRow = St.getLastRow();
        if ( uid === String(St.getSheetValues(lastRow,1,1,1)))
        {
          result = '登錄成功'  ;
        }
        else 
        {
          result = '登錄失敗,請通知admin';
        }
      }
      break;
    case 'del':
      //deleteRows(rowPosition, howMany)
      //int rowPosition:The position of the first row to delete
      //int howMany:The number of rows to delete.
      for (row=1;row <= lastRow;row++)
      {
        if ( uid === String(St.getSheetValues(row,1,1,1)))
        {
          St.deleteRows(row,1);
          result = '登錄已移除';
          break;
        }
      }
      if (result == '')
      {
        result = '此帳號未登錄,無法刪除';
      }
      break;
    default :
      result = '指令錯誤\r\n查詢id:id getid\r\n登錄新帳號:id add\r\n刪除登錄:id del';
  }
  return result
}

function ProcMsg(message,id)
{ var type = message.type;
  var retMsg;
  switch(type)
  {
    case 'text':
      var feed_txt = '';
      //id_process(key.split(' ')[1],uid);
      if (message.text.split(' ')[0] == 'id' && message.text.split(' ')[1] != undefined)
      {
        feed_txt = id_process(message.text.split(' ')[1],id);
      }
      if (message.text == 'home')
      {
          var TS_data = JSON.parse(UrlFetchApp.fetch('https://api.thingspeak.com/channels/xxxxx/feeds.json?results=2'));
          var t_time = TS_data.feeds[1].created_at;
          var temp = TS_data.feeds[1].field6.replace("\r\n\r\n", "");
          var humi = TS_data.feeds[1].field2;
          var pm = TS_data.feeds[1].field3;
        feed_txt = '溫度 : ' + temp + '\r\n濕度 : ' + humi + '\r\nPM2.5 : ' + pm + '\r\n\r\nTime : ' + t_time;
      }

      if (message.text == 'roll')
      {
          feed_txt = Math.floor(Math.random() * 10);
      }

      //if (message.text.slice(0,1) == '.')
      //{
      if(feed_txt.length < 1)
      {
          var row = JSON.parse(UrlFetchApp.fetch('https://opendata.epa.gov.tw/ws/Data/AQI/?$format=json'));
          //var site = message.text.slice(1,message.text.length)
          for (i=0;i < row.length;i++)
          {
            if (row[i].SiteName == message.text)
            {
              var Status = row[i]['Status'];
              var Pollutant = row[i]['Pollutant'];
              var AQI = row[i]['AQI'];
              var pm25 = row[i]['PM2.5'];
              var pm10 = row[i]['PM10'];
              feed_txt = message.text + ':\r\n狀態 : ' + Status + ':\r\n污染物 : ' + Pollutant + ':\r\nAQI : ' + AQI + '\r\nPM2.5 : ' + pm25 + '\r\nPM10 : ' + pm10;
            }
          }
          if (feed_txt.length < 1)
          { 
            feed_txt = '查無此站名\r\n 請確認站點中文名稱';
          }
      }

      if (feed_txt == ''){ feed_txt = '查空氣品質站台\r\n直接輸入站名\r\n例如:臺南'; };

      retMsg = {
         'type': type,
         'text': feed_txt
       };
    break;
      
    case 'image':
         retMsg = {
           'type': type,
         };
    break;
      
    case 'sticker':
         retMsg = {
           'type': type,
           'packageId': message.packageId,
           'stickerId': message.stickerId            
         };
    break;   
  }
  return [retMsg];
}

function check_AQI() {
  var row = JSON.parse(UrlFetchApp.fetch('https://opendata.epa.gov.tw/ws/Data/AQI/?$format=json'));
  for (i=0;i < row.length;i++)
  {
    if (row[i].SiteName == '臺南')
    {
      var Status = row[i]['Status'];
      var Pollutant = row[i]['Pollutant'];
      var AQI = row[i]['AQI'];
      var pm25 = row[i]['PM2.5'];
      var pm10 = row[i]['PM10'];
      feed_txt = '臺南:\r\n狀態 : ' + Status + ':\r\n污染物 : ' + Pollutant + ':\r\nAQI : ' + AQI + '\r\nPM2.5 : ' + pm25 + '\r\nPM10 : ' + pm10;
    }
  }
  
  if ((pm25 >= 10) || (AQI >= 10)) {
    //var user_id = 'U924ff137f6c5ab151680096b81e7ef80';
    var sheet = 'https://docs.google.com/spreadsheets/d/1eXCTvVd2VfwR-ez0/edit?usp=sharing';
    var sheet_name = '工作表1'
    var SpreadSheet = SpreadsheetApp.openByUrl(sheet);
    var St = SpreadSheet.getSheetByName(sheet_name);
    var lastRow = St.getLastRow();
    var url = 'https://api.line.me/v2/bot/message/push';
    //getSheetValues(startRow, startColumn, numRows, numColumns)
    for (row=1;row <= lastRow;row++)
    {
      user_id = String(St.getSheetValues(row,1,1,1));

      UrlFetchApp.fetch(url, {
        'headers': {
          'Content-Type': 'application/json; charset=UTF-8',
          'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
        },
        'method': 'post',
        'payload': JSON.stringify({
          'to': user_id,
          'messages': [{
            type:'text',
            text: feed_txt
          }]
        }),
      });
    }
  }
}