(function(){
  function closeWin(){
    window.close();
  }

  function init(){
    document.getElementById("ok_button").addEventListener("click",closeWin);
  // setImageUrl();
  }
  window.addEventListener('DOMContentLoaded',init);
})();
