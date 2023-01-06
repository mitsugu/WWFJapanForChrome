(function(){
  function closeWin(){
    window.close();
  }

  function init_url() {
    const json_url = "https://www.jma.go.jp/bosai/weather_map/data/list.json";
    fetch(json_url)
      .then(response => response.text())
      .then((data) => {
        let json_list = JSON.parse(data);
        let url       = "https://www.jma.go.jp/bosai/weather_map/data/png/"
                        + json_list.near.now[json_list.near.now.length-1];
        document.getElementById("img").setAttribute("src", url);
      });
  }

  function init(){
    document.getElementById("ok_button").addEventListener("click",closeWin);
    init_url();
  }
  window.addEventListener('DOMContentLoaded',init);
})();
