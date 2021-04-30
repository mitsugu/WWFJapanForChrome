(function(){
  var region;
  const hWarnOrg='http://www.jma.go.jp/jp/warn/'; // 警報・注意報 URL ベース
  // 一次細分区域警報・注意報ファイル名ハッシュテーブル
  const hTable={
    '宗谷地方（稚内）'  :{'warn':'301.html','image':'301'},
    '上川地方（旭川）'  :{'warn':'302.html','image':'302'},
    '留萌地方（留萌）'  :{'warn':'302.html','image':'302'},
    '石狩地方（札幌）'  :{'warn':'306.html','image':'306'},
    '空知地方（岩見沢）':{'warn':'306.html','image':'306'},
    '後志地方（倶知安）':{'warn':'306.html','image':'306'},
    '網走地方（網走）'  :{'warn':'303.html','image':'303'},
    '北見地方（北見）'  :{'warn':'303.html','image':'303'},
    '紋別地方（紋別）'  :{'warn':'303.html','image':'303'},
    '根室地方（根室）'  :{'warn':'304.html','image':'304'},
    '釧路地方（釧路）'  :{'warn':'304.html','image':'304'},
    '十勝地方（帯広）'  :{'warn':'304.html','image':'304'},
    '胆振地方（室蘭）'  :{'warn':'305.html','image':'305'},
    '日高地方（浦河）'  :{'warn':'305.html','image':'305'},
    '渡島地方（函館）'  :{'warn':'307.html','image':'307'},
    '檜山地方（江差）'  :{'warn':'307.html','image':'307'},
    '津軽（青森）'      :{'warn':'308.html','image':'308'},
    '下北（むつ）'      :{'warn':'308.html','image':'308'},
    '三八上北（八戸）'  :{'warn':'308.html','image':'308'},
    '沿岸（秋田）'      :{'warn':'309.html','image':'309'},
    '内陸（横手）'      :{'warn':'309.html','image':'309'},
    '内陸（盛岡）'      :{'warn':'310.html','image':'310'},
    '沿岸北部（宮古）'  :{'warn':'310.html','image':'310'},
    '沿岸南部（大船渡）':{'warn':'310.html','image':'310'},
    '村山（山形）'      :{'warn':'311.html','image':'311'},
    '置賜（米沢）'      :{'warn':'311.html','image':'311'},
    '庄内（酒田）'      :{'warn':'311.html','image':'311'},
    '最上（新庄）'      :{'warn':'311.html','image':'311'},
    '東部（仙台）'      :{'warn':'312.html','image':'312'},
    '西部（白石）'      :{'warn':'312.html','image':'312'},
    '中通り（福島）'    :{'warn':'313.html','image':'313'},
    '浜通り（相馬）'    :{'warn':'313.html','image':'313'},
    '会津（若松）'      :{'warn':'313.html','image':'313'},
    '北部（水戸）'      :{'warn':'314.html','image':'314'},
    '南部（土浦）'      :{'warn':'314.html','image':'314'},
    '南部（前橋）'      :{'warn':'315.html','image':'315'},
    '北部（水上）'      :{'warn':'315.html','image':'315'},
    '南部（宇都宮）'    :{'warn':'316.html','image':'316'},
    '北部（大田原）'    :{'warn':'316.html','image':'316'},
    '南部（さいたま）'  :{'warn':'317.html','image':'317'},
    '北部（熊谷）'      :{'warn':'317.html','image':'317'},
    '秩父地方（秩父）'  :{'warn':'317.html','image':'317'},
    '東京地方（東京）'      :{'warn':'319.html','image':'319'},
    '伊豆諸島北部（大島）'  :{'warn':'319.html','image':'319'},
    '伊豆諸島南部（八丈島）':{'warn':'319.html','image':'319'},
    '小笠原諸島（父島）'    :{'warn':'319.html','image':'319'},
    '東部（横浜）'      :{'warn':'320.html','image':'320'},
    '西部（小田原）'    :{'warn':'320.html','image':'320'},
    '北西部（千葉）'    :{'warn':'318.html','image':'318'},
    '北東部（銚子）'    :{'warn':'318.html','image':'318'},
    '南部（館山）'      :{'warn':'318.html','image':'318'},
    '中部（静岡）'      :{'warn':'327.html','image':'327'},
    '伊豆（石廊崎）'    :{'warn':'327.html','image':'327'},
    '東部（三島）'      :{'warn':'327.html','image':'327'},
    '西部（浜松）'      :{'warn':'327.html','image':'327'},
    '中・西部（甲府）'        :{'warn':'321.html','image':'321'},
    '東部・富士五湖（河口湖）':{'warn':'321.html','image':'321'},
    '下越（新潟）'      :{'warn':'323.html','image':'323'},
    '中越（長岡）'      :{'warn':'323.html','image':'323'},
    '上越（高田）'      :{'warn':'323.html','image':'323'},
    '佐渡（相川）'      :{'warn':'323.html','image':'323'},
    '北部（長野）'      :{'warn':'322.html','image':'322'},
    '中部（松本）'      :{'warn':'322.html','image':'322'},
    '南部（飯田）'      :{'warn':'322.html','image':'322'},
    '東部（富山）'      :{'warn':'324.html','image':'324'},
    '西部（伏木）'      :{'warn':'324.html','image':'324'},
    '加賀（金沢）'      :{'warn':'325.html','image':'325'},
    '能登（輪島）'      :{'warn':'325.html','image':'325'},
    '嶺北（福井）'      :{'warn':'326.html','image':'326'},
    '嶺南（敦賀）'      :{'warn':'326.html','image':'326'},
    '美濃地方（岐阜）'  :{'warn':'328.html','image':'328'},
    '飛騨地方（高山）'  :{'warn':'328.html','image':'328'},
    '西部（名古屋）'    :{'warn':'329.html','image':'329'},
    '東部（豊橋）'      :{'warn':'329.html','image':'329'},
    '北中部（津）'      :{'warn':'330.html','image':'330'},
    '南部（尾鷲）'      :{'warn':'330.html','image':'330'},
    '南部（大津）'      :{'warn':'334.html','image':'334'},
    '北部（彦根）'      :{'warn':'334.html','image':'334'},
    '北部（舞鶴）'      :{'warn':'333.html','image':'333'},
    '南部（京都）'      :{'warn':'333.html','image':'333'},
    '大阪府（大阪）'    :{'warn':'331.html','image':'331'},
    '北部（奈良）'      :{'warn':'335.html','image':'335'},
    '南部（風屋）'      :{'warn':'335.html','image':'335'},
    '北部（和歌山）'    :{'warn':'336.html','image':'336'},
    '南部（潮岬）'      :{'warn':'336.html','image':'336'},
    '南部（神戸）'      :{'warn':'332.html','image':'332'},
    '北部（豊岡）'      :{'warn':'332.html','image':'332'},
    '南部（岡山）'      :{'warn':'340.html','image':'340'},
    '北部（津山）'      :{'warn':'340.html','image':'340'},
    '東部（鳥取）'      :{'warn':'339.html','image':'339'},
    '中・西部（米子）'  :{'warn':'339.html','image':'339'},
    '南部（広島）'      :{'warn':'338.html','image':'338'},
    '北部（庄原）'      :{'warn':'338.html','image':'338'},
    '東部（松江）'      :{'warn':'337.html','image':'337'},
    '西部（浜田）'      :{'warn':'337.html','image':'337'},
    '隠岐（西郷）'      :{'warn':'337.html','image':'337'},
    '西部（下関）'      :{'warn':'345.html','image':'345'},
    '中部（山口）'      :{'warn':'345.html','image':'345'},
    '東部（柳井）'      :{'warn':'345.html','image':'345'},
    '北部（萩）'        :{'warn':'345.html','image':'345'},
    '香川県（高松）'    :{'warn':'341.html','image':'341'},
    '北部（徳島）'      :{'warn':'343.html','image':'343'},
    '南部（日和佐）'    :{'warn':'343.html','image':'343'},
    '中予（松山）'      :{'warn':'342.html','image':'342'},
    '東予（新居浜）'    :{'warn':'342.html','image':'342'},
    '南予（宇和島）'    :{'warn':'342.html','image':'342'},
    '中部（高知）'      :{'warn':'344.html','image':'344'},
    '東部（室戸岬）'    :{'warn':'344.html','image':'344'},
    '西部（清水）'      :{'warn':'344.html','image':'344'},
    '福岡地方（福岡）'  :{'warn':'346.html','image':'346'},
    '北九州地方（八幡）':{'warn':'346.html','image':'346'},
    '筑豊地方（飯塚）'  :{'warn':'346.html','image':'346'},
    '筑後地方（久留米）':{'warn':'346.html','image':'346'},
    '南部（佐賀）'      :{'warn':'347.html','image':'347'},
    '北部（伊万里）'    :{'warn':'347.html','image':'347'},
    '南部（長崎）'      :{'warn':'348.html','image':'348'},
    '北部（佐世保）'    :{'warn':'348.html','image':'348'},
    '壱岐・対馬（厳原）':{'warn':'348.html','image':'348'},
    '五島（福江）'      :{'warn':'348.html','image':'348'},
    '中部（大分）'      :{'warn':'350.html','image':'350'},
    '北部（中津）'      :{'warn':'350.html','image':'350'},
    '西部（日田）'      :{'warn':'350.html','image':'350'},
    '南部（佐伯）'      :{'warn':'350.html','image':'350'},
    '熊本地方（熊本）'      :{'warn':'349.html','image':'349'},
    '阿蘇地方（阿蘇乙姫）'  :{'warn':'349.html','image':'349'},
    '天草・芦北地方（牛深）':{'warn':'349.html','image':'349'},
    '球磨地方（人吉）'      :{'warn':'349.html','image':'349'},
    '南部平野部（宮崎）'  :{'warn':'351.html','image':'351'},
    '北部平野部（延岡）'  :{'warn':'351.html','image':'351'},
    '南部山沿い（都城）'  :{'warn':'351.html','image':'351'},
    '北部山沿い（高千穂）':{'warn':'351.html','image':'351'},
    '薩摩地方（鹿児島）'          :{'warn':'352.html','image':'352'},
    '大隅地方（鹿屋）'            :{'warn':'352.html','image':'352'},
    '種子島・屋久島地方（西之表）':{'warn':'352.html','image':'352'},
    '奄美地方（名瀬）'            :{'warn':'352.html','image':'352'},
    '本島中南部（那覇）'      :{'warn':'353.html','image':'353'},
    '本島北部（名護）'        :{'warn':'353.html','image':'353'},
    '久米島（久米島）'        :{'warn':'353.html','image':'353'},
    '大東島地方（南大東島）'  :{'warn':'354.html','image':'354'},
    '宮古島地方（宮古島）'    :{'warn':'355.html','image':'355'},
    '石垣島地方（石垣島）'    :{'warn':'356.html','image':'356'},
    '与那国島地方（与那国島）':{'warn':'356.html','image':'356'}
  };

  function receiveWindowId(response){
    console.log(response);
    var url=hWarnOrg+hTable[region].warn;
    console.log(url);
    chrome.tabs.create({url:url,windowId:response},function (tabs){
      console.log(tabs);
    });
  }

  function openTab(){
    chrome.runtime.sendMessage({request:"send window id"},receiveWindowId);
  }

  function receiveRegion(response){
    console.log(response);
    region=response;
    document.getElementById('img').setAttribute(
      'src',
      'http://www.jma.go.jp/jp/warn/imgs/'+hTable[response].image+'/99.png'
    );
  }

  function getRegion(){
    chrome.runtime.sendMessage({request:"send region"},receiveRegion);
  }

  function closeWin(){
    window.close();
  }

  function init(){
    document.getElementById('open_browser_button')
        .addEventListener('click',openTab);
    document.getElementById("close_button").addEventListener("click",closeWin);
    getRegion();
  }
  window.addEventListener('DOMContentLoaded',init);
})();
