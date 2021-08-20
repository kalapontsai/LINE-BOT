<?php

/**
 * Copyright 2016 LINE Corporation
 *
 * LINE Corporation licenses this file to you under the Apache License,
 * version 2.0 (the "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at:
 *
 *   https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

require_once('./LINEBotTiny.php');

$channelAccessToken = 'bc1Lk7wbf+n7njvvrPricHpxBIABwNbNdX5D+XLACpPpHVkW8C+acKdXkMidwXlTcuGBeIlJU63PWRcJJyr2AHHZ21vNRU7VD1OMpPUZF8Hu2ZRnfeRcY3FEduIdIb6D2DUD3wLxphxMck8/SoQPPQdB04t89/1O/w1cDnyilFU=';
$channelSecret = 'e521ea935d1e45ff4a50afcf1b52ae25';

$client = new LINEBotTiny($channelAccessToken, $channelSecret);
foreach ($client->parseEvents() as $event) {
    switch ($event['type']) {
        case 'message':
            $message = $event['message'];
            switch ($message['type']) {
                case 'text':
                    $client->replyMessage([
                        'replyToken' => $event['replyToken'],
                        'messages' => [
                            [
                                'type' => 'text',
                                'text' => $message['text']
                            ]
                        ]
                    ]);
                    error_log($message['type'].'-'.$message['text'].'\r\n', 3, "./echo.log");
                    break;
                default:
                    error_log('Unsupported message type in echo: ' . $message['type'], 3, "./my-errors.log");
                    //error_log('Unsupported message type in echo: ' . $message['type']);
                    break;
            }
            break;
        default:
            error_log('Unsupported event type in echo: ' . $event['type'], 3, "./my-errors.log");
            //error_log('Unsupported event type in echo: ' . $event['type']);
            break;
    }
};
