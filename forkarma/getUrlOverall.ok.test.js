describe("関数 getOverallXML のテスト\n", function() {
  let stub;
  let strOverallXML;

  let readOverallXML = () => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if( xhr.readyState === 4 && xhr.status === 200) {
        strOverallXML = xhr.responseText;
      }
    };
    xhr.open(
      'get',
      '/home/mitsugu/Develop/repo/wwfjapan/xmldata/20210805193955_0_VPFG50_280000.xml',
      false
    );
    xhr.send();
  };

  let mockText = body => {
    let mockResponse = new window.Response(body);
    return Promise.resolve(mockResponse);
  };

  let xmlOk = (body) => {
    let mockResponse = new window.Response(body, {
      text : (body) => Promise.resolve(mocText),
      status: 200,
      headers: {
        'Content-type': 'application/xml'
      }
    });
    return Promise.resolve(mockResponse);
  };

  beforeEach(() => {
    readOverallXML();
    stub = sinon.stub(window, 'fetch');
    stub.returns(xmlOk(strOverallXML));
  });

  it ("正しい URL で getOverallXML() を呼び出した場合", async () => {
    console.log("正しい URL で getOverallXML() を呼び出した場合");
    await getOverallXML("http://www.data.jma.go.jp/developer/xml/data/20210806013424_0_VPFG50_280000.xml")
      .then(data => {
        let s = new XMLSerializer();
        console.log("\u001b[32m"+s.serializeToString(data)+"\u001b[0m");
        console.log("\u001b[32m府県気象概況 xml データ受信\u001b[0m");
        assert(true);
      })
      .catch(err => {
        console.log("\u001b[32m府県気象概況 xml データが受信できなかった : "+err+"\u001b[0m");
        assert(false);
      });
  });

  afterEach(() => {
    stub.restore();
  });
});

