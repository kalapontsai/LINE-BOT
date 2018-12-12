function Crypt(mode,txt) {
  // 定義 128 位元的金鑰（16 bytes * 8 bits/byte = 128 bits）
  var key = [ 1, 2, 3, 4, 5, 6, 7, 8, 8, 7, 6, 5, 4, 3, 2, 1 ];
  
  // 將文字轉換為位元組
  if ((txt === '')||(txt.length == 0)){
    var respons = '要編碼的文字不正確或空白';
    return respons;
  }
  var text = txt;
  if (mode =='crypt'){
    var textBytes = aesjs.utils.utf8.toBytes(text);
    
    // Counter 可省略，若省略則從 1 開始
    var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    var encryptedBytes = aesCtr.encrypt(textBytes);
    
    // 加密過後的資料是二進位資料，若要輸出可轉為十六進位格式
    var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    Logger.log(encryptedHex);
    return encryptedHex;
  }
  else if (mode == 'decrypt'){
    // 將十六進位的資料轉回二進位
    var encryptedBytes = aesjs.utils.hex.toBytes(text);
    
    // 解密時要建立另一個 Counter 實體
    var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    var decryptedBytes = aesCtr.decrypt(encryptedBytes);
    
    // 將二進位資料轉換回文字
    var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    Logger.log(decryptedText);
    return decryptedText;
  }
}
