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

  // 府県天気予報
  let forecast = {
    date        : "",
    prefecture  : "",   // 地域コード
    region      : "",   // 地方(ex. 北部、南部等
    overall     : "",   // 府県天気概況
    days        : []    // 日別府県天気予報データ
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

  function setWeeklyProbs(pDay){
    // {{{
    let doc       = jmaWeeklyXML.responseXML;
    let itemIndex = getWItemIndex();

    forecast.days[pDay+2].probs  = new Array();

    // 降水確率
    strExp      = '//bdw:MeteorologicalInfos[@type="区域予報"]'
                + '//bdw:Item['
                + itemIndex
                + ']'
                + '//jmx_eb:ProbabilityOfPrecipitation[@type="日降水確率" and @refID="'
                + (getSkipDayNo()+pDay+1)
                + '"]/text()';
    elms        = evaluateXPath('bdw', jmaWeeklyXML, strExp);
    forecast.days[pDay+2].probs.push(elms[0].nodeValue);
    // }}}
  }

  function setWeeklyTemps(pDay){
    // {{{
    let doc       = jmaWeeklyXML.responseXML;
    let itemIndex = getWItemIndex();

    forecast.days[pDay+2].temps = new Array();
    let skipNo  = getSkipDayNo();

    // 最低気温
    strExp      = '//bdw:MeteorologicalInfos[@type="地点予報"]'
                + '//bdw:Item['
                + itemIndex
                + ']'
                + '//jmx_eb:Temperature[@type="最低気温" and @refID="'
                + (skipNo+pDay+1)
                + '"]/text()';
    elms        = evaluateXPath('bdw', jmaWeeklyXML, strExp);
    forecast.days[pDay+2].temps.push(elms[0].nodeValue);

    // 最高気温
    strExp      = '//bdw:MeteorologicalInfos[@type="地点予報"]'
                + '//bdw:Item['
                + itemIndex
                + ']'
                + '//jmx_eb:Temperature[@type="最高気温" and @refID="'
                + (skipNo+pDay+1)
                + '"]/text()';
    elms        = evaluateXPath('bdw', jmaWeeklyXML, strExp);
    forecast.days[pDay+2].temps.push(elms[0].nodeValue);
    // }}}
  }

  function getWItemMax(){
    // {{{
    let strExp  = '//bdw:MeteorologicalInfos[@type="区域予報"]'
                + '/bdw:TimeSeriesInfo'
                + '//bdw:Item';
    let items   = evaluateXPath('bdw', jmaWeeklyXML, strExp);
    return items.length;
    // }}}
  }

  function getWItemIndex(){
    // {{{
    let strExp, items;
    let ret = 0;
    let doc = jmaWeeklyXML.responseXML;
    let max = getWItemMax();
    let i;
    for(i=0; i<max; i++){
      strExp  = '//bdw:MeteorologicalInfos[@type="区域予報"]'
              + '/bdw:TimeSeriesInfo[1]'
              + '//bdw:Item['
              + (i+1)
              + ']/bdw:Area/bdw:Name/text()';
      items   = evaluateXPath('bdd', jmaWeeklyXML, strExp);
      if(items[0].nodeValue==forecast.region){
        ret = i+1;
        break;
      }
    }
    if(i==max) ret=1; // 一次細分区分ではなく都道府県指定の場合

    return ret;
    // }}}
  }

  function setDWeeklyWeather(pDay){
    // {{{
    let dateXML,strExp,elms;
    let skipNo    = getSkipDayNo();
    let itemIndex = getWItemIndex();

    // 日付
    strExp    = '//bdw:MeteorologicalInfos[@type="区域予報"]'
              + '//bdw:TimeDefine[@timeId="'
              + (pDay+skipNo+1)
              + '"]'
              + '/bdw:DateTime/text()'
    elms      = evaluateXPath('bdw', jmaWeeklyXML, strExp);
    day.date  = elms[0].nodeValue.substr(5,5).replace(/-/,"/");

    // 天気文字列
    strExp      = '//bdw:MeteorologicalInfos[@type="区域予報"]'
                + '//bdw:Item['
                + itemIndex
                + ']'
                + '//bdw:WeatherPart'
                + '/jmx_eb:Weather[@refID="'
                + (pDay+skipNo+1)
                + '"]/text()';
    elms        = evaluateXPath('bdw', jmaWeeklyXML, strExp);
    day.weather = elms[0].nodeValue;

    // 天気コード
    strExp    = '//bdw:MeteorologicalInfos[@type="区域予報"]'
              + '//bdw:Item['
              + itemIndex
              + ']'
              + '//bdw:WeatherCodePart'
              + '/jmx_eb:WeatherCode[@refID="'
              + (pDay+skipNo+1)
              + '"]/text()';
    elms      = evaluateXPath('bdw', jmaWeeklyXML, strExp);
    day.wcode = elms[0].nodeValue;

    forecast.days.push({...day});
    // }}}
  }

  function getWDate(pDay){
    // {{{
    let doc     = jmaWeeklyXML.responseXML;
    let strExp  = '//bdw:MeteorologicalInfos[@type="区域予報"]'
                + '//bdw:TimeDefine[@timeId="'
                + (pDay+1)
                + '"]/bdw:DateTime/text()';
    let items   = evaluateXPath('bdw', jmaWeeklyXML, strExp);
    return items[0].nodeValue.replace(/-/g,"").substr(0,8);
    // }}}
  }

  function getSkipDayNo(){
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
    strExp  = '//bdw:MeteorologicalInfos[@type="区域予報"]'
                + '//bdw:Item[1]'
                + '//bdw:WeatherPart'
                + '/jmx_eb:Weather';
    items   = evaluateXPath('bdw', jmaWeeklyXML, strExp);
    if(items.length) return items.length;
    return 0;
    // }}}
  }

  function setWeeklyWeather(){
    // {{{
    let max = getDayNo()-getSkipDayNo();
    for(var i=0;i<max;i++){
      setDWeeklyWeather(i);
      setWeeklyTemps(i);
      setWeeklyProbs(i);
    }
    // }}}
  }

  function getWeeklyXML(){
    // {{{
    fetch(urlJmaWeekly)
      .then(response => response.text())
      .then((data) => {
        let domparser = new DOMParser();
        jmaWeeklyXML  = domparser.parseFromString(data, "application/xml");
        setWeeklyWeather();
        sendJSON();
      });
    // }}}
  }

  function getUrlWeekly(){
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
      let elms = evaluateXPath('regular', jmaRegularXML, strExp);
      if(elms.length){
        ret = elms[0].getAttribute('href');
        break;
      }
    }
    return ret;
    // }}}
  }

  function conversionToPrimarySubdivision(){
    // 年間を通してメンテナンス必須(最低でも１年は未完)
    // {{{
    //   青森県の区分の扱いどうすんねん
    //   一次細分区分のデータ分を全部入れろよ！！気象庁の糞が！！
    //   そもそもこんな変換テーブルが必要って XML がゴミ仕様だろうが
    //   ゴミみたいな XML の設計しやがって！！ 担当者は無能かっ！！
    let tbl = {
      "011000" : {"宗谷地方":1,"_年間テスト":""},
      "012000" : {"上川地方":1,"留萌地方":1,"_年間テスト":""},
      "013000" : {"網走地方":1,"北見地方":1,"紋別地方":1,"_年間テスト":""},
      "014100" : {"釧路地方":1,"根室地方":1,"十勝地方":2,"_年間テスト":"*"},
      "015000" : {"胆振地方":1,"日高地方":1,"_年間テスト":""},
      "016000" : {"石狩地方":1,"空知地方":1,"後志地方":1,"_年間テスト":""},
      "017000" : {"渡島地方":1,"檜山地方":1,"_年間テスト":""},
      "020000" : {"津軽":1,"下北":2,"三八上北":2,"_年間テスト":"*"},
      "030000" : {"内陸":1,"沿岸":2,"_年間テスト":"*"},
      "040000" : {"東部":1,"西部":2,"_年間テスト":"*"},
      "050000" : {"沿岸":1,"内陸":1,"_年間テスト":""},
      "060000" : {"村山":1,"置賜":1,"庄内":1,"最上":1,"_年間テスト":""},
      "070000" : {"中通り":1,"浜通り":1,"会津":2,"_年間テスト":"*"},
      "080000" : {"北部":1,"南部":1,"_年間テスト":""},
      "090000" : {"南部":1,"北部":1,"_年間テスト":""},
      "100000" : {"南部":1,"北部":2,"_年間テスト":"*"},
      "110000" : {"北部":1,"南部":1,"秩父地方":1,"_年間テスト":""},
      "120000" : {"北西部":1,"北東部":1,"南部":1,"_年間テスト":""},
      "130000" : {"東京地方":1,"伊豆諸島北部":2,"伊豆諸島南部":2,"小笠原諸島":3,"_年間テスト":"*"},
      "140000" : {"東部":1,"西部":1,"_年間テスト":""},
      "150000" : {"下越":1,"中越":1,"上越":1,"佐渡":1,"_年間テスト":""},
      "160000" : {"東部":1,"西部":1,"_年間テスト":""},
      "170000" : {"加賀":1,"能登":1,"_年間テスト":""},
      "180000" : {"嶺北":1,"嶺南":1,"_年間テスト":""},
      "190000" : {"中・西部":1,"東部・富士五湖":1,"_年間テスト":""},
      "200000" : {"北部":1,"中部":1,"南部":1,"_年間テスト":"*"},
      "210000" : {"美濃地方":1,"飛騨地方":1,"_年間テスト":"*"},
      "220000" : {"中部":1,"西部":1,"東部":1,"伊豆":1,"_年間テスト":""},
      "230000" : {"西部":1,"東部":1,"_年間テスト":""},
      "240000" : {"北中部":1,"南部":1,"_年間テスト":""},
      "250000" : {"南部":1,"北部":2,"_年間テスト":"*"},
      "260000" : {"南部":1,"北部":2,"_年間テスト":"*"},
      "270000" : {"大阪府":1,"_年間テスト":""},
      "280000" : {"南部":1,"北部":2,"_年間テスト":"*"},
      "290000" : {"北部":1,"南部":2,"_年間テスト":"*"},
      "300000" : {"北部":1,"南部":2,"_年間テスト":"*"},
      "310000" : {"東部":1,"中・西部":1,"_年間テスト":""},
      "320000" : {"東部":1,"西部":1,"隠岐":1,"_年間テスト":""},
      "330000" : {"南部":1,"北部":1,"_年間テスト":"*"},
      "340000" : {"南部":1,"北部":1,"_年間テスト":"*"},
      "350000" : {"西部":1,"中部":1,"東部":1,"北部":1,"_年間テスト":""},
      "360000" : {"北部":1,"南部":1,"_年間テスト":""},
      "370000" : {"香川県":1,"_年間テスト":""},
      "380000" : {"中予":1,"東予":1,"南予":1,"_年間テスト":""},
      "390000" : {"中部":1,"東部":1,"西部":1,"_年間テスト":""},
      "400000" : {"福岡地方":1,"北九州地方":1,"筑豊地方":1,"筑後地方":1,"_年間テスト":""},
      "410000" : {"南部":1,"北部":1,"_年間テスト":""},
      "420000" : {"南部":1,"北部":1,"壱岐・対馬":1,"五島":1,"_年間テスト":"*"},
      "430000" : {"熊本地方":1,"阿蘇地方":1,"天草・芦北地方":1,"球磨地方":1,"_年間テスト":""},
      "440000" : {"中部":1,"北部":1,"西部":1,"南部":1,"_年間テスト":""},
      "450000" : {"南部平野部":1,"北部平野部":1,"南部山沿い":1,"北部山沿い":1,"_年間テスト":""},
      "460100" : {"薩摩地方":1,"大隅地方":1,"種子島・屋久島地方":1,"奄美地方":2,"_年間テスト":""},
      "471000" : {"本島中南部":1,"本島北部":1,"久米島":1,"_年間テスト":""},
      "472000" : {"大東島地方":1,"_年間テスト":""},
      "473000" : {"宮古島地方":1,"_年間テスト":""},
      "474000" : {"石垣島地方":1,"与那国島地方":1,"_年間テスト":""}
    };
    return tbl[forecast.prefecture][forecast.region];
    // }}}
  }

  function setStep2DayTemps(){
    // {{{
    let date, time, strDuration,strType, strTemp,noTemp;
    let strExp    = '//bdd:MeteorologicalInfos[@type="地点予報"][1]'
                  + '/bdd:TimeSeriesInfo[1]'
                  + '//bdd:TimeDefine';
    let items     = evaluateXPath('bdd', jmaDailyXML, strExp);
    let cntAll    = items.length;
    let itemIndex = conversionToPrimarySubdivision();
    for(var i=0;i<2;i++){
      forecast.days[i].temps = new Array();
    }
    for(var i=0;i<cntAll;i++){
      // 日中最高気温・朝の最低気温以外をスキップするためのチェック
      strExp      = '//bdd:MeteorologicalInfos[@type="地点予報"][1]'
                  + '/bdd:TimeSeriesInfo[1]'
                  + '//bdd:TimeDefine[@timeId="'+(i+1)+'"]/bdd:Duration/text()';
      items       = evaluateXPath('bdd', jmaDailyXML, strExp);
      strDuration = items[0].nodeValue;
      if(strDuration != "PT9H") continue;

      // 日付
      strExp  = '//bdd:MeteorologicalInfos[@type="地点予報"][1]'
              + '/bdd:TimeSeriesInfo[1]'
              + '//bdd:TimeDefine[@timeId="'+(i+1)+'"]/bdd:DateTime/text()';
      items   = evaluateXPath('bdd', jmaDailyXML, strExp);
      date    = items[0].nodeValue.replace(/-/g,"").substr(0,8);
      // タイプ
      strExp  = '//bdd:MeteorologicalInfos[@type="地点予報"][1]'
              + '/bdd:TimeSeriesInfo[1]'
              + '/bdd:Item['
              + itemIndex
              + ']'
              + '//jmx_eb:Temperature[@refID="'+(i+1)+'"]/@type';
      items   = evaluateXPath('bdd', jmaDailyXML, strExp);
      strType = items[0].nodeValue;
      // 温度
      strExp  = '//bdd:MeteorologicalInfos[@type="地点予報"][1]'
              + '/bdd:TimeSeriesInfo[1]'
              + '/bdd:Item['
              + itemIndex
              + ']'
              + '//jmx_eb:Temperature[@refID="'+(i+1)+'"]/text()';
      items   = evaluateXPath('bdd', jmaDailyXML, strExp);
      strTemp = items[0].nodeValue;

      // json への push
      if(forecast.date==date){// 今日
        if(strType=="朝の最低気温"){
          forecast.days[0].temps.push(strTemp);
        }else{
          noTemp = forecast.days[0].temps.length
          if(noTemp<1){
            forecast.days[0].temps.push("");
          }
          forecast.days[0].temps.push(strTemp);
        }
      }else{                    // 明日
        if(strType=="朝の最低気温"){
          noTemp = 2 - forecast.days[0].temps.length;
          for(var j=0;j<noTemp;j++){
            forecast.days[0].temps.push("");
          }
          forecast.days[1].temps.push(strTemp);
        }else{
          forecast.days[1].temps.push(strTemp);
        }
      }
    }
    // }}}
  }

  function setStep2DayProbs(){
    // {{{
    let doc       = jmaDailyXML.responseXML;
    let strExp    = '//bdd:MeteorologicalInfos[@type="区域予報"][1]'
                  + '/bdd:TimeSeriesInfo[2]'
                  + '//bdd:TimeDefine';
    let items     = evaluateXPath('bdd', jmaDailyXML, strExp);
    let cntAll    = items.length;
    let itemIndex = getItemIndex();
    let getPnt    = 1;

    for(var i=0;i<2;i++){
      forecast.days[i].probs = new Array();
      let cntSkip     = (i==0)?(8-cntAll):0;
      for (var j=0; j<cntSkip; j++){
        forecast.days[i].probs.push("--");
      }
      let max         = 4 - cntSkip;
      for (var j=0; j<max;j++){
        strExp  = '//bdd:MeteorologicalInfos[@type="区域予報"][1]'
                + '/bdd:TimeSeriesInfo[2]'
                + '/bdd:Item['
                + itemIndex
                + ']'
                + '//jmx_eb:ProbabilityOfPrecipitation[@refID="'
                + getPnt
                + '"]/text()';
        items   = evaluateXPath('bdd', jmaDailyXML, strExp);
        forecast.days[i].probs.push(items[0].nodeValue);
        getPnt++;
      }
    }
    // }}}
  }

  function getItemMax(){
    // {{{
    let strExp  = '//bdd:MeteorologicalInfos[@type="区域予報"][1]'
                + '/bdd:TimeSeriesInfo[1]'
                + '//bdd:Item';
    let items   = evaluateXPath('bdd', jmaDailyXML, strExp);
    return items.length;
    // }}}
  }

  function getItemIndex(){
    // {{{
    let strExp, items;
    let ret = 0;
    let max = getItemMax();
    for(var i=0; i<max; i++){
      strExp  = '//bdd:MeteorologicalInfos[@type="区域予報"][1]'
              + '/bdd:TimeSeriesInfo[1]'
              + '//bdd:Item['
              + (i+1)
              + ']/bdd:Area/bdd:Name/text()';
      items   = evaluateXPath('bdd', jmaDailyXML, strExp);
      if(items[0].nodeValue==forecast.region){
        ret = i+1;
        break;
      }
    }
    return ret;
    // }}}
  }

  function setStep2DayWeater(){
    // {{{
    let strExp,items;
    let itemIndex = getItemIndex();
    // 天気予報設定
    for (var i=0; i<2; i++) {
      // 日付設定
      strExp    = '//bdd:MeteorologicalInfos[@type="区域予報"][1]'
                + '/bdd:TimeSeriesInfo[1]'
                + '//bdd:TimeDefine[@timeId="'+ (i+1) +'"]'
                + '/bdd:DateTime/text()';
      items     = evaluateXPath('bdd', jmaDailyXML, strExp);
      day.date  = items[0].nodeValue.substr(5,5).replace(/-/,"/");

      //  天気設定
      strExp    = '//bdd:MeteorologicalInfos[@type="区域予報"][1]'
                + '/bdd:TimeSeriesInfo[1]'
                + '//bdd:TimeDefine[@timeId="'+ (i+1) +'"]'
                + '/../../bdd:Item['
                + itemIndex
                + ']//jmx_eb:Weather[@refID="'+(i+1)+'"]'
                + '/text()';
      items     = evaluateXPath('bdd', jmaDailyXML, strExp);
      day.weather = items[0].nodeValue;

      //  天気コード設定
      strExp    = '//bdd:MeteorologicalInfos[@type="区域予報"][1]'
                + '/bdd:TimeSeriesInfo[1]'
                + '//bdd:TimeDefine[@timeId="'+ (i+1) +'"]'
                + '/../../bdd:Item['
                + itemIndex
                + ']//jmx_eb:WeatherCode[@refID="'+(i+1)+'"]'
                + '/text()';
      items     = evaluateXPath('bdd', jmaDailyXML, strExp);
      day.wcode = items[0].nodeValue;

      forecast.days.push({...day});
    }
    return ;
    // }}}
  }

  function set2DayWeather(){
    // {{{
    setStep2DayWeater();
    setStep2DayProbs();
    setStep2DayTemps();
    // }}}
  }

  function getUrlJmaRegularL(){
    // {{{
    fetch(urlJmaRegularL)
      .then(response => response.text())
      .then((data) => {
        let domparser = new DOMParser();
        jmaRegularXML = domparser.parseFromString(data, "application/xml");
        urlJmaWeekly = getUrlWeekly();
        if(urlJmaWeekly.length){
          getWeeklyXML();
        }else{
          console.log('府県週間予報 XML の URL が見つからない');
        }
      });
    // }}}
  }

  function getDailyXML(){
    // {{{
    fetch(urlJmaDaily)
      .then(response => response.text())
      .then((data) => {
        let domparser = new DOMParser();
        jmaDailyXML   = domparser.parseFromString(data, "application/xml");
        set2DayWeather();
        urlJmaWeekly = getUrlWeekly();  // store URL of weekly weather forecast
        if(urlJmaWeekly.length){
          getWeeklyXML();
        }else{
          getUrlJmaRegularL();
        }
      });
    // }}}
  }

  function getUrlDaily(){
    // {{{
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
      elms    = evaluateXPath('regular', jmaRegularXML, strExp);
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
    let strExp  = '//overall:Text[@type="本文"]/text()';
    let elms    = evaluateXPath('overall', jmaOverallXML, strExp);
    if(elms.length){
      forecast.overall = elms[0].nodeValue;
    }
    // }}}
  }

  function setTargetDate(){
    // {{{
    let strExp    = '//overallhead:TargetDateTime/text()';
    let elms      = evaluateXPath('overallhead', jmaOverallXML, strExp);
    forecast.date = elms[0].nodeValue.replace(/-/g,"").substr(0,8);
    // }}}
  }

  function getOverallXML(){
    // {{{
    fetch(urlJmaOverall)
      .then(response => response.text())
      .then((data) => {
        let domparser = new DOMParser();
        jmaOverallXML = domparser.parseFromString(data, "application/xml");
        setTargetDate();
        setOverall();
        urlJmaDaily = getUrlDaily();  // store URL of daily weather forecast
        getDailyXML();
      });
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
      let elms = evaluateXPath('regular', jmaRegularXML, strExp);
      if(elms.length) {
        ret = elms[0].getAttribute('href');
        break;
      }
    }
    return ret;
    // }}}
  }

  function getUrlJmaRegular(){
    // {{{
    fetch(urlJmaRegular)
      .then(response => response.text())
      .then((data) => {
        let domparser = new DOMParser();
        jmaRegularXML = domparser.parseFromString(data, "application/xml");
        urlJmaOverall = getUrlOverall();  // store URL of Jma Overall
        if(urlJmaOverall.length>0) {
          getOverallXML();
        } else {
          console.log('府県天気概況未発表');
        }
      });
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
        forecast.region     = request.region;
        forecast.days       = new Array();
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
      height: 360,
      width:  624
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
