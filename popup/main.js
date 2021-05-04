(function(){
  var overallURL = chrome.extension.getURL("popup/overall.html");
  var hutteNippon={};
  hutteNippon.prefecture="";    // 都道府県
  hutteNippon.dailyXMLDoc = {}; // 府県天気予報 XML
  hutteNippon.weatherXMLDoc={}; // 府県週間天気予報 XML
  var idWinLocation;
  // {{{
  const pref = {
    "010000" : "気象庁",
    "011000" : "北海道 宗谷地方",
    "012000" : "北海道 上川地方",
    "013000" : "北海道 網走・北見・紋別地方",
    "014100" : "北海道 釧路・根室・十勝地方",
    "015000" : "北海道 胆振・日高地方",
    "016000" : "北海道 石狩・空知・後志地方",
    "017000" : "北海道渡島・檜山地方",
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
    "471000" : "沖縄県 沖縄本島地方",
    "472000" : "沖縄県 南大東島地方",
    "473000" : "沖縄県 宮古島地方",
    "474000" : "沖縄県 石垣島・八重山地方"
  };
  const hWeather={              // お天気アイコン
    '晴れ':'100.png',
    '晴れ時々くもり':'101.png',
    '晴れ一時くもり':'101.png',
    '晴れ時々雨':'102.png',
    '晴れ一時雨':'102.png',
    '晴れ時々雪':'104.png',
    '晴れ一時雪':'104.png',
    '晴れのちくもり':'110.png',
    '晴れのち雨':'112.png',
    '晴れのち雪':'115.png',
    'くもり':'200.png',
    'くもり時々晴れ':'201.png',
    'くもり一時晴れ':'201.png',
    'くもり時々雨':'202.png',
    'くもり一時雨':'202.png',
    'くもり時々雪':'204.png',
    'くもり一時雪':'204.png',
    'くもりのち晴れ':'210.png',
    'くもりのち雨':'212.png',
    'くもりのち雪':'215.png',
    '雨':'300.png',
    '雨時々晴れ':'301.png',
    '雨一時晴れ':'301.png',
    '雨時々くもり':'302.png',
    '雨一時くもり':'302.png',
    '雨一時雪':'303.png',
    '雨時々雪':'303.png',
    '雨のち晴れ':'311.png',
    '雨のちくもり':'313.png',
    '雨のち雪':'314.png',
    '雪':'400.png',
    '雪時々晴れ':'401.png',
    '雪一時晴れ':'401.png',
    '雪時々くもり':'402.png',
    '雪一時くもり':'402.png',
    '雪時々雨':'403.png',
    '雪一時雨':'403.png',
    '雪のち晴れ':'411.png',
    '雪のちくもり':'413.png',
    '雪のち雨':'414.png'
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
    var locationURL = browser.extension.getURL("popup/location.html");
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
    var elm=document.getElementById('locationButton');
    var textNode=document.createTextNode(hutteNippon.prefecture+"の週間天気予報");
    if(elm.childNodes.length>0){
      elm.removeChild(elm.childNodes.item(0));
    }
    elm.appendChild(textNode);
    // }}}
  }

  function dispContentsWeather(xmldoc){
    // {{{
    var id;
    var probs;
    var forecasts=xmldoc.getElementsByTagName('wm:forecast');
    var forecast;
    var days;
    var textNode;
    var pNode;
    var w;
    var url;
    var t;

    if(3<=forecasts.length){
      forecast=forecasts.item(2);
      days=forecast.getElementsByTagName('wm:content');
      for(var i=0,max=days.length;i<max;i++){
        // 日付表示
        id="day"+i;
        textNode=document.createTextNode(days.item(i).getAttribute('date')
          .substr(5)+'('+days.item(i).getAttribute('wday')+')');
        pNode=document.getElementById(id).childNodes.item(1).childNodes.item(1);
        pNode.appendChild(textNode);
        switch (days.item(i).getAttribute('wday')){
        case 'Sat':
          document.getElementById(id).childNodes.item(1).childNodes.item(1)
            .style.color='blue';
          break;
        case 'Sun':
          document.getElementById(id).childNodes.item(1).childNodes.item(1)
            .style.color='red';
          break;
        default:
          document.getElementById(id).childNodes.item(1).childNodes.item(1)
            .style.color='black'
          ;break;
        }

        // 天気表示
        w=days.item(i).getElementsByTagName('wm:weather').item(0).childNodes
          .item(0).nodeValue;
        pNode=document.getElementById(id).childNodes.item(3).childNodes.item(1);
        pNode.appendChild(document.createTextNode(w));
        url=chrome.extension.getURL("icons/"+hWeather[w]);
        pNode=document.getElementById(id).childNodes.item(3).childNodes.item(4);
        pNode.setAttribute("src",url);

        // 気温表示
        t=days.item(i).getElementsByTagName('wm:max').item(0).childNodes.item(0)
          .nodeValue;
        pNode=document.getElementById(id).childNodes.item(5).childNodes.item(1);
        pNode.appendChild(document.createTextNode(t));
        pNode.style.color='red';
        t=days.item(i).getElementsByTagName('wm:min').item(0).childNodes.item(0)
          .nodeValue;
        pNode=document.getElementById(id).childNodes.item(5).childNodes.item(5);
        pNode.appendChild(document.createTextNode(t));
        pNode.style.color='blue';

        // 降水確率表示
        if(2>i){
          probs=days.item(i).getElementsByTagName('wm:prob');
          switch(probs.length){
          case 1:
            p='-/-/-/'+probs.item(0).childNodes.item(0).nodeValue;
            break;
          case 2:
            p='-/-/'+probs.item(0).childNodes.item(0).nodeValue
              +'/'+probs.item(1).childNodes.item(0).nodeValue;
            break;
          case 3:
            p='-/'+probs.item(0).childNodes.item(0).nodeValue
              +'/'+probs.item(1).childNodes.item(0).nodeValue
              +'/'+probs.item(2).childNodes.item(0).nodeValue;
            break;
          case 4:
            p=probs.item(0).childNodes.item(0).nodeValue
              +'/'+probs.item(1).childNodes.item(0).nodeValue
              +'/'+probs.item(2).childNodes.item(0).nodeValue
              +'/'+probs.item(3).childNodes.item(0).nodeValue;
            break;
          }
        }else{
          p=days.item(i).getElementsByTagName('wm:prob').item(0).childNodes
            .item(0).nodeValue;
        }
        pNode=document.getElementById(id).childNodes.item(7).childNodes.item(1);
        pNode.appendChild(document.createTextNode(p));
      }
    }
    // }}}
  }

  function clearContentsWeather(){
    // {{{
    let strXPath;
    let originNode = [];

    for (var i=0; i<16; i++) {
      strXPath = '//div[@id="day'+i+'"]';
      originNode = evaluateXPath(document, strXPath);
      originNode[0].childNodes[1].childNodes[1].textContent = "";   // 日付
      originNode[0].childNodes[3].childNodes[1].textContent = "";   // 天気文字列
                                                                    // 天気アイコン
      originNode[0].childNodes[3].childNodes[4].setAttribute("src", "");
      originNode[0].childNodes[5].childNodes[3].textContent = "/";  // 温度
      originNode[0].childNodes[7].childNodes[1].textContent = "";   // 降水確率
    }
    // }}}
  }

  function getDailyXMLFile(pPref){
    // {{{
    chrome.runtime.sendMessage({command:"getDaily",prefecture:pPref},
      function (response) {
        let parser=new DOMParser();
        hutteNippon.dailyXMLDoc =
            parser.parseFromString(response.xmldoc,"application/xml");
        clearContentsWeather();
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
        hutteNippon.prefecture=pref[location["prefecture"]];
        dispLocationButtonLavel();
        getDailyXMLFile(location["prefecture"]);
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
    window.close();
  }

  function openOverall(){
    // {{{
    var urlAverall = chrome.extension.getURL("popup/overall.html");
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
    var urlMap = chrome.extension.getURL("popup/map.html");
    var creating = chrome.windows.create({
      url:    urlMap,
      type:   "popup",
      height: 528,
      width:  640
    },(win)=>{
    });
    // }}}
  }

  function openSatellite(){
    // {{{
    // open https://forecast.weathermap.jp/public_datas/SAT/IR-FL_P3-600m.jpg
    var urlSatellite = chrome.extension.getURL("popup/satellite.html");
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
    chrome.runtime.sendMessage({command:"htb"},
      function (response) {}
    );
    // }}}
  }

  function openJma(){
    // {{{
    chrome.runtime.sendMessage({command:"jma"},
      function (response) {}
    );
    // }}}
  }

  chrome.runtime.onMessage.addListener(
    // {{{
    function(request,sender,sendResponse){
      var t;

      if(sender.url==overallURL){
        if(request.request=="send overall"){
          t=hutteNippon.weatherXMLDoc.getElementsByTagName('item').item(1)
              .getElementsByTagName('description').item(0).childNodes.item(0).nodeValue;
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
    document.getElementById('satellite_button').addEventListener("click",openSatellite);
    document.getElementById('jma_button').addEventListener("click",openJma);
    document.getElementById('htb_button').addEventListener("click",openHtb);
    getLocation();
    // }}}
  }
  window.addEventListener('DOMContentLoaded',init);
})();
