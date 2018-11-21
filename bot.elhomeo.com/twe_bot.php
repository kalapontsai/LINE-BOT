<?php

/****************************************
 ref https://superlevin.tw/使用azurephpgoogle試算表建置line回應機器人/
 sheet name: elhomeo_bot
 link : https://spreadsheets.google.com/feeds/list/141hxYb013q-5JbJVJAR1bSKvchQrT86Ido4fu2z1Fvk/od6/public/values?alt=json
 ***************************************/

require_once('./LINEBotTiny.php');
require_once('./includes/setup.php');
// 建立Client from LINEBotTiny
$client = new LINEBotTiny(CHANNELACCESSTOKEN, CHANNELSECRET);

// 取得事件(只接受文字訊息)
foreach ($client->parseEvents() as $event) {
    switch ($event['type']) {       
        case 'message':
            // 讀入訊息
            $message = $event['message'];
            switch ($message['type']) {
                case 'text':
                    // 將Google表單轉成JSON資料
                    $json = file_get_contents(GOOGLEDATASPI);
                    $data = json_decode($json, true);           
                    $acc = 0;
                    $msg_reply = array(array('type' => 'text','text' => '查詢['.$message['text'].']'));
                    // 資料起始從feed.entry          
                    foreach ($data['feed']['entry'] as $item) {
                        if (mb_strpos($item['gsx$keyword']['$t'],strtolower($message['text']) ) !== false) {  //=== 和 !== 只有在相同类型下,才会比较其值                     
                            array_push($msg_reply,array('type' => 'text','text' => ('全名:' . $item['gsx$fullname']['$t'] 
                                . "\r\n中文:" . $item['gsx$keywordzh']['$t'] . "\r\n" . $item['gsx$note1']['$t'] 
                                . "\r\n" . $item['gsx$productsid']['$t'])));
                            //break;
                            $acc += 1;
                            if ($acc > 3) {
                                array_push($msg_reply,array('type' => 'text','text' => "搜尋結果太多,僅列出前三種\r\n請改用其他方式查詢!!"));
                                break;
                            }
                        }
                    }
                    if ($acc == 0) {
                        array_push($msg_reply,array('type' => 'text','text' => '查無結果,請改用其他方式查詢!!'));
                    }
                    $total_reply = array('replyToken' => $event['replyToken'],'messages' => $msg_reply);
                    $client->replyMessage($total_reply);
                break;
                default:
                    error_log("Unsupporeted message type: " . $message['type']);
                    break;
            } //EOF switch ($message['type'])
    } //EOF switch ($event['type'])
}; //EOF foreach ($client->parseEvents() as $event)
