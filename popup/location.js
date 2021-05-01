(function(){
  function onOK(){
    var elmPref=document.getElementById('pref_list');
    browser.storage.local.set(
      {"location":{"prefecture":elmPref.value}},
      (error)=>{
        console.log(`Error: ${error}`);
      }
    );
    window.close();
  }
  function onCancel(){
    window.close();
  }
  function init(){
    document.getElementById('ok_button').addEventListener("click",onOK);
    document.getElementById('cancel_button').addEventListener("click",onCancel);
  }
  document.addEventListener("DOMContentLoaded", init);
})();
