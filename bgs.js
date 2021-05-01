(function(){
  var windowId;
  var weatherXMLData;
  const endPointAtom='http://www.data.jma.go.jp/developer/xml/feed/regular.xml';

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
      }
    }
  );
  chrome.windows.getCurrent({populate: true},function(win){
    windowId=win.id;
    createContextMenu();
  });
  function createContextMenu(){
    var parentId= chrome.contextMenus.create({
      "title":"Hütte Nippon Origin",
      "type":"normal",
      "contexts":["all"],
      "documentUrlPatterns":[chrome.extension.getURL("popup/main.html")]
    });
    chrome.contextMenus.create({
      "title":"気象庁",
      "type":"normal",
      "parentId":parentId,
      "contexts":["all"],
      "onclick":function(){
        console.log(chrome.extension.getURL("popup/main.html"));
        var url="https://www.jma.go.jp/jma/index.html";
        console.log(url);
        chrome.tabs.create({"url":url,windowId:windowId},function (tabs){
          console.log(tabs);
        });
      }
    });
    chrome.contextMenus.create({
      "title":"HBC 専門天気図",
      "type":"normal",
      "parentId":parentId,
      "contexts":["all"],
      "onclick":function(){
        var url="https://www.hbc.co.jp/weather/pro-weather.html";
        console.log(url);
        chrome.tabs.create({"url":url,windowId:windowId},function (tabs){
            console.log(tabs);
        });
      }
    });
  }
})();
