(function(){
  function getOverallText(){
    chrome.runtime.sendMessage({request:"send overall"},function (response) {
      console.log(response);
      // 天気概況の編集
      response=response.replace('天気概況','天気概況\n');
      response=response.replace(RegExp('<br />\n<br />','ig'),'\n');
      response=response.replace(RegExp('<br />\n','ig'),'');
      document.getElementById("overall").value=response;
    });
  }

  function closeWin(){
    window.close();
  }

  function init(){
    document.getElementById("ok_button").addEventListener("click",closeWin);
    getOverallText();
  }
  window.addEventListener('DOMContentLoaded',init);
})();