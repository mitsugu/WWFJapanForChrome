(function(){
  var hutteNippon={};
  hutteNippon.prefecture="",    // 都道府県
  hutteNippon.region="",        // 一次細分区域
  hutteNippon.weatherXMLDoc={}; // 週間天気予報 RSS
  var idWinLocation;
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

  function selectLocation(){
    var locationURL = browser.extension.getURL("popup/location.html");
    var creating = browser.windows.create({
      url:        locationURL,
      type:       "popup",
      height:     148,
      width:      360
    });
    creating.then((win)=>{
      console.log("Location windowId : "+win.id);
      idWinLocation=win.id;
    },(result)=>{
      console.log("Location Window Open Error");
    });
  }

  function dispLocationButtonLavel(){
    var elm=document.getElementById('locationButton');
    var textNode=document.createTextNode(
      hutteNippon.prefecture+"："+hutteNippon.region+"の週間天気予報");
    if(elm.childNodes.length>0){
      elm.removeChild(elm.childNodes.item(0));
    }
    elm.appendChild(textNode);

  }

  function dispContentsWeather(xmldoc){
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
  }

  function clearContentsWeather(){
    var id;
    var pNode;
    for(var i=0;i<8;i++){
      id="day"+i;
      // 日付クリア
      pNode=document.getElementById(id).childNodes.item(1).childNodes.item(1)
      if(0<pNode.childNodes.length){
        console.log(pNode.childNodes.item(0));
        pNode.removeChild(pNode.firstChild);
      }
      // 天気クリア
      pNode=document.getElementById(id).childNodes.item(3).childNodes.item(1);
      if(0<pNode.childNodes.length){
        console.log(pNode.childNodes.item(0));
        pNode.removeChild(pNode.firstChild);
      }
      pNode=document.getElementById(id).childNodes.item(3).childNodes.item(4);
      pNode.setAttribute("src","");
      // 気温クリア
      pNode=document.getElementById(id).childNodes.item(5).childNodes.item(1);
      if(0<pNode.childNodes.length){
        console.log(pNode.childNodes.item(0));
        pNode.removeChild(pNode.firstChild);
      }
      pNode=document.getElementById(id).childNodes.item(5).childNodes.item(5);
      if(0<pNode.childNodes.length){
        console.log(pNode.childNodes.item(0));
        pNode.removeChild(pNode.firstChild);
      }
      // 降水確率クリア
      pNode=document.getElementById(id).childNodes.item(7).childNodes.item(1);
      if(0<pNode.childNodes.length){
        console.log(pNode.childNodes.item(0));
        pNode.removeChild(pNode.firstChild);
      }
    }
  }

  function getWeatherXMLFile(){
    chrome.runtime.sendMessage({region:hutteNippon.region},function (response) {
      var parser=new DOMParser();
      hutteNippon.weatherXMLDoc=parser.parseFromString(response.xmldoc,"application/xml");
      clearContentsWeather();
      dispContentsWeather(hutteNippon.weatherXMLDoc);
    });
  }

  function getLocation() {
    var location;
    var gettingLocation=browser.storage.local.get("location");
    gettingLocation.then((results)=>{
      if(results["location"]!=undefined){
        location=results["location"];
        hutteNippon.prefecture=location["prefecture"];
        hutteNippon.region=location["region"];
        console.log(hutteNippon.prefecture);
        console.log(hutteNippon.region);
        dispLocationButtonLavel();
        getWeatherXMLFile();
      }else{
        console.log("not found location");
        selectLocation();
      }
    },(results)=>{
      console.log("can't get Location");
    });
  }

  function closeWin(){
    window.close();
  }

  function openOverall(){
    var urlAverall = chrome.extension.getURL("popup/overall.html");
    var creating = chrome.windows.create({
      url:    urlAverall,
      type:   "popup",
      height: 322,
      width:  448
    },(win)=>{
      console.log("Overall windowId : "+win.id);
    });
  }

  function openMap(){
    var urlMap = chrome.extension.getURL("popup/map.html");
    var creating = chrome.windows.create({
      url:    urlMap,
      type:   "popup",
      height: 664,
      width:  634
    },(win)=>{
      console.log("Map windowId : "+win.id);
    });
  }

  function openPhoto(){
    var urlPhoto = chrome.extension.getURL("popup/photo.html");
    var creating = chrome.windows.create({
      url:    urlPhoto,
      type:   "popup",
      height: 860,
      width:  1088
    },(win)=>{
      console.log("Photo windowId : "+win.id);
    });
  }

  function openRadar(){
    var urlRadar = chrome.extension.getURL("popup/radar.html");
    var creating = chrome.windows.create({
      url:    urlRadar,
      type:   "popup",
      height: 560,
      width:  586
    },(win)=>{
      console.log("radar windowId : "+win.id);
    });
  }

  function openThunder(){
    var urlThunder = chrome.extension.getURL("popup/thunder.html");
    var creating = chrome.windows.create({
      url:    urlThunder,
      type:   "popup",
      height: 560,
      width:  586
    },(win)=>{
      console.log("thunder windowId : "+win.id);
    });
  }

  function openTornade(){
    var urlTornade = chrome.extension.getURL("popup/tornade.html");
    var creating = chrome.windows.create({
      url:    urlTornade,
      type:   "popup",
      height: 560,
      width:  586
    },(win)=>{
      console.log("tornade windowId : "+win.id);
    });
  }

  function openWarn(){
    var urlWarn = chrome.extension.getURL("popup/warn.html");
    var creating = chrome.windows.create({
      url:    urlWarn,
      type:   "popup",
      height: 628,
      width:  576
    },(win)=>{
      console.log("warn windowId : "+win.id);
    });
  }

  chrome.runtime.onMessage.addListener(
    function(request,sender,sendResponse){
      console.log(sender);
      console.log(request);
      var t;
      var overallURL = chrome.extension.getURL("popup/overall.html");
      var radarURL = chrome.extension.getURL("popup/radar.html");
      var thunderURL = chrome.extension.getURL("popup/thunder.html");
      var tornadeURL = chrome.extension.getURL("popup/tornade.html");
      var warnURL = chrome.extension.getURL("popup/warn.html");

      if(sender.url==overallURL){
        if(request.request=="send overall"){
          t=hutteNippon.weatherXMLDoc.getElementsByTagName('item').item(1)
              .getElementsByTagName('description').item(0).childNodes.item(0).nodeValue;
          sendResponse(t);
          return true;
        }
        return true;
      }else if(sender.url==radarURL){
        if(request.request=="send region"){
          sendResponse(hutteNippon.region);
          return true;
        }
      }else if(sender.url==thunderURL){
        if(request.request=="send region"){
          sendResponse(hutteNippon.region);
          return true;
        }
      }else if(sender.url==tornadeURL){
        if(request.request=="send region"){
          sendResponse(hutteNippon.region);
          return true;
        }
      }else if(sender.url==warnURL){
        if(request.request=="send region"){
          sendResponse(hutteNippon.region);
          return true;
        }
      }
    });

  function init() {
    browser.windows.onRemoved.addListener((windowId) => {
      browser.windows.onRemoved.removeListener(function(){
        console.log('remove window remove lisener');
      });
      console.log("Closed window: "+windowId);
      if(windowId==idWinLocation) getLocation();

    });
    console.log('init Main Window');
    document.getElementById('close_button').addEventListener('click',closeWin);
    document.getElementById('locationButton').addEventListener('click',selectLocation);
    document.getElementById('overall_button').addEventListener("click",openOverall);
    getLocation();
  }
  window.addEventListener('DOMContentLoaded',init);
})();
