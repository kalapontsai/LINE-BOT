function myFunction() {
  var row = JSON.parse(UrlFetchApp.fetch('https://opendata.epa.gov.tw/ws/Data/AQI/?$format=json'));
  var token = 'QI7Dt8oKwcooj2Ov85FYONUyMGZ6pDmgbHzi4ZfQKgi';
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
  var line = UrlFetchApp.fetch('https://notify-api.line.me/api/notify',{
    'method' : 'post',
    'headers' : {
      'Authorization': 'Bearer ' + token
    },
    'payload': 'message=' + feed_txt
  });
                              
}