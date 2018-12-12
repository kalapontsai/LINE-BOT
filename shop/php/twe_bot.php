<?php

/****************************************
 ref https://superlevin.tw/使用azurephpgoogle試算表建置line回應機器人/
 sheet name: elhomeo_bot
 link : https://spreadsheets.google.com/feeds/list/141hxYb013q-5JbJVJAR1bSKvchQrT86Ido4fu2z1Fvk/od6/public/values?alt=json
 20181128: add visit account log to json file, and some keyword for Line BOT
 ***************************************/

require_once('./LINEBotTiny.php');
require_once('./includes/setup.php');
// 建立Client from LINEBotTiny
$client = new LINEBotTiny(CHANNELACCESSTOKEN, CHANNELSECRET);
$json_string = file_get_contents('visit_account.json');
$visit_data = json_decode($json_string, true);

function get_ShortUrl($url)
    {
        // content example for LINE BOT
        $content = [
           'replyToken' => $event['replyToken'],
           'messages' => [
               [
                   'type' => 'text',
                   'text' => $message
               ]
           ]
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://www.googleapis.com/urlshortener/v1/url");
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $content);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10); // 在嘗試連接時等待的秒數。設置為 0，則無限等待。
        curl_setopt($ch, CURLOPT_TIMEOUT, 10); // 允許 cURL 函數執行的最長秒數。
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // TRUE 將 curl_exec() 獲取的信息以字符串返回，而不是直接輸出。
        // 抓取 URL 並把它傳遞給瀏覽器
        $ret = curl_exec($ch);
        $json_url = json_decode($ret, true);
        // 關閉 cURL 資源，並且釋放系統資源
        curl_close($ch);
        return $json_url
    }


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

                    if ($message['text'] == '操作說明'){
                        $txt_manual_1 = "可直接輸入[品名]\r\n例如:aconite\r\n輸入中文[烏頭]也可以😁";
                        $txt_manual_2 = "以發生症狀來查詢,可輸入簡短的症狀名稱\r\n例如:頭痛 😁";
                        $msg_reply = array(array('type' => 'text','text' => $txt_manual_1 ),array('type' => 'text','text' => $txt_manual_2 ));
                        break;
                    }



                    if (!preg_match("/^[\x{4e00}-\x{9fa5}A-Za-z0-9]+$/u", $message['text'])) { //http://www.phpernote.com/php-regular-expression/1332.html
                        $msg_reply = array(array('type' => 'text','text' => "關鍵字有空格或標點符號,請重新輸入😁" ));
                        $total_reply = array('replyToken' => $event['replyToken'],'messages' => $msg_reply);
                        $client->replyMessage($total_reply);
                        break;
                    }
                    // 將Google表單轉成JSON資料
                    $json = file_get_contents(GOOGLEDATASPI);
                    $data = json_decode($json, true);
                    $acc = 0;
                    $total_result = '';
                    $msg_reply = array(array('type' => 'text','text' => '查詢['.$message['text'].']'));
                    // 資料起始從feed.entry
                    foreach ($data['feed']['entry'] as $item) {
                        if (mb_strpos($item['gsx$keyword']['$t'],strtolower($message['text']) ) !== false) {  //=== 和 !== 只有在相同类型下,才会比较其值                     
                            $total_result .= '全名:' . $item['gsx$fullname']['$t'] 
                                            . "\r\n中文:" . $item['gsx$keywordzh']['$t']
                                            . "\r\n" . $item['gsx$note1']['$t'] 
                                            . "\r\n" . $item['gsx$productsid']['$t'] . "\r\n---\r\n";
                            $acc += 1;
                            if ($acc >= 10) {
                                $total_result .= "搜尋結果太多,僅列出前十種\r\n請縮小關鍵字範圍😅";
                                break;
                            }
                        }
                    }
                    if ($acc == 0) {
                        array_push($msg_reply,array('type' => 'text','text' => '查無結果,請改用其他方式查詢😅'));
                    }
                    else {
                        array_push($msg_reply,array('type' => 'text','text' => $total_result));
                    }
                break;
                default:
                    error_log("Unsupporeted message type: " . $message['type']);
                    break;
            } //EOF switch ($message['type'])
            $total_reply = array('replyToken' => $event['replyToken'],'messages' => $msg_reply);
            $client->replyMessage($total_reply);
    } //EOF switch ($event['type'])
}; //EOF foreach ($client->parseEvents() as $event)
$fp = fopen('visit_account.json', 'w');
fwrite($fp, json_encode($visit_data,JSON_UNESCAPED_UNICODE));
fclose($fp); 