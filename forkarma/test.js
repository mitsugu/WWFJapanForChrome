describe("関数 getUrlJmaRegular のテスト\n", function() {
  let stub;
  let strRegular;

  let readRegular = () => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if( xhr.readyState === 4 && xhr.status === 200) {
        strRegular = xhr.responseText;
      }
    };
    xhr.open(
      'get',
      '/home/mitsugu/Develop/repo/wwfjapan/xmldata/regular.xml',
      false
    );
    xhr.send();
  };

  let mockText = body => {
    let mockResponse = new window.Response(body);
    return Promise.resolve(mockResponse);
  };

  let xmlOk = body => {
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
    readRegular();
    stub = sinon.stub(window, 'fetch');
    stub.returns(xmlOk(strRegular));
  });

  it ("正常なデータで getUrlJmaRegular() を呼び出した場合", async () => {
    await getUrlJmaRegular( 'http://www.data.jma.go.jp/developer/xml/feed/regular.xml', '280000' )
      .then(data => {
        console.log("\u001b[32m正常データ getUrlJmaRegular() URL : "+data+"\u001b[0m");
        assert(true);
      })
      .catch(err => {
        assert.equal(err,"http://www.data.jma.go.jp/developer/xml/data/20210619013416_0_VPFG50_280000.xml","\u001b[31m正常データ getUrlJmaRegular() エラー : "+err+'\u001b[0m');
      });
  });

  it ("不正な都道府県コードで getUrlJmaRegular() を呼び出した場合", async () => {
    await getUrlJmaRegular( 'http://www.data.jma.go.jp/developer/xml/feed/regular.xml', '780000' )
      .then(data => {
        assert.notEqual(data,"http://www.data.jma.go.jp/developer/xml/data/20210619013416_0_VPFG50_280000.xml","\u001b[31m不正都道府県コード getUrlJmaRegular() URL "+data+'\u001b[0m');
      })
      .catch(err => {
        console.log("\u001b[32m不正都道府県コード getUrlJmaRegular() エラー検出成功！！ : "+err+"\u001b[0m");
        assert(true);
      });
  });

  afterEach(() => {
    stub.restore();
  });
});

