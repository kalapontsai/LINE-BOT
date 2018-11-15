var CHANNEL_ACCESS_TOKEN = 'ZNfAg66flowaKRu31xIkjteZ2dKWFZMmH5mmWn9GKoyX+aJIsQFeGmKHHZsHR9G/ndoWO3GWjoDUeoC4/uqry+mDr9QStcNMMVhcnbGRCWFACNTfE9rv0tpOjCOprEEndBpSd1kYCAYWMmRudsxZjgdB04t89/1O/w1cDnyilFU=';

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
    'messages' : ProcMsg(events.message)
  }
  
  var options = {
    'headers': header,
    'method': 'post',
    'payload': JSON.stringify(payload)
  }
  
  UrlFetchApp.fetch(url, options);

  return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
}

function ProcMsg(message)
{ var type = message.type;
  var retMsg;
  switch(type)
  {
    case 'text':
      var feed_txt = "";
      if (message.text == 'home')
      {
        var thingspeak_url = 'https://api.thingspeak.com/channels/73772/feeds.json?results=2';
        var TS_data = JSON.parse(UrlFetchApp.fetch('https://api.thingspeak.com/channels/73772/feeds.json?results=2'));
        var t_time = TS_data.channel.updated_at
        var temp = TS_data.feeds[1].field6.replace("\r\n\r\n", "");
        var humi = TS_data.feeds[1].field2;
        var pm = TS_data.feeds[1].field3;
        feed_txt = '溫度 : ' + temp + '\r\n濕度 : ' + humi + '\r\nPM2.5 : ' + pm + '\r\n\r\nTime : ' + t_time;
      };
      if (message.text == '台南空氣')
      {
        var row = JSON.parse(UrlFetchApp.fetch('https://quality.data.gov.tw/dq_download_json.php?nid=40448&md5_url=05c834d071ad5b62eaf85658de4d2e6f'));
        for (i=0;i < row.length;i++){
          if (row[i].SiteName == '\u81fa\u5357')
          {
            var AQI = row[i]['AQI'];
            var pm25 = row[i]['PM2.5'];
            var pm10 = row[i]['PM10'];
            feed_txt = message.text + ':\r\nAQI : ' + AQI + '\r\nPM2.5 : ' + pm25 + '\r\nPM10 : ' + pm10;
          };
        };
        if (feed_txt == '')
        {
          feed_txt = 'na'
        }
      };
      if (message.text == 'roll')
      {
        feed_txt = Math.floor(Math.random() * 10);
      };
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