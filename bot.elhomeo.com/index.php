<?php
//query into array
//    $new_array[$row['id']]['id'] = $row['id'];
//    $new_array[$row['id']]['link'] = $row['link'];
require_once('./includes/configure.php');

echo "<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>
  <html xmlns='http://www.w3.org/1999/xhtml' dir='LTR' lang='utf-8'>
  <head>
  <meta http-equiv='Content-Type' content='text/html; charset=utf-8'>
  <title>bot</title>
  
  </head>
  <body>";
if (isset($_GET['qry'])){
    $dbc = mysql_connect(DB_SERVER,DB_SERVER_USERNAME,DB_SERVER_PASSWORD) or die('could not connect to MySQL:'.mysql_error());
    mysql_select_db(DB_DATABASE) or die('Could not select database:'.mysql_error());
    mysql_query("set character set utf8",$dbc);
	mysql_query("SET CHARACTER_SET_database= utf8",$dbc);
	mysql_query("SET CHARACTER_SET_CLIENT= utf8",$dbc);
	mysql_query("SET CHARACTER_SET_RESULTS= utf8",$dbc);   
	$query= "SELECT products_id,products_name
	         FROM products_description
	         WHERE products_name like '%" . $_GET['qry'] ."%' LIMIT 3";

	$result=mysql_query($query) or die('Query failed: '.mysql_error());
	$acc = 0;
	if ($result)  {
	                    while ($row = mysql_fetch_row($result,MYSQL_NUM))
	                    {
	                        echo 'https://shop.elhomeo.com/product_info.php?products_id=' . $row[0] . '<br>';
	                        $acc += 1;
	                    }
	                }
	if ($acc == 0) { echo '查無資料';}
	echo "</br>qry = ".$query;
}
echo "<p>The document has moved <a href=”https://www.elhomeo.com/”>here</a>.</p>";         
echo "</body></html>"
?>
