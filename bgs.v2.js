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
  let resolver = function(prefix) {
    let ns = {
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
  let result = aNode.evaluate(
    aExpr,
    aNode,
    resolver,
    XPathResult.ANY_TYPE,
    null
  );

  let found = [];
  let res;
  while (res = result.iterateNext()){
    found.push(res);
  }
  return found;
  // }}}
}

let getUrlOverall = (doc, pref) => {
  // {{{
  return ( new Promise((resolve, reject) => {
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
              + pref
              + '")]';
      let elms = evaluateXPath('regular', doc, strExp);
      if(elms.length) {
        ret = elms[0].getAttribute('href');
        break;
      }
    }
    ret.length > 0 ? resolve(ret) : reject('not found overall XML data');
  // }}}
  }));
}

let getUrlJmaRegular = (url, pref) => {
  // {{{
  return ( new Promise( (resolve, reject) => {
    fetch(url)
      .then(response => response.text())
      .then(data => {
        if(data.length) {
          resolve(
            getUrlOverall( new DOMParser().parseFromString(data, "application/xml"), pref)
          );
        } else {
          reject('regular.xml url length : ' + data.length);
        }
      })
  }));
  // }}}
};

