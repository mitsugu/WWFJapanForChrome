(function(){
  function closeWin(){
    window.close();
  }

  function setImageUrl(){
    var base          = "https://www.jma.go.jp/jp/g3/images/jp_c/";
    var now           = new Date();
    var year          = now.getFullYear();
    var month         = now.getMonth()+1;
    var day           = now.getDate();
    var hours         = now.getHours()-1;
    var strYear       = year.toString().substr(2,2);
    var strMonth      = (month>9) ? month.toString(): ("0"+month.toString());
    var strDay;
    var strHours;
    if (hours<3) {
      strDay    = String(day-1);
      strHours  = "21";
    } else {
      strDay    = String(day);
      if (hours<6) {
        strHours  = "03";
      } else if (hours<9) {
        strHours  = "06";
      } else if (hours<12) {
        strHours  = "09";
      } else if (hours<15) {
        strHours  = "12";
      } else if (hours<18) {
        strHours  = "15";
      } else if (hours<21) {
        strHours  = "18";
      } else {
        strHours  = "21";
      }
  }

    var url       = base+strYear+strMonth+strDay+strHours+".png";
    document.getElementById("img").setAttribute("src", url);
  }

  function init(){
    document.getElementById("ok_button").addEventListener("click",closeWin);
    setImageUrl();
  }
  window.addEventListener('DOMContentLoaded',init);
})();
