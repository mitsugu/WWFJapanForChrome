(function(){
  var windowId;
  var weatherXMLData;
  // 一次細分区域コードハッシュテーブル
  var hLocationCode={
    '宗谷地方（稚内）':"1100",
    '上川地方（旭川）':"1200",
    '留萌地方（留萌）':"1300",
    '石狩地方（札幌）':"1400",
    '空知地方（岩見沢）':"1500",
    '後志地方（倶知安）':"1600",
    '網走地方（網走）':"1710",
    '北見地方（北見）':"1720",
    '紋別地方（紋別）':"1730",
    '根室地方（根室）':"1800",
    '釧路地方（釧路）':"1900",
    '十勝地方（帯広）':"2000",
    '胆振地方（室蘭）':"2100",
    '日高地方（浦河）':"2200",
    '渡島地方（函館）':"2300",
    '檜山地方（江差）':"2400",
    '津軽（青森）':"3110",
    '下北（むつ）':"3120",
    '三八上北（八戸）':"3130",
    '沿岸（秋田）':"3210",
    '内陸（横手）':"3220",
    '内陸（盛岡）':"3310",
    '沿岸北部（宮古）':"3320",
    '沿岸南部（大船渡）':"3330",
    '村山（山形）':"3510",
    '置賜（米沢）':"3520",
    '庄内（酒田）':"3530",
    '最上（新庄）':"3540",
    '東部（仙台）':"3410",
    '西部（白石）':"3420",
    '中通り（福島）':"3610",
    '浜通り（相馬）':"3620",
    '会津（若松）':"3630",
    '北部（水戸）':"4010",
    '南部（土浦）':"4020",
    '南部（宇都宮）':"4110",
    '北部（大田原）':"4120",
    '南部（前橋）':"4210",
    '北部（水上）':"4220",
    '南部（さいたま）':"4310",
    '北部（熊谷）':"4320",
    '秩父地方（秩父）':"4330",
    '東京地方（東京）':"4410",
    '伊豆諸島北部（大島）':"4420",
    '伊豆諸島南部（八丈島）':"4430",
    '小笠原諸島（父島）':"9600",
    '東部（横浜）':"4610",
    '西部（小田原）':"4620",
    '北西部（千葉）':"4510",
    '北東部（銚子）':"4520",
    '南部（館山）':"4530",
    '中部（静岡）':"5010",
    '伊豆（石廊崎）':"5020",
    '東部（三島）':"5030",
    '西部（浜松）':"5040",
    '中・西部（甲府）':"4910",
    '東部・富士五湖（河口湖）':"4920",
    '下越（新潟）':"5410",
    '中越（長岡）':"5420",
    '上越（高田）':"5430",
    '佐渡（相川）':"5440",
    '北部（長野）':"4810",
    '中部（松本）':"4820",
    '南部（飯田）':"4830",
    '東部（富山）':"5510",
    '西部（伏木）':"5520",
    '加賀（金沢）':"5610",
    '能登（輪島）':"5620",
    '嶺北（福井）':"5710",
    '嶺南（敦賀）':"5720",
    '美濃地方（岐阜）':"5210",
    '飛騨地方（高山）':"5220",
    '西部（名古屋）':"5110",
    '東部（豊橋）':"5120",
    '北中部（津）':"5310",
    '南部（尾鷲）':"5320",
    '南部（大津）':"6010",
    '北部（彦根）':"6020",
    '北部（舞鶴）':"400",
    '南部（京都）':"6100",
    '大阪府（大阪）':"6200",
    '北部（奈良）':"6410",
    '南部（風屋）':"6420",
    '北部（和歌山）':"6510",
    '南部（潮岬）':"6520",
    '南部（神戸）':"6310",
    '北部（豊岡）':"6320",
    '南部（岡山）':"6610",
    '北部（津山）':"6620",
    '東部（鳥取）':"6910",
    '中・西部（米子）':"6920",
    '南部（広島）':"6710",
    '北部（庄原）':"6720",
    '東部（松江）':"6810",
    '西部（浜田）':"6820",
    '隠岐（西郷）':"6830",
    '西部（下関）':"8110",
    '中部（山口）':"8120",
    '東部（柳井）':"8130",
    '北部（萩）':"8140",
    '香川県（高松）':"7200",
    '北部（徳島）':"7110",
    '南部（日和佐）':"7120",
    '中予（松山）':"7310",
    '東予（新居浜）':"7320",
    '南予（宇和島）':"7330",
    '中部（高知）':"7410",
    '東部（室戸岬）':"7420",
    '西部（清水）':"7430",
    '福岡地方（福岡）':"8210",
    '北九州地方（八幡）':"8220",
    '筑豊地方（飯塚）':"8230",
    '筑後地方（久留米）':"8240",
    '南部（佐賀）':"8510",
    '北部（伊万里）':"8520",
    '南部（長崎）':"8410",
    '北部（佐世保）':"8420",
    '壱岐・対馬（厳原）':"700",
    '五島（福江）':"800",
    '中部（大分）':"8310",
    '北部（中津）':"8320",
    '西部（日田）':"8330",
    '南部（佐伯）':"8340",
    '熊本地方（熊本）':"8610",
    '阿蘇地方（阿蘇乙姫）':"8620",
    '天草・芦北地方（牛深）':"8630",
    '球磨地方（人吉）':"8640",
    '南部平野部（宮崎）':"8710",
    '北部平野部（延岡）':"8720",
    '南部山沿い（都城）':"8730",
    '北部山沿い（高千穂）':"8740",
    '薩摩地方（鹿児島）':"8810",
    '大隅地方（鹿屋）':"8820",
    '種子島・屋久島地方（西之表）':"8830",
    '奄美地方（名瀬）':"1000",
    '本島中南部（那覇）':"9110",
    '本島北部（名護）':"9120",
    '久米島（久米島）':"9130",
    '大東島地方（南大東島）':"9200",
    '宮古島地方（宮古島）':"9300",
    '石垣島地方（石垣島）':"9400",
    '与那国島地方（与那国島）':"9500"
  };
//  const endPointRss='http://feedproxy.google.com/hitokuchi_';
  const endPointRss='http://feeds.feedburner.com/hitokuchi_';

  browser.browserAction.onClicked.addListener((tab)=>{
    var mainURL = browser.extension.getURL("popup/main.html");
    var creating = browser.windows.create({
      url:    mainURL,
      type:   "popup",
      height: 346,
      width:  570
    });
    creating.then((win)=>{
      console.log("Main windowId : "+win.id);
    },(result)=>{
      console.log("Main Window Create Error");
    });
  });

  function getWeatherXMLFile(region,sendResponse){
    var uri=endPointRss+hLocationCode[region];
    console.log(uri);
    weatherXMLData=new XMLHttpRequest();
    weatherXMLData.open('GET',uri);
    weatherXMLData.onreadystatechange=function(){
      if (weatherXMLData.readyState == 4 && weatherXMLData.status == 200){
        console.log(weatherXMLData.responseXML);
        sendResponse({xmldoc:weatherXMLData.responseText});
      }
    }
    weatherXMLData.send(null);
  };

  function getRadarJs(sendResponse){
    const uri='http://www.jma.go.jp/jp/radnowc/hisjs/radar.js';
    var response=new XMLHttpRequest();
    response.open('GET',uri);
    response.onreadystatechange=function(){
      if (response.readyState == 4 && response.status == 200){
        console.log(response.responseText);
        sendResponse(response.responseText);
      }
    }
    response.send(null);
  }

  function getThunderJs(sendResponse){
    const uri='http://www.jma.go.jp/jp/radnowc/hisjs/thunder.js';
    var response=new XMLHttpRequest();
    response.open('GET',uri);
    response.onreadystatechange=function(){
      if (response.readyState == 4 && response.status == 200){
        console.log(response.responseText);
        sendResponse(response.responseText);
      }
    }
    response.send(null);
  }

  function getTornadeJs(sendResponse){
    const uri='http://www.jma.go.jp/jp/radnowc/hisjs/tornado.js';
    var response=new XMLHttpRequest();
    response.open('GET',uri);
    response.onreadystatechange=function(){
      if (response.readyState == 4 && response.status == 200){
        console.log(response.responseText);
        sendResponse(response.responseText);
      }
    }
    response.send(null);
  }

  chrome.runtime.onMessage.addListener(
    function(request,sender,sendResponse){
      console.log(sender);
      var mainURL = chrome.extension.getURL("popup/main.html");
      var radarURL = chrome.extension.getURL("popup/radar.html");
      var thunderURL = chrome.extension.getURL("popup/thunder.html");
      var tornadeURL = chrome.extension.getURL("popup/tornade.html");
      var warnURL = chrome.extension.getURL("popup/warn.html");

      if(sender.url==mainURL){
        getWeatherXMLFile(request.region,sendResponse);
        return true;
      }else if(sender.url==radarURL){
        if(request.request=="send radar.js"){
          getRadarJs(sendResponse);
          return true;
        }
      }else if(sender.url==thunderURL){
        if(request.request=="send thunder.js"){
          getThunderJs(sendResponse);
          return true;
        }
      }else if(sender.url==tornadeURL){
        if(request.request=="send tornade.js"){
          getTornadeJs(sendResponse);
          return true;
        }
      }else if(sender.url==warnURL){
        if(request.request=="send window id"){
          sendResponse(windowId);
          return true;
        }
      }
    });
  chrome.windows.getCurrent({populate: true},function(win){
    windowId=win.id;
    createContextMenu();
  });
  function createContextMenu(){
    var parentId= chrome.contextMenus.create({
      "title":"Hütte Nippon Private Edition",
      "type":"normal",
      "contexts":["all"],
      "documentUrlPatterns":[chrome.extension.getURL("popup/main.html")]
    });
    var webId=chrome.contextMenus.create({
      "title":"Web サイト",
      "type":"normal",
      "parentId":parentId,
      "contexts":["all"]
    });
    chrome.contextMenus.create({
      "title":"気象庁",
      "type":"normal",
      "parentId":webId,
      "contexts":["all"],
      "onclick":function(){
        console.log(chrome.extension.getURL("popup/main.html"));
        var url="http://www.jma.go.jp/jma/index.html";
        console.log(url);
        chrome.tabs.create({"url":url,windowId:windowId},function (tabs){
          console.log(tabs);
        });
      }
    });
    chrome.contextMenus.create({
      "title":"HBC 専門天気図",
      "type":"normal",
      "parentId":webId,
      "contexts":["all"],
      "onclick":function(){
        var url="http://www.hbc.co.jp/weather/pro-weather.html";
        console.log(url);
        chrome.tabs.create({"url":url,windowId:windowId},function (tabs){
            console.log(tabs);
        });
      }
    });
    var jmaId=chrome.contextMenus.create({
      "title":"気象庁 高層天気図",
      "type":"normal",
      "parentId":parentId,
      "contexts":["all"]
    });
    chrome.contextMenus.create({
      "title":"09時 850hPa",
      "type":"normal",
      "parentId":jmaId,
      "contexts":["all"],
      "onclick":function(){
        var url="http://www.jma.go.jp/jmh/wmapimgs/lrg_00_auas85.png";
        console.log(url);
        chrome.tabs.create({"url":url,windowId:windowId},function (tabs){
            console.log(tabs);
        });
      }
    });
    chrome.contextMenus.create({
      "title":"09時 700hPa",
      "type":"normal",
      "parentId":jmaId,
      "contexts":["all"],
      "onclick":function(){
        var url="http://www.jma.go.jp/jmh/wmapimgs/lrg_00_auas70.png";
        console.log(url);
        chrome.tabs.create({"url":url,windowId:windowId},function (tabs){
            console.log(tabs);
        });
      }
    });
    chrome.contextMenus.create({
      "title":"09時 500hPa",
      "type":"normal",
      "parentId":jmaId,
      "contexts":["all"],
      "onclick":function(){
        var url="http://www.jma.go.jp/jmh/wmapimgs/lrg_00_auas50.png";
        console.log(url);
        chrome.tabs.create({"url":url,windowId:windowId},function (tabs){
            console.log(tabs);
        });
      }
    });
    chrome.contextMenus.create({
      "title":"21時 850hPa",
      "type":"normal",
      "parentId":jmaId,
      "contexts":["all"],
      "onclick":function(){
        var url="http://www.jma.go.jp/jmh/wmapimgs/lrg_12_auas85.png";
        console.log(url);
        chrome.tabs.create({"url":url,windowId:windowId},function (tabs){
            console.log(tabs);
        });
      }
    });
    chrome.contextMenus.create({
      "title":"21時 700hPa",
      "type":"normal",
      "parentId":jmaId,
      "contexts":["all"],
      "onclick":function(){
        var url="http://www.jma.go.jp/jmh/wmapimgs/lrg_12_auas70.png";
        console.log(url);
        chrome.tabs.create({"url":url,windowId:windowId},function (tabs){
            console.log(tabs);
        });
      }
    });
    chrome.contextMenus.create({
      "title":"21時 500hPa",
      "type":"normal",
      "parentId":jmaId,
      "contexts":["all"],
      "onclick":function(){
        var url="http://www.jma.go.jp/jmh/wmapimgs/lrg_12_auas50.png";
        console.log(url);
        chrome.tabs.create({"url":url,windowId:windowId},function (tabs){
            console.log(tabs);
        });
      }
    });
    var hbcId=chrome.contextMenus.create({
      "title":"北海道放送 PDF 天気図",
      "type":"normal",
      "parentId":parentId,
      "contexts":["all"]
    });
    var realId=chrome.contextMenus.create({
      "title":"実況図",
      "type":"normal",
      "parentId":hbcId,
      "contexts":["all"]
    });
    chrome.contextMenus.create({
      "title":"速報天気図",
      "type":"normal",
      "parentId":realId,
      "contexts":["all"],
      "onclick":function(){
        var url="http://www.hbc.jp/tecweather/SPAS.pdf";
        console.log(url);
        chrome.tabs.create({"url":url,windowId:windowId},function (tabs){
            console.log(tabs);
        });
      }
    });
    chrome.contextMenus.create({
      "title":"アジア地上解析天気図",
      "type":"normal",
      "parentId":realId,
      "contexts":["all"],
      "onclick":function(){
        var url="http://www.hbc.jp/tecweather/ASAS.pdf";
        console.log(url);
        chrome.tabs.create({"url":url,windowId:windowId},function (tabs){
            console.log(tabs);
        });
      }
    });
    chrome.contextMenus.create({
      "title":"アジア850hPa-700hPa天気図",
      "type":"normal",
      "parentId":realId,
      "contexts":["all"],
      "onclick":function(){
        var url="http://www.hbc.jp/tecweather/AUPQ78.pdf";
        console.log(url);
        chrome.tabs.create({"url":url,windowId:windowId},function (tabs){
            console.log(tabs);
        });
      }
    });
    chrome.contextMenus.create({
      "title":"アジア500hPa-300hPa天気図",
      "type":"normal",
      "parentId":realId,
      "contexts":["all"],
      "onclick":function(){
        var url="http://www.hbc.jp/tecweather/AUPQ35.pdf";
        console.log(url);
        chrome.tabs.create({"url":url,windowId:windowId},function (tabs){
            console.log(tabs);
        });
      }
    });
    var vistaId=chrome.contextMenus.create({
      "title":"予想天気図",
      "type":"normal",
      "parentId":hbcId,
      "contexts":["all"]
    });
    chrome.contextMenus.create({
      "title":"アジア地上24時間予想天気図",
      "type":"normal",
      "parentId":vistaId,
      "contexts":["all"],
      "onclick":function(){
        var url="http://www.hbc.jp/tecweather/FSAS.pdf";
        console.log(url);
        chrome.tabs.create({"url":url,windowId:windowId},function (tabs){
            console.log(tabs);
        });
      }
    });
    chrome.contextMenus.create({
      "title":"アジア地上48時間予想天気図",
      "type":"normal",
      "parentId":vistaId,
      "contexts":["all"],
      "onclick":function(){
        var url="http://www.hbc.jp/tecweather/FSAS48.pdf";
        console.log(url);
        chrome.tabs.create({"url":url,windowId:windowId},function (tabs){
            console.log(tabs);
        });
      }
    });
    chrome.contextMenus.create({
      "title":"極東高層12-24時間予想図",
      "type":"normal",
      "parentId":vistaId,
      "contexts":["all"],
      "onclick":function(){
        var url="http://www.hbc.jp/tecweather/FXFE5782.pdf";
        console.log(url);
        chrome.tabs.create({"url":url,windowId:windowId},function (tabs){
            console.log(tabs);
        });
      }
    });
    chrome.contextMenus.create({
      "title":"極東高層36-48時間予想図",
      "type":"normal",
      "parentId":vistaId,
      "contexts":["all"],
      "onclick":function(){
        var url="http://www.hbc.jp/tecweather/FXFE5784.pdf";
        console.log(url);
        chrome.tabs.create({"url":url,windowId:windowId},function (tabs){
            console.log(tabs);
        });
      }
    });
    chrome.contextMenus.create({
      "title":"極東高層72時間予想図",
      "type":"normal",
      "parentId":vistaId,
      "contexts":["all"],
      "onclick":function(){
        var url="http://www.hbc.jp/tecweather/FXFE577.pdf";
        console.log(url);
        chrome.tabs.create({"url":url,windowId:windowId},function (tabs){
            console.log(tabs);
        });
      }
    });
  }
})();
