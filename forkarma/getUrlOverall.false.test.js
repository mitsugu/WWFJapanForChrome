describe("関数 getOverallXML のエラーハンドリング\n", function() {
  let stub;

  /*
  let mockText = body => {
    let mockResponse = new window.Response(body);
    return Promise.resolve(mockResponse);
  };
  */

  let xmlOk = (body) => {
    let mockResponse = new window.Response(body, {
      status: 404,
      headers: {
        'Content-type': 'application/xml'
      }
    });
    return Promise.resolve(mockResponse);
  };

  beforeEach(() => {
    stub = sinon.stub(window, 'fetch');
    stub.returns(xmlOk());
  });

  it ("間違った URL で getOverallXML() を呼び出した場合 ( 404 Not Found のシミュレート )", async () => {
    console.log("間違った URL で getOverallXML() を呼び出した場合 ( 404 Not Found のシミュレート )");
    await getOverallXML("http://www.data.jma.go.jp/developer/xml/data/20210806013424_0_VPFG50_980000.xml")
      .then(async data => {
        let s = new XMLSerializer();
        console.log("\u001b[31m"+s.serializeToString(data)+"\u001b[0m");
        console.log("\u001b[31m受信できないはずの府県気象概況 xml データ受信\u001b[0m");
        assert(false);
      })
      .catch(err => {
        console.log("\u001b[32m府県気象概況 xml データ受信エラー\u001b[0m");
        assert(true, "\u001b[32mNot Found yyyymmddhhmmss_0_VPFG50_999999.xml : "+err+'\u001b[0m');
      });
  });

  afterEach(() => {
    stub.restore();
  });
});

