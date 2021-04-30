(function(){
  var hRegion={
    "北海道":["宗谷地方（稚内）","上川地方（旭川）","留萌地方（留萌）","石狩地方（札幌）","空知地方（岩見沢）","後志地方（倶知安）","網走地方（網走）","北見地方（北見）","紋別地方（紋別）","根室地方（根室）","釧路地方（釧路）","十勝地方（帯広）","胆振地方（室蘭）","日高地方（浦河）","渡島地方（函館）","檜山地方（江差）"],
    "青森県":["津軽（青森）","下北（むつ）","三八上北（八戸）"],
    "秋田県":["沿岸（秋田）","内陸（横手）"],
    "岩手県":["内陸（盛岡）","沿岸北部（宮古）","沿岸南部（大船渡）"],
    "山形県":["村山（山形）","置賜（米沢）","庄内（酒田）","最上（新庄）"],
    "宮城県":["東部（仙台）","西部（白石）"],
    "福島県":["中通り（福島）","浜通り（相馬）","会津（若松）"],
    "茨城県":["北部（水戸）","南部（土浦）"],
    "栃木県":["南部（宇都宮）","北部（大田原）"],
    "群馬県":["南部（前橋）","北部（水上）"],
    "埼玉県":["南部（さいたま）","北部（熊谷）","秩父地方（秩父）"],
    "東京都":["東京地方（東京）","伊豆諸島北部（大島）","伊豆諸島南部（八丈島）","小笠原諸島（父島）"],
    "神奈川県":["東部（横浜）","西部（小田原）"],
    "千葉県":["北西部（千葉）","北東部（銚子）","南部（館山）"],
    "静岡県":["中部（静岡）","伊豆（石廊崎）","東部（三島）","西部（浜松）"],
    "山梨県":["中・西部（甲府）","東部・富士五湖（河口湖）"],
    "新潟県":["下越（新潟）","中越（長岡）","上越（高田）","佐渡（相川）"],
    "長野県":["北部（長野）","中部（松本）","南部（飯田）"],
    "富山県":["東部（富山）","西部（伏木）"],
    "石川県":["加賀（金沢）","能登（輪島）"],
    "福井県":["嶺北（福井）","嶺南（敦賀）"],
    "岐阜県":["美濃地方（岐阜）","飛騨地方（高山）"],
    "愛知県":["西部（名古屋）","東部（豊橋）"],
    "三重県":["北中部（津）","南部（尾鷲）"],
    "滋賀県":["南部（大津）","北部（彦根）"],
    "京都府":["南部（京都）","北部（舞鶴）"],
    "大阪府":["大阪府（大阪）"],
    "奈良県":["北部（奈良）","南部（風屋）"],
    "和歌山県":["北部（和歌山）","南部（潮岬）"],
    "兵庫県":["南部（神戸）","北部（豊岡）"],
    "岡山県":["南部（岡山）","北部（津山）"],
    "鳥取県":["東部（鳥取）","中・西部（米子）"],
    "広島県":["南部（広島）","北部（庄原）"],
    "島根県":["東部（松江）","西部（浜田）","隠岐（西郷）"],
    "山口県":["西部（下関）","中部（山口）","東部（柳井）","北部（萩）"],
    "香川県":["香川県（高松）"],
    "徳島県":["北部（徳島）","南部（日和佐）"],
    "愛媛県":["中予（松山）","東予（新居浜）","南予（宇和島）"],
    "高知県":["中部（高知）","東部（室戸岬）","西部（清水）"],
    "福岡県":["福岡地方（福岡）","北九州地方（八幡）","筑豊地方（飯塚）","筑後地方（久留米）"],
    "佐賀県":["南部（佐賀）","北部（伊万里）"],
    "長崎県":["南部（長崎）","北部（佐世保）","壱岐・対馬（厳原）","五島（福江）"],
    "大分県":["中部（大分）","北部（中津）","西部（日田）","南部（佐伯）"],
    "熊本県":["熊本地方（熊本）","阿蘇地方（阿蘇乙姫）","天草・芦北地方（牛深）","球磨地方（人吉）"],
    "宮崎県":["南部平野部（宮崎）","北部平野部（延岡）","南部山沿い（都城）","北部山沿い（高千穂）"],
    "鹿児島県":["薩摩地方（鹿児島）","大隅地方（鹿屋）","種子島・屋久島地方（西之表）","奄美地方（名瀬）"],
    "沖縄県":["本島中南部（那覇）","本島北部（名護）","久米島（久米島）","大東島地方（南大東島）","宮古島地方（宮古島）","石垣島地方（石垣島）","与那国島地方（与那国島）"]
  }

  function dispRegionList(prefecture){
    var elm=document.getElementById('reg_list');
    var cnt=hRegion[prefecture].length;
    var optionElm=document.createElement('option');
    var textNode;

    for (i=0;i<cnt;i++){
      optionElm=document.createElement('option');
      textNode=document.createTextNode(hRegion[prefecture][i]);
      optionElm.appendChild(textNode);
      elm.appendChild(optionElm);
    }
  }

  function clearRegion(){
    var cnt=document.getElementById('reg_list').childNodes.length;
    for(i=0;i<cnt;i++){
      var elm=document.getElementById('reg_list');
      elm.remove(0);
    }
  }

  function redrawRegion(){
    var elm=document.getElementById('pref_list');
    clearRegion();
    dispRegionList(elm.value);
  }

  function onOK(){
    var elmPref=document.getElementById('pref_list');
    var elmReg=document.getElementById('reg_list');
    browser.storage.local.set(
      {"location":{"prefecture":elmPref.value,"region":elmReg.value}},
      (error)=>{
        console.log(`Error: ${error}`);
      });
    window.close();
  }

  function onCancel(){
    window.close();
  }

  function init(){
    document.getElementById('pref_list')
      .addEventListener("change", redrawRegion);
    document.getElementById('ok_button')
      .addEventListener("click",onOK);
    document.getElementById('cancel_button')
      .addEventListener("click",onCancel);
    var elm=document.getElementById('pref_list');
    dispRegionList(elm.value);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
