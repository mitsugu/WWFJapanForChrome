# Weekly weather forecast for Japan
Old name is "Hutte Nippon Origin".  
This browser extension displays the weekly weather forecast for Japan.

## Resorce
* [気象庁配信 XML](https://xml.kishou.go.jp/xmlpull.html)
* [国土地理院タイル座標](https://maps.gsi.go.jp/development/tileCoordCheck.html#5/35.362/138.731)
* [国土地理院タイル淡色地図](https://maps.gsi.go.jp/development/ichiran.html#pale)  
  書式 :   
  `https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png`  
  x : 27 〜 29  
  y : 11 〜 13  
  z : 5  
  ex. https://cyberjapandata.gsi.go.jp/xyz/pale/5/28/12.png
  ![本州付近](https://cyberjapandata.gsi.go.jp/xyz/pale/5/28/12.png "国土地理院淡色地図本州付近サンプル")  
* [気象庁天気図画像ファイル名一覧](https://www.jma.go.jp/bosai/weather_map/data/list.json)   
  https://www.jma.go.jp/bosai/weather_map/data/list.json
  * 気象庁天気図 URL  
  書式 :   
  `https://www.jma.go.jp/bosai/weather_map/data/png/{気象庁天気図画像ファイル名}`  
* [気象庁ナウキャスト時刻一覧](https://www.jma.go.jp/bosai/jmatile/data/nowc/targetTimes_N1.json)  
  https://www.jma.go.jp/bosai/jmatile/data/nowc/targetTimes_N1.json
* 気象庁ナウキャスト  
  書式 :  
  `https://www.jma.go.jp/bosai/jmatile/data/nowc/baseTime/none/validTime/surf/hrpns/{z}/{x}/{y}.png`  
  baseTime : 気象庁ナウキャスト時刻一覧の最新 baseTime  
  validTime : 気象庁ナウキャスト時刻一覧の最新 validTime  
  x : 27 〜 29  
  y : 11 〜 13  
  z : 5  

