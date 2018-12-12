function acc(key) 
{
  //debug
  //key ='大';
  var result = '';
  var result_sub, sub_flag;
  var temp = '';
  var Sheet = SpreadsheetApp.openByUrl(acccca_url);
  for (var i=0;i < Sheet.getSheets().length;i++){
    var St = Sheet.getSheets()[i];
    result_sub = St.getSheetName() + ':\r\n';
    sub_flag = 0;
    //var user_id = St.getSheetValues(1,1,1,1); //getSheetValues(startRow, startColumn, numRows, numColumns)
    for (var row=1;row <= St.getLastRow();row++)
    {
      temp = String(St.getSheetValues(row,1,1,1)).toLowerCase();
      if ( temp.indexOf(key.toLowerCase()) != -1 )
      {
        sub_flag = 1;
        result_sub += String(St.getSheetValues(row,1,1,1)) + ':' + String(St.getSheetValues(row,2,1,1)) + ' / ' + String(St.getSheetValues(row,3,1,1)) + '\r\n';
        
      }
    }
    if (sub_flag == 1){
      result += result_sub;
    }
  }
  if (result === ''){
    result = 'NA';
  }
  Logger.log(result);
  return result;
}
