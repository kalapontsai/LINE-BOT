<?php

/****************************************
 ref https://superlevin.tw/使用azurephpgoogle試算表建置line回應機器人/ 20210819 改用Mysql作為後端資料庫
 sheet name: elhomeo_bot
 20181128: add visit account log to json file, and some keyword for Line BOT
 20191216: modify error log file and add some feedback when user senf sticker or another message type
 20210819: use mysql instead of Google sheet data
 ***************************************/

require_once('./LINEBotTiny.php');
require_once('./includes/setup.php');
// 建立Client from LINEBotTiny
$client = new LINEBotTiny(CHANNELACCESSTOKEN, CHANNELSECRET);
$json_string = file_get_contents('visit_account.json');
$visit_data = json_decode($json_string, true);
$dbc=@mysql_connect(DB_SERVER,DB_SERVER_USERNAME,DB_SERVER_PASSWORD) or die('could not connect to MySQL:'.mysql_error());
@mysql_select_db(DB_DATABASE) or die('Could not select database:'.mysql_error());
@mysql_query("SET NAMES 'UTF8'", $dbc); //指定提取資料的校對字元表
@mysql_query("set character set UTF8",$dbc);//指定提取資料的校對字元表


// 取得事件(只接受文字訊息)
foreach ($client->parseEvents() as $event) {
    switch ($event['type']) {       
        case 'message':
            // 讀入訊息
            $message = $event['message'];
            switch ($message['type']) {
                case 'text':
                    $visit_data['reply']['txt'] += 1;

                    if ($message['text'] == '*log'){
                        $msg_reply = array(array('type' => 'text','text' => $visit_data['reply']['txt'] ));
                        break;
                    }

                    if ($message['text'] == '操作說明'){ //操作說明
                        $txt_manual_1 = "可直接輸入[品名]\r\n例如:aconite\r\n輸入中文[糖漿]也可以😁";
                        $txt_manual_2 = "以發生症狀來查詢,可輸入簡短的症狀名稱\r\n例如:頭痛 😁";
                        $msg_reply = array(array('type' => 'text','text' => $txt_manual_1 ),array('type' => 'text','text' => $txt_manual_2 ));
                        break;
                    }



                    if (!preg_match("/^[\x{4e00}-\x{9fa5}A-Za-z0-9#-*]+$/u", $message['text'])) { //http://www.phpernote.com/php-regular-expression/1332.html
                        $msg_reply = array(array('type' => 'text','text' => "關鍵字有空格或標點符號,請重新輸入😁" ));
                        $total_reply = array('replyToken' => $event['replyToken'],'messages' => $msg_reply);
                        $client->replyMessage($total_reply);
                        break;
                    }

                    $acc = 0;
                    $total_result = '';
                    $msg_reply = array(array('type' => 'text','text' => '查詢['.$message['text'].']'));
                    
                    $query = 'SELECT keyword,fullname,keyword_zh,products_id,note1 FROM query1'; 


                    $result=mysql_query($query) or die('Query failed: '.mysql_error());

                    while (($row = mysql_fetch_array($result,MYSQL_NUM)) and ($acc <= 9))
                    {
                      $check = strpos($row[0],$message['text']);
                      if ($check !== false){
                        $total_result .= '全名:' . $row[1] 
                                      . "\r\n中文:" . $row[2]
                                      . "\r\n" . $row[3] 
                                      . "\r\n" . $row[4] . "\r\n---\r\n";
                        $acc += 1;
                      }
                    }
                    if ($acc == 0) {
                      array_push($msg_reply,array('type' => 'text','text' => '查無結果,請改用其他方式查詢😅'));
                      $txt_manual_1 = "可直接輸入[品名]\r\n例如:aconite\r\n輸入中文[糖漿]也可以😁";
                      $txt_manual_2 = "以發生症狀來查詢,可輸入簡短的症狀名稱\r\n例如:頭痛 😁";
                      array_push($msg_reply,array('type' => 'text','text' => $txt_manual_1 ),array('type' => 'text','text' => $txt_manual_2 ));
                    }
                    else {
                        // $debug_txt = 'qry:' . $query . '   ' . 'tmp:' . count($result);
                        if ($acc >= 10) {
                                $total_result .= "搜尋結果太多,僅列出前十種\r\n請縮小關鍵字範圍😅";
                            }
                        array_push($msg_reply,array('type' => 'text','text' => $total_result));
                        error_log('['.date('Y-M-d H:m:s').']'."query text : " . $message['text'] . "\n", 3, "twe_bot.log");
                    }
                    break;
                default:
                    $msg_reply = array(array('type' => 'text','text' => "抱歉,只接受文字類訊息" ));
                    //error_log('['.date('Y-M-d H:m:s').']'."Unsupporeted message type: " . $message['type'] . "\n", 3, "twe_bot.log");
                    break;
            } //EOF switch ($message['type'])
            $total_reply = array('replyToken' => $event['replyToken'],'messages' => $msg_reply);
            $client->replyMessage($total_reply);
            break;
        default:
            error_log('['.date('Y-M-d H:m:s').']'."Unsupporeted event type: " . $event['type'] . "\n", 3, "twe_bot.log");
            break;
    } //EOF switch ($event['type'])
}; //EOF foreach ($client->parseEvents() as $event)
$fp = fopen('visit_account.json', 'w');
fwrite($fp, json_encode($visit_data,JSON_UNESCAPED_UNICODE));
fclose($fp); 
?>
