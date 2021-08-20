<?php
/* --------------------------------------------------------------

  ELHOMEO BOT
  20210820 add Mysql database account info.
  --------------------------------------------------------------*/

// Define the webserver and path parameters
// * DIR_FS_* = Filesystem directories (local/physical)
// * DIR_WS_* = Webserver directories (virtual/URL)
  define('CHANNELSECRET', 'your code'); 
  define('CHANNELACCESSTOKEN', 'your line bot token');
//  define('GOOGLEDATASPI', 'https://spreadsheets.google.com/feeds/list/141hxYb013q-5JbJVJAR1bSKvchQrT86Ido4fu2z1Fvk/od6/public/values?alt=json');
// used for php search tool / not Line bot 20210818
// define our database connection
  define('DB_CHARSET', 'UTF8');
  define('DB_TYPE', 'mysql');
  define('DB_SERVER', 'localhost'); // eg, localhost - should not be empty for productive servers
  define('DB_SERVER_USERNAME', 'xxxxx');
  define('DB_SERVER_PASSWORD', 'xxxxx');
  define('DB_DATABASE', 'xxxxx');
  define('USE_PCONNECT', 'false'); // use persistent connections?
  define('STORE_SESSIONS', 'mysql'); // leave empty '' for default handler or set to 'mysql'
  define('TIMEZONE_OFFSET', "ADDTIME(now(),'0:0:0')");  // use for vitual host timezone offset to Taiwan
?>
