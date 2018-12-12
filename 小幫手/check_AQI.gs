
// ex: id add, id getid, loc 臺南, loc show
function id_process(cmd1,cmd2,uid) 
{
  var Sheet = SpreadsheetApp.openByUrl(id_sheet_url);
  var St = Sheet.getSheetByName('工作表1');
  var lastRow = St.getLastRow();
  //var user_id = St.getSheetValues(1,1,1,1); //getSheetValues(startRow, startColumn, numRows, numColumns)
  var result = '';
  var temp = '';
  if (cmd1 === 'id') {
    switch (cmd2)
    {
      case 'show':
        for (var row=1;row <= lastRow;row++)
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
        for (var row=1;row <= lastRow;row++)
        {
          if ( uid === String(St.getSheetValues(row,1,1,1)))
          {
            result = '此帳號已經登錄過';
            break;
          }
        }
        if (result =='')
        {
          St.appendRow([uid,'臺南']);
          lastRow = St.getLastRow();
          if ( uid === String(St.getSheetValues(lastRow,1,1,1)))
          {
            result = '登錄成功,預設站點:臺南'  ;
          }
          else 
          {
            result = '不明原因導致登錄失敗,請通知管理員';
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
          result = '此帳號未登錄';
        }
        break;
      default :
        result = '查無相關指令\r\n查詢[id show]\r\n登錄[id add]\r\n刪除[id del]';
    }
  }
  if (cmd1 === 'loc') {
    switch (cmd2)
    {
      case 'show':
        for (var row=1;row <= lastRow;row++)
        {
          if ( uid === String(St.getSheetValues(row,1,1,1)))
          {
            result = '站點:'+String(St.getSheetValues(row,2,1,1));
            break;
          }
        }
        if (result == ''){
          result = '查無此帳號，先以[id add]進行登錄';
        }
        break;
      default :
        var tmp_locate_arr = cmd2.split('，');
        var tmp_locate_len = tmp_locate_arr.length;
        var valid_locate_arr = [];
        var invalid_locate_arr = [];
        var check = false;
        var check_all = 0;
        var reg;
        for (reg=0;reg<tmp_locate_len;reg++){
          check = (new RegExp("^[\\u4e00-\\u9fa5]{2}$")).test(tmp_locate_arr[reg]);
          if (check) { check_all ++; }
        }
        if ((cmd2.length>0)&&(check_all == tmp_locate_len))
        {
          for (var i=0;i < tmp_locate_arr.length;i++) {
            j = get_AQI(String(tmp_locate_arr[i]));
            if (j !== false ) {
              valid_locate_arr[valid_locate_arr.length] = String(tmp_locate_arr[i]) ;
            }
            else {
              invalid_locate_arr[invalid_locate_arr.length] = String(tmp_locate_arr[i]) ;
            }
          }
          var valid_locate = valid_locate_arr.join('，');
          var invalid_locate = invalid_locate_arr.join('，');
          for (var row=1;row <= lastRow;row++)
          {
            if ( uid === String(St.getSheetValues(row,1,1,1)))
            {
              var cell = St.getRange(row,2);
              cell.setValue(valid_locate);
              result = '已儲存站點:' + valid_locate;
              if (invalid_locate.length > 0) {
                result += '\r\n['+invalid_locate+']不存在';
              }
              break;
            }
          }
        }
        if (result == '')
        {
          result = '無法辨識輸入指令\r\n顯示現在的設定,輸入[loc show]\r\n更改站點,以逗號依序輸入ex:[loc 臺南，新營]';
        }
    }
  }
  return result;
}

function get_AQI(locate){
  var i,len;
  for (i=0,len=AQI_row.length;i < AQI_row.length;i++)
  {
    if (AQI_row[i].SiteName === locate) {
      var Status = AQI_row[i]['Status'];
      var Pollutant = AQI_row[i]['Pollutant'];
      var AQI = AQI_row[i]['AQI'];
      var pm25 = AQI_row[i]['PM2.5'];
      var pm10 = AQI_row[i]['PM10'];
      return [AQI_row[i]['SiteName'],AQI_row[i]['Status'],AQI_row[i]['Pollutant'],AQI_row[i]['AQI'],AQI_row[i]['PM2.5'],AQI_row[i]['PM10']];
    }
  }
  return false;
}

function check_AQI()
{  
    var sheet_name = '工作表1'
    var SpreadSheet = SpreadsheetApp.openByUrl(id_sheet_url);
    var St = SpreadSheet.getSheetByName(sheet_name);
    var lastRow = St.getLastRow();
    var url = 'https://api.line.me/v2/bot/message/push';
    var user_id, locate;
    var locate_arr = [];
    var i,j, i_len,j_len,tmp_locate,alert_count;
    var Status,Pollutant,AQI,PM25,PM10;
    var result = '';
    //getSheetValues(startRow, startColumn, numRows, numColumns)
    for (var row=1;row <= lastRow;row++)
    {
      alert_count = 0;
      result = '';
      user_id = String(St.getSheetValues(row,1,1,1));
      locate = String(St.getSheetValues(row,2,1,1));
      locate_arr = locate.split('，');
      for (i=0,len=locate_arr.length;i<len;i++){
        tmp_locate = locate_arr[i];
        for (j=0,j_len=AQI_row.length;j<j_len;j++){
          if (AQI_row[j].SiteName === tmp_locate) {
            Status = AQI_row[j]['Status'];
            Pollutant = AQI_row[j]['Pollutant'];
            AQI = AQI_row[j]['AQI'];
            PM25 = AQI_row[j]['PM2.5'];
            PM10 = AQI_row[j]['PM10'];
            if ((PM25 >= 70) || (AQI >= 100))
            {
              result += '\r\n' + tmp_locate + ':\r\n狀態 : ' + Status + '\r\n污染物 : ' + Pollutant + ':\r\nAQI : ' + AQI + '\r\nPM2.5 : ' + PM25 + '\r\nPM10 : ' + PM10;
              alert_count ++;
            }
          }
        }
      }// result[0] + ':\r\n狀態 : ' + result[1] + emoji + '\r\n污染物 : ' + result[2] + ':\r\nAQI : ' + result[3] + '\r\nPM2.5 : ' + result[4] + '\r\nPM10 : ' + result[5];
      var feed_txt = '';
      if (alert_count > 0) {
        feed_txt = '😷😷😷...' + result + '\r\n...😷😷😷';
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
        //setTimeout(Logger.log('send id:'+user_id), 100);
      Logger.log(user_id);
      Logger.log(locate);
      Logger.log(alert_count);
    }//for (var row=1;row <= lastRow

}