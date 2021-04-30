(function(){
  function closeWin(){
    window.close();
  }

  function setImageUrl(){
    var base          = "https://www.jma.go.jp/jp/gms/imgs_c/0/infrared/1/";
    var now           = new Date();
    var year          = now.getFullYear();
    var month         = now.getMonth()+1;
    var day           = now.getDate();
    var hours         = now.getHours();
    var minutes       = now.getMinutes();
    var tergetMinutes = Math.floor(minutes/10)*10-10;
    var strYear       = year.toString();
    var strMonth      = (month>9) ? month.toString(): ("0"+month.toString());
    var strDay        = (day>9) ? day.toString(): ("0"+day.toString());
    var strHours      = (hours>9) ? hours.toString() : ("0"+hours.toString());
    var strMinutes    = (tergetMinutes>9) ? tergetMinutes.toString()
                                          : ("0"+tergetMinutes.toString());
    var url           = base+strYear+strMonth+strDay+strHours+strMinutes+"-00.png";
    document.getElementById("photo").setAttribute("src", url);
  }

  function init(){
    document.getElementById("ok_button").addEventListener("click",closeWin);
    setImageUrl();
  }
  window.addEventListener('DOMContentLoaded',init);
})();
