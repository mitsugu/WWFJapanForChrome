(function(){
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
  browser.runtime.onMessage.addListener(
    // {{{
    function(request,sender,sendResponse){
      storeSendResponse = sendResponse;
      if (request.command == "jma" ) {
        openJma();
      } else if (request.command == "htb" ) {
        openHtb();
      }
      return true;
    }
    // }}}
  );

  browser.browserAction.onClicked.addListener(()=>{
    // {{{
    const mainURL = browser.runtime.getURL("popup/main.html");
    browser.windows.create({
      url:    mainURL,
      type:   "popup",
      width:  624,
      height: 368
    });
    // }}}
  })

  browser.windows.getCurrent({populate: true},function(win){
    windowId=win.id;
  });
  //}}}
})();
