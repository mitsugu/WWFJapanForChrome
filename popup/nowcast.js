(function(){
  function closeWin(){
    window.close();
  }

  function init_url() {
    const tergetTimeUrl = "https://www.jma.go.jp/bosai/jmatile/data/nowc/targetTimes_N1.json";
    fetch(tergetTimeUrl)
      .then(response => response.text())
      .then((data) => {
        let json_list = JSON.parse(data);
        let basetime  = json_list[0].basetime;
        let validtime = json_list[0].validtime;
        let url;
        const baseUrl = "https://www.jma.go.jp/bosai/jmatile/data/nowc/";
        for (let i=11;i<14;i++) {
          for ( let j=26;j<30;j++) {
            url = baseUrl + basetime + "/none/"
                  +validtime  + "/surf/hrpns/5/" + j + "/" + i + ".png";
            document.getElementById("img"+j+i).setAttribute("src", url);
          }
        }
      });
  }

  function init(){
    document.getElementById("ok_button").addEventListener("click",closeWin);
    init_url();
  }
  window.addEventListener('DOMContentLoaded',init);
})();
