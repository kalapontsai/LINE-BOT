// 20181204 revision init
var CHANNEL_ACCESS_TOKEN = 'LINE CHANNEL_ACCESS_TOKEN';
var id_sheet_url = 'id spreadsheet link';
var AQI_url = 'https://opendata.epa.gov.tw/ws/Data/AQI/?$format=json';
var AQI_row = JSON.parse(UrlFetchApp.fetch(AQI_url));
var acccca_url = 'acca spreadsheet link'

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

function ProcMsg(message,id)
{ var type = message.type;
  var retMsg;
  switch(type)
  {
    case 'text':
      var feed_txt = '';
      var cmd1 = String(message.text.split(' ')[0]);
      var cmd2 = String(message.text.split(' ')[1]);
      if ((cmd1 == 'id' || cmd1 == 'loc' ) && (cmd2 != 'undefined'))
      {
        feed_txt = id_process(cmd1,cmd2,id);
      }
      
      else if (cmd1 == 'crypt' || cmd1 == 'decrypt' )
      {
        if  (cmd2 != 'undefined'){
          feed_txt = Crypt(cmd1,cmd2);
        }
        else {
          feed_txt = '請加上要編/解譯的文字,不含空白';
        }
      }
      
      else if (cmd1 == 'acc')
      {
        if  (cmd2 != 'undefined'){
          feed_txt = acc(cmd2);
        }
        else {
          feed_txt = 'acc hostname';
        }
      }
      
      else if (cmd1 == 'home')
      {
          var TS_data = JSON.parse(UrlFetchApp.fetch('https://api.thingspeak.com/channels/73772/feeds.json?results=2'));
          var t_time = TS_data.feeds[1].created_at;
          var temp = TS_data.feeds[1].field6.replace("\r\n\r\n", "");
          var humi = TS_data.feeds[1].field2;
          var pm = TS_data.feeds[1].field3;
        feed_txt = '溫度 : ' + temp + '\r\n濕度 : ' + humi + '\r\nPM2.5 : ' + pm + '\r\n\r\nTime : ' + t_time;
      }

      else if (cmd1 == 'roll')
      {
          feed_txt = Math.floor(Math.random() * 10);
      }
      var check_code = (new RegExp("^[\\u4e00-\\u9fa5]{2}$")).test(message.text);
      if ((feed_txt.length < 1) && check_code)
      {
        var result = get_AQI(message.text);
        if (result){
          var emoji = '😊';
          if (result[3] >= 100)
          {
            emoji = '😷';
          }
          feed_txt = result[0] + ':\r\n狀態 : ' + result[1] + emoji + '\r\n污染物 : ' + result[2] + ':\r\nAQI : ' + result[3] + '\r\nPM2.5 : ' + result[4] + '\r\nPM10 : ' + result[5];
        }
        else { 
          feed_txt = '查無此站名😰\r\n 請確認站點中文名稱';
        }
      }

      if (feed_txt == ''){ 
        //feed_txt = cmd1 + '.' + cmd2 + '\r\n';
        feed_txt = '查空氣品質站台\r\n直接輸入站名\r\n例如:臺南'; };

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

