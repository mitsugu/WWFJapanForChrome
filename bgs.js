(function(){
  const mainURL = chrome.extension.getURL("popup/main.html");
  const urlJmaRegular = 'http://www.data.jma.go.jp/developer/xml/feed/regular.xml';
  const urlJmaRegularL = 'http://www.data.jma.go.jp/developer/xml/feed/regular_l.xml';
  let windowId;
  let jmaRegularXML;
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
    temps   : [], // 最高気温/最低気温
    probs   : []  // 降水確率
  };

  // 段毎天気予報データ
  let step = {
    region  : "", // 地方(ex. 北部、南部等
    days    : []  // 日別府県天気予報データ
  };

  // 府県天気予報
  let forecast = {
    date        : "",
    prefecture  : "",  // 地域コード
    overall     : "",  // 府県天気概況
    steps       : []   // 段別天気予報データ
  };

  function evaluateXPath(prefix, aNode, aExpr) {
    // {{{
    // var elms=evaluateXPath(documentNode, '//myns:entry');
    // See URL for xpath expressions
    // https://developer.mozilla.org/ja/docs/Web/XPath/Introduction_to_using_XPath_in_JavaScript#implementing_a_user_defined_namespace_resolver
    var resolver = function(prefix) {
      var ns = {
        'regular'     : 'http://www.w3.org/2005/Atom',
        'overallhead' : 'http://xml.kishou.go.jp/jmaxml1/informationBasis1/',
        'overall'     : 'http://xml.kishou.go.jp/jmaxml1/body/meteorology1/',
        'rtd'         : 'http://xml.kishou.go.jp/jmaxml1/',
        'bdd'         : 'http://xml.kishou.go.jp/jmaxml1/body/meteorology1/',
        'jmx_eb'      : 'http://xml.kishou.go.jp/jmaxml1/elementBasis1/',
        'rtw'         : 'http://xml.kishou.go.jp/jmaxml1/',
        'bdw'         : 'http://xml.kishou.go.jp/jmaxml1/body/meteorology1/'
      };
      return ns[prefix] || null;
    };
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

  function setWeeklyProbs(pStep, pDay){
    // 実装中(AM 10:30 までにテストを終えること)
    // {{{
    let doc     = jmaWeeklyXML.responseXML;

    if(pStep < forecast.steps.length){
      rstep     = (pStep==0)?pStep:((1==getStepNo())?0:1);

      forecast.steps[pStep].days[pDay+2].probs  = new Array();

      // 降水確率
      strExp      = '//bdw:MeteorologicalInfos[@type="区域予報"]'
                  + '//bdw:Item'
                  + '//jmx_eb:ProbabilityOfPrecipitation[@type="日降水確率" and @refID="'
                  + (getSkipDayNo()+pDay+1)
                  + '"]/text()';
      elms        = evaluateXPath('bdw', doc, strExp);
      forecast.steps[pStep].days[pDay+2].probs.push(elms[0].nodeValue);
    }
    // }}}
  }

  function setWeeklyTemps(pStep, pDay){
    // 実装中(AM 10:30 までにテストを終えること)
    // {{{
    let temp    = new Array();
    let doc     = jmaWeeklyXML.responseXML;
    if(pStep < forecast.steps.length){
      rstep     = (pStep==0)?pStep:((1==getStepNo())?0:1);
      //forecast.steps[pStep].days[pDay+skipNo].temps = new Array();
      forecast.steps[pStep].days[pDay+2].temps = new Array();
      let skipNo  = getSkipDayNo();

      // 最低気温
      strExp      = '//bdw:MeteorologicalInfos[@type="地点予報"]'
                  + '//bdw:Item'
                  + '//jmx_eb:Temperature[@type="最低気温" and @refID="'
                  + (skipNo+pDay+1)
                  + '"]/text()';
      elms        = evaluateXPath('bdw', doc, strExp);
      //forecast.steps[pStep].days[pDay+skipNo].temps.push(elms[0].nodeValue);
      forecast.steps[pStep].days[pDay+2].temps.push(elms[0].nodeValue);

      // 最高気温
      strExp      = '//bdw:MeteorologicalInfos[@type="地点予報"]'
                  + '//bdw:Item'
                  + '//jmx_eb:Temperature[@type="最高気温" and @refID="'
                  + (skipNo+pDay+1)
                  + '"]/text()';
      elms        = evaluateXPath('bdw', doc, strExp);
      forecast.steps[pStep].days[pDay+2].temps.push(elms[0].nodeValue);
    }
    // }}}
  }

  function setDWeeklyWeather(pStep, pDay){
    // 実装中(AM 10:30 までにテストを終えること)
    // {{{
    let dateXML,strExp,elms,rstep;
    let doc     = jmaWeeklyXML.responseXML;
    let skipNo  = getSkipDayNo();
    if(pStep < forecast.steps.length){
      rstep   = (pStep==0)?pStep:((1==getStepNo())?0:1);
      // 日付
      strExp    = '//bdw:MeteorologicalInfos[@type="区域予報"]'
                + '//bdw:TimeDefine[@timeId="'
                + (pDay+skipNo+1)
                + '"]'
                + '/bdw:DateTime/text()'
      elms      = evaluateXPath('bdw', doc, strExp);
      day.date  = elms[0].nodeValue.substr(5,5).replace(/-/,"/");

      // 天気文字列
      strExp      = '//bdw:MeteorologicalInfos[@type="区域予報"]'
                  + '//bdw:Item['
                  + (rstep+1)
                  + ']'
                  + '//bdw:WeatherPart'
                  + '/jmx_eb:Weather[@refID="'
                  + (pDay+skipNo+1)
                  + '"]/text()';
      elms        = evaluateXPath('bdw', doc, strExp);
      day.weather = elms[0].nodeValue;

      // 天気コード
      strExp    = '//bdw:MeteorologicalInfos[@type="区域予報"]'
                + '//bdw:Item['
                + (rstep+1)
                + ']'
                + '//bdw:WeatherCodePart'
                + '/jmx_eb:WeatherCode[@refID="'
                + (pDay+skipNo+1)
                + '"]/text()';
      elms      = evaluateXPath('bdw', doc, strExp);
      day.wcode = elms[0].nodeValue;

      forecast.steps[pStep].days.push({...day});
    }
    // }}}
  }

  function getWDate(pDay){
    // {{{
    let doc     = jmaWeeklyXML.responseXML;
    let strExp  = '//bdw:MeteorologicalInfos[@type="区域予報"]'
                + '//bdw:TimeDefine[@timeId="'
                + (pDay+1)
                + '"]/bdw:DateTime/text()';
    let items   = evaluateXPath('bdw', doc, strExp);
    return items[0].nodeValue.replace(/-/g,"").substr(0,8);
    // }}}
  }

  function getSkipDayNo(){
    // 実装中(AM 10:30 までにテストを終えること)
    // {{{
    let date    = new Date(
                        forecast.date.substr(0,4),
                        forecast.date.substr(4,2)-1,
                        forecast.date.substr(6,2)
                  );
    date.setDate(date.getDate()+2);
    let strDate = date.getFullYear()
                + ('0' + (date.getMonth() + 1)).slice(-2)
                + ('0' + date.getDate()).slice(-2);
    let max = getDayNo();
    for(var i=0; i<max; i++){
      let dateXML = getWDate(i);
      if(strDate==dateXML) break;
    }
    return i;
    // }}}
  }

  function getDayNo(){
    // {{{
    let doc     = jmaWeeklyXML.responseXML;
    strExp  = '//bdw:MeteorologicalInfos[@type="区域予報"]'
                + '//bdw:Item[1]'
                + '//bdw:WeatherPart'
                + '/jmx_eb:Weather';
    items   = evaluateXPath('bdw', doc, strExp);
    if(items.length) return items.length;
    return 0;
    // }}}
  }

  function getStepNo(){
    // {{{
    let doc     = jmaWeeklyXML.responseXML;
    let strExp  = '//bdw:MeteorologicalInfos[@type="区域予報"]//bdw:Item';
    let items   = evaluateXPath('bdw', doc, strExp);
    if(items.length) return items.length;
    return 0;
    // }}}
  }

  function setWeeklyWeather(){
    // 実装中(AM 10:30 までにテストを終えること)
    // 7日分のデータと8日分のデータが存在するので対応すること
    // {{
    let noStep  = getStepNo();
    let max     = getDayNo()-getSkipDayNo();
    for(var i=0;i<2; i++){
      for(var j=0;j<max;j++){
        setDWeeklyWeather(i,j);
        setWeeklyTemps(i,j);
        setWeeklyProbs(i,j);
      }
    }
    // }}
  }

  function getWeeklyXML(){
    // 実装中(AM 10:30 までにテストを終えること)
    // {{{
    jmaWeeklyXML = new XMLHttpRequest();
    jmaWeeklyXML.open('GET',urlJmaWeekly);
    jmaWeeklyXML.onreadystatechange=function(){
      if (jmaWeeklyXML.readyState == 4 && jmaWeeklyXML.status == 200){
        setWeeklyWeather();
        sendJSON();
      }
    }
    jmaWeeklyXML.send(null);
    // }}}
  }

  function getUrlWeekly(){
    // 実装中(AM 10:30 までにテストを終えること)
    // {{{
    let strDate, strExp;
    let ret = "";
    let date  = new Date(
      forecast.date.substr(0,4),
      forecast.date.substr(4,2)-1,
      forecast.date.substr(6,2)
    );
    for(var i=0;i<2;i++){
      date.setDate(date.getDate()-i);
      strDate = date.getFullYear()
              + ('0' + (date.getMonth() + 1)).slice(-2)
              + ('0' + date.getDate()).slice(-2);
      strExp  = '//regular:link[contains(@href,"'
              + strDate
              + '") and contains(@href,"_VPFW50_") and contains(@href,"'
              + forecast.prefecture
              + '")]';
      let elms = evaluateXPath('regular', jmaRegularXML.responseXML, strExp);
      if(elms.length){
        ret = elms[0].getAttribute('href');
        break;
      }
    }
    return ret;
    // }}}
  }

  function setStep2DayTemps(pStep){
    // {{{
    let doc     = jmaDailyXML.responseXML;
    let strExp  = '//bdd:MeteorologicalInfos[@type="地点予報"][1]'
                + '/bdd:TimeSeriesInfo[1]'
                + '//bdd:TimeDefine';
    let items   = evaluateXPath('bdd', doc, strExp);
    let cntAll  = items.length;
    let date, time, strDuration,strType, strTemp,noTemp;
    for(var i=0;i<2;i++){
      forecast.steps[pStep].days[i].temps = new Array();
    }
    for(var i=0;i<cntAll;i++){
      // 日中最高気温・朝の最低気温以外をスキップするためのチェック
      strExp      = '//bdd:MeteorologicalInfos[@type="地点予報"][1]'
                  + '/bdd:TimeSeriesInfo[1]'
                  + '//bdd:TimeDefine[@timeId="'+(i+1)+'"]/bdd:Duration/text()';
      items       = evaluateXPath('bdd', doc, strExp);
      strDuration = items[0].nodeValue;
      if(strDuration != "PT9H") continue;

      // 日付
      strExp  = '//bdd:MeteorologicalInfos[@type="地点予報"][1]'
              + '/bdd:TimeSeriesInfo[1]'
              + '//bdd:TimeDefine[@timeId="'+(i+1)+'"]/bdd:DateTime/text()';
      items   = evaluateXPath('bdd', doc, strExp);
      date    = items[0].nodeValue.replace(/-/g,"").substr(0,8);
      // タイプ
      strExp  = '//bdd:MeteorologicalInfos[@type="地点予報"][1]'
              + '/bdd:TimeSeriesInfo[1]'
              + '/bdd:Item['+(pStep+1)+']'
              + '//jmx_eb:Temperature[@refID="'+(i+1)+'"]/@type';
      items   = evaluateXPath('bdd', doc, strExp);
      strType = items[0].nodeValue;
      // 温度
      strExp  = '//bdd:MeteorologicalInfos[@type="地点予報"][1]'
              + '/bdd:TimeSeriesInfo[1]'
              + '/bdd:Item['+(pStep+1)+']'
              + '//jmx_eb:Temperature[@refID="'+(i+1)+'"]/text()';
      items   = evaluateXPath('bdd', doc, strExp);
      strTemp = items[0].nodeValue;

      // json への push
      if(forecast.date==date){// 今日
        if(strType=="朝の最低気温"){
          forecast.steps[pStep].days[0].temps.push(strTemp);
        }else{
          noTemp = forecast.steps[pStep].days[0].temps.length
          if(noTemp<1){
            forecast.steps[pStep].days[0].temps.push("");
          }
          forecast.steps[pStep].days[0].temps.push(strTemp);
        }
      }else{                    // 明日
        if(strType=="朝の最低気温"){
          noTemp = 2 - forecast.steps[pStep].days[0].temps.length;
          for(var j=0;j<noTemp;j++){
            forecast.steps[pStep].days[0].temps.push("");
          }
          forecast.steps[pStep].days[1].temps.push(strTemp);
        }else{
          forecast.steps[pStep].days[1].temps.push(strTemp);
        }
      }
    }
    // }}}
  }

  function setStep2DayProbs(pStep){
    // {{{
    let doc     = jmaDailyXML.responseXML;
    let strExp  = '//bdd:MeteorologicalInfos[@type="区域予報"][1]'
                + '/bdd:TimeSeriesInfo[2]'
                + '//bdd:TimeDefine';
    items       = evaluateXPath('bdd', doc, strExp);
    let cntAll  = items.length;
    let getPnt  = 1;
    for(var i=0;i<2;i++){
      forecast.steps[pStep].days[i].probs = new Array();
      let cntSkip     = (i==0)?(8-cntAll):0;
      for (var j=0; j<cntSkip; j++){
        forecast.steps[pStep].days[i].probs.push("--");
      }
      let max         = 4 - cntSkip;
      for (var j=0; j<max;j++){
        strExp  = '//bdd:MeteorologicalInfos[@type="区域予報"][1]'
                + '/bdd:TimeSeriesInfo[2]'
                + '/bdd:Item['+(pStep+1)+']'
                + '//jmx_eb:ProbabilityOfPrecipitation[@refID="'
                + getPnt
                + '"]/text()';
        items   = evaluateXPath('bdd', doc, strExp);
        forecast.steps[pStep].days[i].probs.push(items[0].nodeValue);
        getPnt++;
      }
    }
    // }}}
  }

  function setStep2DayWeater(pStep){
    // {{{
    let doc     = jmaDailyXML.responseXML;
    // 地方名設定
    strExp  = '//bdd:MeteorologicalInfos[@type="区域予報"][1]'
            + '/bdd:TimeSeriesInfo[1]'
            + '/bdd:Item['+(pStep+1)+']'
            + '//bdd:Name/text()';
    items   = evaluateXPath('bdd', doc, strExp);
    step.region = items[0].nodeValue;

    // 天気予報設定
    step.days = Array();
    const maxDays   = 2;
    for (var i=0; i<maxDays; i++) {
      // 日付設定
      strExp    = '//bdd:MeteorologicalInfos[@type="区域予報"][1]'
                + '/bdd:TimeSeriesInfo[1]'
                + '//bdd:TimeDefine[@timeId="'+ (i+1) +'"]'
                + '/bdd:DateTime/text()';
      items     = evaluateXPath('bdd', doc, strExp);
      day.date  = items[0].nodeValue.substr(5,5).replace(/-/,"/");

      //  天気設定
      strExp    = '//bdd:MeteorologicalInfos[@type="区域予報"][1]'
                + '/bdd:TimeSeriesInfo[1]'
                + '//bdd:TimeDefine[@timeId="'+ (i+1) +'"]'
                + '/../../bdd:Item['+(pStep+1)+']'
                + '//jmx_eb:Weather[@refID="'+(i+1)+'"]'
                + '/text()';
      items     = evaluateXPath('bdd', doc, strExp);
      day.weather = items[0].nodeValue;

      //  天気コード設定
      strExp    = '//bdd:MeteorologicalInfos[@type="区域予報"][1]'
                + '/bdd:TimeSeriesInfo[1]'
                + '//bdd:TimeDefine[@timeId="'+ (i+1) +'"]'
                + '/../../bdd:Item['+(pStep+1)+']'
                + '//jmx_eb:WeatherCode[@refID="'+(i+1)+'"]'
                + '/text()';
      items     = evaluateXPath('bdd', doc, strExp);
      day.wcode = items[0].nodeValue;

      step.days.push({...day});
    }
    return ;
    // }}}
  }

  function set2DayWeather(){
    // {{{
    let doc     = jmaDailyXML.responseXML;
    let strExp  = '//bdd:MeteorologicalInfos[@type="区域予報"][1]'
                + '/bdd:TimeSeriesInfo[1]'
                + '/bdd:Item';
    let items   = evaluateXPath('bdd', doc, strExp);
    let stepNo  = items.length;

    forecast.steps   = new Array();
    for (var i=0; i<stepNo; i++){
      setStep2DayWeater(i);
      forecast.steps.push({...step});
      setStep2DayProbs(i);
      setStep2DayTemps(i);
    }
    // }}}
  }

  function getUrlJmaRegularL(){
    // 実装中(AM 10:30 までにテストを終えること)
    // {{{
    jmaRegularXML=new XMLHttpRequest();
    jmaRegularXML.open('GET',urlJmaRegularL);
    jmaRegularXML.onreadystatechange=function(){
      if (jmaRegularXML.readyState == 4 && jmaRegularXML.status == 200){
        urlJmaWeekly = getUrlWeekly();
        if(urlJmaWeekly.length){
          getWeeklyXML();
        }else{
          console.log('府県週間予報 XML の URL が見つからない');
        }
      }
    }
    jmaRegularXML.send(null);
    // }}}
  }

  function getDailyXML(){
    // 実装中(AM 10:30 までにテストを終えること)
    // {{{
    jmaDailyXML= new XMLHttpRequest();
    jmaDailyXML.open('GET',urlJmaDaily);
    jmaDailyXML.onreadystatechange=function(){
      if (jmaDailyXML.readyState == 4 && jmaDailyXML.status == 200){
        set2DayWeather();
        urlJmaWeekly = getUrlWeekly();  // store URL of weekly weather forecast
        if(urlJmaWeekly.length){
          getWeeklyXML();
        }else{
          getUrlJmaRegularL();
        }
      }
    }
    jmaDailyXML.send(null);
    // }}}
  }

  function getUrlDaily(){
    // {{{
    let doc     = jmaRegularXML.responseXML;
    let strExp  = "";
    let elms;
    let strDate = forecast.date;
    let cnt = 0;
    let ret = "";
    for(var i=0; i<2; i++){
      let date    = new Date(
                      forecast.date.substr(0,4),
                      (forecast.date.substr(4,2)-1),
                      forecast.date.substr(6,2)
                    );
      date.setDate(date.getDate()-i);
      strDate = date.getFullYear()
              + ('0' + (date.getMonth() + 1)).slice(-2)
              + ('0' + date.getDate()).slice(-2);
      strExp  = '//regular:link[contains(@href,"'
              + strDate
              + '") and contains(@href,"_VPFD50_") and contains(@href,"'
              + forecast.prefecture
              + '")]';
      elms    = evaluateXPath('regular', doc, strExp);
      if(elms.length>0){
        ret = elms[0].getAttribute('href');
        break;
      }
    }
    return ret;
    // }}}
  }

  function setOverall() {
    // {{{
    let doc     = jmaOverallXML.responseXML;
    let strExp  = '//overall:Text[@type="本文"]/text()';
    let elms    = evaluateXPath('overall', doc, strExp);
    if(elms.length){
      forecast.overall = elms[0].nodeValue;
    }
    // }}}
  }

  function setTargetDate(){
    // {{{
    let doc       = jmaOverallXML.responseXML;
    let strExp    = '//overallhead:TargetDateTime/text()';
    let elms      = evaluateXPath('overallhead', doc, strExp);
    forecast.date = elms[0].nodeValue.replace(/-/g,"").substr(0,8);
    // }}}
  }

  function getOverallXML(){
    // {{{
    jmaOverallXML = new XMLHttpRequest();
    jmaOverallXML.open('GET',urlJmaOverall);
    jmaOverallXML.onreadystatechange=function(){
      if (jmaOverallXML.readyState == 4 && jmaOverallXML.status == 200){
        setTargetDate();
        setOverall();
        urlJmaDaily = getUrlDaily();  // store URL of daily weather forecast
        getDailyXML();
      }
    }
    jmaOverallXML.send(null);
    // }}}
  }

  function getUrlOverall(){
    // {{{
    let strDate,strExp;
    let ret = "";
    let date= new Date();
    for(var i=0;i<2;i++){
      date.setDate(date.getDate()-i);
      strDate = date.getFullYear()
              + ('0' + (date.getMonth() + 1)).slice(-2)
              + ('0' + date.getDate()).slice(-2);
      strExp  = '//regular:link[contains(@href,"'
              + strDate
              + '") and contains(@href,"_VPFG50_") and contains(@href,"'
              + forecast.prefecture
              + '")]';
      let elms = evaluateXPath('regular', jmaRegularXML.responseXML, strExp);
      if(elms.length) {
        ret = elms[0].getAttribute('href');
        break;
      }
    }
    return ret;
    // }}}
  }

  function checkWeeklyData(){
    // {{{
    let ret = false;
    let date= new Date();
    let strDate = date.getFullYear()
                  + ('0' + (date.getMonth() + 1)).slice(-2)
                  + ('0' + date.getDate()).slice(-2);
    let strExp  = '//regular:link[contains(@href,"'
                + strDate
                + '") and contains(@href,"_VPFW50_") and contains(@href,"'
                + forecast.prefecture
                + '")]';
    let elms = evaluateXPath('regular', jmaRegularXML.responseXML, strExp);
    if(elms.length) { // 当日の府県週間天気予報が発表済みのとき
      ret = true;
    }
    return ret;
    // }}}
  }

  function getUrlJmaRegular(){
    // デバッグ中
    // {{{
    jmaRegularXML=new XMLHttpRequest();
    jmaRegularXML.open('GET',urlJmaRegular);
    jmaRegularXML.onreadystatechange=function(){
      if (jmaRegularXML.readyState == 4 && jmaRegularXML.status == 200){
        urlJmaOverall = getUrlOverall();  // store URL of Jma Overall
        if(urlJmaOverall.length>0) {
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
