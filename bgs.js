(function(){
  const mainURL = chrome.extension.getURL("popup/main.html");
  const urlJmaRegular = 'https://www.data.jma.go.jp/developer/xml/feed/regular.xml';
  const urlJmaRegularL = 'https://www.data.jma.go.jp/developer/xml/feed/regular_l.xml';
  let windowId;
  let weatherXMLData;
  let jmaRegularXML;
  let jmaRegularLXML;
  let urlJmaOverall;
  let jmaOverallXML;
  let urlJmaDaily;
  let jmaDailyXML;
  let urlJmaWeekly;
  let jmaWeeklyXML;
  let storeSendResponse;

  // 日毎府県天気予報データ
  let day = {
    date    : "", // 日付
    weather : "", // 天気文字列
    wcode   : "", // 天気コード
    temp    : [], // 最高気温/最低気温
    prob    : []  // 降水確率
  };

  // 段毎天気予報データ
  let step = {
    region  : "", // 地方(ex. 北部、南部等
    days    : []  // 日別府県天気予報データ
  };

  // 府県天気予報
  let forecast = {
    prefecture : "",  // 地域コード
    overall    : "",  // 府県天気概況
    steps      : []   // 段別天気予報データ
  };

  function evaluateXPath(prefix, aNode, aExpr) {
    // {{{
    // var elms=evaluateXPath(documentNode, '//myns:entry');
    // See URL for xpath expressions
    // https://developer.mozilla.org/ja/docs/Web/XPath/Introduction_to_using_XPath_in_JavaScript#implementing_a_user_defined_namespace_resolver
    var resolver = function(prefix) {
      var ns = {
        'regular' : 'http://www.w3.org/2005/Atom',
        'overall' : 'http://xml.kishou.go.jp/jmaxml1/body/meteorology1/'
      };
      return ns[prefix] || null;
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

  function sendJSON() {
    // {{{
    storeSendResponse({doc:JSON.stringify(forecast)});
    // }}}
  }

  function set2DayWeater() {
    // {{{
    let doc = jmaDailyXML.responseXML;
    sendJSON();
    // }}}
  }

  function getDailyXML(){
    // {{{
    jmaDailyXML= new XMLHttpRequest();
    jmaDailyXML.open('GET',urlJmaDaily);
    jmaDailyXML.onreadystatechange=function(){
      if (jmaDailyXML.readyState == 4 && jmaDailyXML.status == 200){
        set2DayWeater();
      }
    }
    jmaDailyXML.send(null);
    // }}}
  }

  function getUrlDaily(){
    // {{{
    let ret = false;
    let date= new Date();
    let strDate = date.getFullYear()
                  + ('0' + (date.getMonth() + 1)).slice(-2)
                  + ('0' + date.getDate()).slice(-2);
    let strExp  = '//myns:link[contains(@href,"'
                + strDate
                + '") and contains(@href,"_VPFD50_") and contains(@href,"'
                + forecast.prefecture
                + '")]';
    let elms = evaluateXPath(jmaRegularXML.responseXML, strExp);
    if(!elms.length) { // 当日の府県天気予報がまだ未発表のとき
      strDate = date.getFullYear()
              + ('0' + (date.getMonth() + 1)).slice(-2)
              + ('0' + (date.getDate()-1)).slice(-2);
      strExp  = '//myns:link[contains(@href,"'
              + strDate
              + '") and contains(@href,"_VPFD50_") and contains(@href,"'
              + forecast.prefecture
              + '")]';
      elms = evaluateXPath(jmaRegularXML.responseXML, strExp);
    }
    if(elms.length) {
      ret = elms[0].getAttribute('href');
    }
    return ret;
    // }}}
  }

  function setOverall() {
    // {{{
    let doc     = jmaOverallXML.responseXML;
    let strExp  = '//overall:Text[@type="本文"]/text()';
    let elms    = evaluateXPath('overall', doc, strExp);
    forecast.overall = elms[0].nodeValue;
    sendJSON();
    // }}}
  }

  function getOverallXML(){
    // {{{
    jmaOverallXML = new XMLHttpRequest();
    jmaOverallXML.open('GET',urlJmaOverall);
    jmaOverallXML.onreadystatechange=function(){
      if (jmaOverallXML.readyState == 4 && jmaOverallXML.status == 200){
        setOverall();
      }
    }
    jmaOverallXML.send(null);
    // }}}
  }

  function getUrlOverall(){
    // {{{
    let ret = false;
    let date= new Date();
    let strDate = date.getFullYear()
                  + ('0' + (date.getMonth() + 1)).slice(-2)
                  + ('0' + date.getDate()).slice(-2);
    let strExp  = '//regular:link[contains(@href,"'
                + strDate
                + '") and contains(@href,"_VPFG50_") and contains(@href,"'
                + forecast.prefecture
                + '")]';
    let elms = evaluateXPath('regular', jmaRegularXML.responseXML, strExp);
    if(!elms.length) { // 当日の府県天気概況がまだ未発表のとき
      strDate = date.getFullYear()
              + ('0' + (date.getMonth() + 1)).slice(-2)
              + ('0' + (date.getDate()-1)).slice(-2);
      strExp  = '//regular:link[contains(@href,"'
              + strDate
              + '") and contains(@href,"_VPFG50_") and contains(@href,"'
              + forecast.prefecture
              + '")]';
      elms = evaluateXPath('regular', jmaRegularXML.responseXML, strExp);
    }
    if(elms.length) {
      ret = elms[0].getAttribute('href');
    }
    return ret;
    // }}}
  }

  /*
  function getUrlJmaRegularL(sendResponse){
    // {{{
    jmaRegularXML=new XMLHttpRequest();
    jmaRegularXML.open('GET',urlJmaRegular);
    jmaRegularXML.onreadystatechange=function(){
      if (jmaRegularXML.readyState == 4 && jmaRegularXML.status == 200){
        let strExp='//myns:id[contains(text(),"_VPFW50_'
                    + forecast.prefecture
                    + '") and contains(text(),"'
                    + strDate
                    + '")]/../myns:link';
        let elms = evaluateXPath(jmaRegularXML.responseXML, strExp);
      }
    }
    jmaRegularXML.send(null);
    // }}}
  }
  */

  function getUrlJmaRegular(){
    // {{{
    jmaRegularXML=new XMLHttpRequest();
    jmaRegularXML.open('GET',urlJmaRegularL);
    jmaRegularXML.onreadystatechange=function(){
      if (jmaRegularXML.readyState == 4 && jmaRegularXML.status == 200){
        urlJmaOverall = getUrlOverall();  // store URL of Jma Overall
        if(urlJmaOverall) {
          getOverallXML();
        } else {
          console.log('府県天気概況未発表');
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

  // データ取得要求応答処理
  chrome.runtime.onMessage.addListener(
    // {{{
    function(request,sender,sendResponse){
      storeSendResponse = sendResponse;
      if(request.command == "getWeather") {
        forecast.prefecture = request.prefecture;
        getUrlJmaRegular();
      } else if (request.command == "jma" ) {
        openJma();
      } else if (request.command == "htb" ) {
        openHtb();
      }
      return true;
    }
    // }}}
  );

  browser.browserAction.onClicked.addListener((tab)=>{
    // {{{
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

  chrome.windows.getCurrent({populate: true},function(win){
    windowId=win.id;
  });
  //}}}
})();
