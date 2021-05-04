(function(){
  const mainURL = chrome.extension.getURL("popup/main.html");
  const urlJmaRegular = 'https://www.data.jma.go.jp/developer/xml/feed/regular.xml';
  const urlJmaRegularL = 'https://www.data.jma.go.jp/developer/xml/feed/regular_l.xml';
  let windowId;
  let weatherXMLData;
  let jmaRegularXML;
  let jmaRegularLXML;
  let urlJmaDaily;
  let jmaDailyXML;
  let urlJmaWeekly;
  let jmaWeeklyXML;
  let codePrefecture;

  function evaluateXPath(aNode, aExpr) {
    // {{{
    // var elms=evaluateXPath(documentNode, '//myns:entry');
    // See URL for xpath expressions
    // https://developer.mozilla.org/ja/docs/Web/XPath/Introduction_to_using_XPath_in_JavaScript#xml_.e6.96.87.e6.9b.b8.e3.81.ae.e3.83.87.e3.83.95.e3.82.a9.e3.83.ab.e3.83.88.e5.90.8d.e5.89.8d.e7.a9.ba.e9.96.93.e3.82.92.e5.ae.9f.e8.a3.85.e3.81.99.e3.82.8b
    var resolver = function() {
      return 'http://www.w3.org/2005/Atom';
    };
    //var xpe = new XPathEvaluator();
    //var result = xpe.evaluate(
    var result = aNode.evaluate(
      aExpr,
      aNode,
      resolver,
      XPathResult.ANY_TYPE,
      null
    );

    var found = [];
    var res;
    while (res = result.iterateNext()){
      found.push(res);
    }
    return found;
    // }}}
  }

  browser.browserAction.onClicked.addListener((tab)=>{
    // {{{
    var mainURL = browser.extension.getURL("popup/main.html");
    var creating = browser.windows.create({
      url:    mainURL,
      type:   "popup",
      height: 392,
      width:  1024
    });
    creating.then((win)=>{
    },(result)=>{
      console.log("Main Window Create Error");
    });
    // }}}
  })

  /*
  function getWeatherXMLFile(pPref,sendResponse){
    // {{{
    var uri=endPointRss+hLocationCode[region];
    console.log(uri);
    weatherXMLData=new XMLHttpRequest();
    weatherXMLData.open('GET',uri);
    weatherXMLData.onreadystatechange=function(){
      if (weatherXMLData.readyState == 4 && weatherXMLData.status == 200){
//        sendResponse({xmldoc:weatherXMLData.responseText});
      }
    }
    weatherXMLData.send(null);
    // }}}
  }
  */

  function getDailyXML(sendResponse){
    // {{{
    jmaDailyXML= new XMLHttpRequest();
    jmaDailyXML.open('GET',urlJmaDaily);
    jmaDailyXML.onreadystatechange=function(){
      if (jmaDailyXML.readyState == 4 && jmaDailyXML.status == 200){
        sendResponse({xmldoc:jmaDailyXML.responseText});
      }
    }
    jmaDailyXML.send(null);
    // }}}
  }

  function getUrlJmaRegularL(sendResponse){
    // {{{
    jmaRegularXML=new XMLHttpRequest();
    jmaRegularXML.open('GET',urlJmaRegular);
    jmaRegularXML.onreadystatechange=function(){
      if (jmaRegularXML.readyState == 4 && jmaRegularXML.status == 200){
        let strExp='//myns:id[contains(text(),"_VPFW50_'
                    + codePrefecture
                    + '") and contains(text(),"'
                    + strDate
                    + '")]/../myns:link';
        let elms = evaluateXPath(jmaRegularXML.responseXML, strExp);
      }
    }
    jmaRegularXML.send(null);
    // }}}
  }

  function getUrlJmaRegular(sendResponse){
    // {{{
    console.log('Regular');
    jmaRegularXML=new XMLHttpRequest();
    jmaRegularXML.open('GET',urlJmaRegularL);
    jmaRegularXML.onreadystatechange=function(){
      if (jmaRegularXML.readyState == 4 && jmaRegularXML.status == 200){
        let date= new Date();
        let strDate = date.getFullYear()
                      + ('0' + (date.getMonth() + 1)).slice(-2)
                      + ('0' + date.getDate()).slice(-2);
        let strExp  = '//myns:link[contains(@href,"'
                    + strDate
                    + '") and contains(@href,"_VPFD50_") and contains(@href,"'
                    + codePrefecture
                    + '")]';
        let elms = evaluateXPath(jmaRegularXML.responseXML, strExp);
        if(!elms.length) { // 当日の府県天気予報がまだ未発表のとき
          strDate = date.getFullYear()
                  + ('0' + (date.getMonth() + 1)).slice(-2)
                  + ('0' + (date.getDate()-1)).slice(-2);
          strExp  = '//myns:link[contains(@href,"'
                  + strDate
                  + '") and contains(@href,"_VPFD50_") and contains(@href,"'
                  + codePrefecture
                  + '")]';
          elms = evaluateXPath(jmaRegularXML.responseXML, strExp);
        }
        if(elms.length) {
          urlJmaDaily = elms[0].getAttribute('href');
          getDailyXML(sendResponse);
        } else {
          console.log('府県予報未発表');
        }
      }
    }
    jmaRegularXML.send(null);
    // }}}
  }

  function openHtb() {
    // {{{
    chrome.tabs.create(
      {"url":"https://www.hbc.co.jp/weather/pro-weather.html","windowId":windowId},
      function (tabs){}
    );
    // }}}
  }

  function openJma() {
    // {{{
    chrome.tabs.create(
      {"url":"https://www.jma.go.jp/jma/index.html","windowId":windowId},
      function (tabs){}
    );
    // }}}
  }

  chrome.runtime.onMessage.addListener(
    function(request,sender,sendResponse){
      if(request.command == "getDaily") {
        codePrefecture = request.prefecture;
        getUrlJmaRegular(sendResponse);
      } else if (request.command == "jma" ) {
        openJma();
      } else if (request.command == "htb" ) {
        openHtb();
      }
      return true;
    }
  );

  chrome.windows.getCurrent({populate: true},function(win){
    windowId=win.id;
  });
  //}}}
})();
