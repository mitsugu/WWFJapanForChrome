(function(){
  var overallURL = browser.runtime.getURL("popup/overall.html");
  var hutteNippon={};
  hutteNippon.prefecture="";    // 都道府県
  hutteNippon.weatherData = {}; // 府県天気予報 XML
  var idWinLocation;
  // {{{
  const pref = {
    "010000" : "気象庁",
    "011000" : "北海道",
    "012000" : "北海道",
    "013000" : "北海道",
    "014100" : "北海道",
    "015000" : "北海道",
    "016000" : "北海道",
    "017000" : "北海道",
    "020000" : "青森県",
    "030000" : "岩手県",
    "040000" : "宮城県",
    "050000" : "秋田県",
    "060000" : "山形県",
    "070000" : "福島県",
    "080000" : "茨城県",
    "090000" : "栃木県",
    "100000" : "群馬県",
    "110000" : "埼玉県",
    "120000" : "千葉県",
    "130000" : "東京都",
    "140000" : "神奈川県",
    "150000" : "新潟県",
    "160000" : "富山県",
    "170000" : "石川県",
    "180000" : "福井県",
    "190000" : "山梨県",
    "200000" : "長野県",
    "210000" : "岐阜県",
    "220000" : "静岡県",
    "230000" : "愛知県",
    "240000" : "三重県",
    "250000" : "滋賀県",
    "260000" : "京都府",
    "270000" : "大阪府",
    "280000" : "兵庫県",
    "290000" : "奈良県",
    "300000" : "和歌山県",
    "310000" : "鳥取県",
    "320000" : "島根県",
    "330000" : "岡山県",
    "340000" : "広島県",
    "350000" : "山口県",
    "360000" : "徳島県",
    "370000" : "香川県",
    "380000" : "愛媛県",
    "390000" : "高知県",
    "400000" : "福岡県",
    "410000" : "佐賀県",
    "420000" : "長崎県",
    "430000" : "熊本県",
    "440000" : "大分県",
    "450000" : "宮崎県",
    "460100" : "鹿児島県",
    "471000" : "沖縄県",
    "472000" : "沖縄県",
    "473000" : "沖縄県",
    "474000" : "沖縄県"
  };
  // }}}

  function evaluateXPath(aNode, aExpr) {
    // {{{
    var xpe = new XPathEvaluator();
    var nsResolver = xpe.createNSResolver(aNode.ownerDocument == null ?
      aNode.documentElement : aNode.ownerDocument.documentElement);
    var result = xpe.evaluate(aExpr, aNode, nsResolver, 0, null);
    var found = [];
    var res;
    while (res = result.iterateNext())
      found.push(res);
    return found;
    // }}}
  }

  function selectLocation(){
    // {{{
    var locationURL = browser.runtime.getURL("popup/location.html");
    var creating = browser.windows.create({
      url:        locationURL,
      type:       "popup",
      height:     132,
      width:      384
    });
    creating.then((win)=>{
      idWinLocation=win.id;
    },(result)=>{
      console.log("Location Window Open Error");
    });
    // }}}
  }

  function dispLocationButtonLavel(){
    // {{{
    var elm       = document.getElementById('locationButton');
    var textNode  = document.createTextNode(hutteNippon.prefecture
                                            + ' ( '
                                            + hutteNippon.region
                                            + ' ) の週間天気予報');
    if(elm.childNodes.length>0){
      elm.removeChild(elm.childNodes.item(0));
    }
    elm.appendChild(textNode);
    // }}}
  }

  function dispProbs(pDate){
    // {{{
    let strExp    = '//div[@id="day'
                  + pDate
                  +'"]//div[@class="probability_box"]/span';
    let elms      = evaluateXPath(document,strExp);
    let maxProbs  = hutteNippon.weatherData.days[pDate].probs.length;
    let str = '';
    for(var i=0;i<maxProbs;i++){
      str += hutteNippon.weatherData.days[pDate].probs[i];
      if(i<(maxProbs-1)) str += '/';
    }
    elms[0].appendChild(document.createTextNode(str));
    // }}}
  }

  function dispTemps(pDate){
    // {{{
    let str   = '';
    let strExp, elms;
    for(var i=0;i<2;i++){
      str = hutteNippon.weatherData.days[pDate].temps[i];
      strExp  = '//div[@id="day'
              + pDate
              +'"]//div[@class="temperature_box"]/span['+(2+i)+']';
      elms    = evaluateXPath(document,strExp);
      elms[0].appendChild(document.createTextNode(str));
    }
    // }}}
  }

  function dispIconWeather(pDate){
    // {{{
    let strExp  = '//div[@id="day'
                + pDate
                +'"]//div[@class="weather_icon_box"]/img';
    let elms    = evaluateXPath(document,strExp);
    let url     =browser.runtime.getURL('icons/'
                    +hutteNippon.weatherData.days[pDate].wcode
                    +'.png');
    if(elms.length){
      elms[0].setAttribute('style',"width:60px;height:26px;visibility:visible;");
      elms[0].setAttribute('src',url)
    }
    // }}}
  }

  function dispStrWeather(pDate){
    // {{{
    let strExp  = '//div[@id="day'
                + pDate
                +'"]//div[@class="weather_icon_box"]/span';
    let elms    = evaluateXPath(document,strExp);
    if(elms.length){
      elms[0].appendChild(
        document.createTextNode(
          hutteNippon.weatherData.days[pDate].weather
        )
      )
    }
    // }}}
  }

  function dispDate(pDate){
    // {{{
    let strExp  = '//div[@id="day'
                + pDate
                +'"]//div[@class="date_box"]/span';
    let elms    = evaluateXPath(document,strExp);
    if(elms.length){
      elms[0].appendChild(
        document.createTextNode(
          hutteNippon.weatherData.days[pDate].date
        )
      )
      if ( hutteNippon.weatherData.days[pDate].dow == 6 ) {
        elms[0].setAttribute( "style", "color:blue;" );
      } else if ( hutteNippon.weatherData.days[pDate].dow == 0 ) {
        elms[0].setAttribute( "style", "color:red" );
      } else {
        elms[0].setAttribute( "style", "colro:black" );
      }
    }
    // }}}
  }

  function dispContentsWeather(){
    // {{{
    let maxDays = hutteNippon.weatherData.days.length;
    for(var i=0;i<maxDays;i++){
      dispDate(i);
      dispStrWeather(i);
      dispIconWeather(i);
      dispTemps(i);
      dispProbs(i);
    }
    // }}}
  }

  function clearContentsWeather(){
    // {{{
    let strXPath;
    let elms;

    for (var i=0; i<8; i++) {
      // 日付
      strXPath = '//div[@id="day'+i+'"]//span[@class="date"]';
      elms= evaluateXPath(document, strXPath);
      elms[0].textContent= "";
      // 天気文字列
      strXPath = '//div[@id="day'+i+'"]/div[@class="weather_icon_box"]/span';
      elms= evaluateXPath(document, strXPath);
      elms[0].textContent= "";
      // 天気アイコン
      strXPath = '//div[@id="day'+i+'"]/div[@class="weather_icon_box"]/img';
      elms= evaluateXPath(document, strXPath);
      elms[0].setAttribute('src',"");
      elms[0].setAttribute('style',"visibility:hidden;");
      // 最低温度
      strXPath  = '//div[@id="day'
                +i
                +'"]/div[@class="temperature_box"]/span[@class="lowTemp"]';
      elms= evaluateXPath(document, strXPath);
      elms[0].textContent= "";
      // 最高温度
      strXPath  = '//div[@id="day'
                +i
                +'"]/div[@class="temperature_box"]/span[@class="heighTemp"]';
      elms= evaluateXPath(document, strXPath);
      elms[0].textContent= "";
      // 降水確率
      strXPath = '//div[@id="day'+i+'"]/div[@class="probability_box"]/span';
      elms= evaluateXPath(document, strXPath);
      elms[0].textContent= "";
    }
    // }}}
  }

  function getWeatherData(pPref, pReg){
    // {{{
    chrome.runtime.sendMessage(
      {command:"getWeather",prefecture:pPref,region:pReg},
      function (response) {
        hutteNippon.weatherData = JSON.parse(response.doc);
console.log(hutteNippon.weatherData);
        clearContentsWeather();
        dispContentsWeather();
      }
    );
    // }}}
  }

  function getLocation() {
    // {{{
    var location;
    var gettingLocation=browser.storage.local.get("location");
    gettingLocation.then((results)=>{
      if(results["location"]!=undefined){
        location=results["location"];
        hutteNippon.prefecture  = pref[location["prefecture"]];
        hutteNippon.region      = location["region"];
        dispLocationButtonLavel();
        getWeatherData(location["prefecture"], location["region"]);
      }else{
        console.log("not found location");
        selectLocation();
      }
    },(results)=>{
      console.log("can't get Location");
    });
    // }}}
  }

  function closeWin(){
    // {{{
    window.close();
    // }}}
  }

  function openOverall(){
    // {{{
    var urlAverall = browser.runtime.getURL("popup/overall.html");
    var creating = chrome.windows.create({
      url:    urlAverall,
      type:   "popup",
      height: 322,
      width:  448
    },(win)=>{
    });
    // }}}
  }

  function openMap(){
    // {{{
    var urlMap = browser.runtime.getURL("popup/map.html");
    var creating = chrome.windows.create({
      url:    urlMap,
      type:   "popup",
      height: 672,
      width:  640
    },(win)=>{
    });
    // }}}
  }

  function openNowcast(){
    // {{{
    var urlNowcast  = browser.runtime.getURL("popup/nowcast.html");
    chrome.windows.create({
      url:    urlNowcast,
      type:   "popup",
      height: 574,
      width:  688
      /*
      height: 832,
      width:  1056
      */
    });
    // }}}
  }

  function openSatellite(){
    // {{{
    // open https://forecast.weathermap.jp/public_datas/SAT/IR-FL_P3-600m.jpg
    var urlSatellite = browser.runtime.getURL("popup/satellite.html");
    var creating = chrome.windows.create({
      url:    urlSatellite,
      type:   "popup",
      height: 528,
      width:  640
    },(win)=>{
    });
    // }}}
  }

  function openHtb(){
    // {{{
    chrome.runtime.sendMessage({command:"htb"}, function (response){});
    // }}}
  }

  function openJma(){
    // {{{
    chrome.runtime.sendMessage({command:"jma"}, function (response){});
    // }}}
  }

  chrome.runtime.onMessage.addListener(
    // {{{
    function(request,sender,sendResponse){
      if(sender.url==overallURL){
        if(request.request=="send overall"){
          let t = hutteNippon.weatherData.overall;
          sendResponse(t);
          return true;
        }
        return true;
      }
    }
    // }}}
  );

  function init() {
    // {{{
    browser.windows.onRemoved.addListener((windowId) => {
      browser.windows.onRemoved.removeListener(function(){
        console.log('remove window remove lisener');
      });
      if(windowId==idWinLocation) getLocation();

    });
    document.getElementById('close_button').addEventListener('click',closeWin);
    document.getElementById('locationButton').addEventListener('click',selectLocation);
    document.getElementById('overall_button').addEventListener("click",openOverall);
    document.getElementById('map_button').addEventListener("click",openMap);
    document.getElementById('nowcast_button').addEventListener("click",openNowcast);
    document.getElementById('satellite_button').addEventListener("click",openSatellite);
    document.getElementById('jma_button').addEventListener("click",openJma);
    document.getElementById('htb_button').addEventListener("click",openHtb);
    getLocation();
    // }}}
  }
  window.addEventListener('DOMContentLoaded',init);
})();
