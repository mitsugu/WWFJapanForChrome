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

  it ("正しい url で getUrlJmaRegular() を呼び出した場合", async () => {
    console.log("正しい url で getUrlJmaRegular() を呼び出した場合");
    await getUrlJmaRegular( 'http://www.data.jma.go.jp/developer/xml/feed/regular.xml' )
      .then(data => {
        let s = new XMLSerializer();
        console.log("\u001b[32m"+s.serializeToString(data)+"\u001b[0m");
        console.log("\u001b[32mRegular.xml 受信\u001b[0m");
        assert(true);
      })
      .catch(err => {
        assert(err, "\u001b[31mNot Found Regular.xml : "+err+'\u001b[0m');
      });
  });

  it ("不正な url で getUrlJmaRegular() を呼び出した場合 ( 404 Not Found のシミュレート )", async () => {
    console.log("不正な url で getUrlJmaRegular() を呼び出した場合");
    await getUrlJmaRegular( 'http://www.data.jma.go.jp/developer/xml/feed/hogeiregular.xml' )
      .then(data => {
        assert(false,"\u001b[31mRegular.xml が見つかった ( テスト失敗 )"+data+'\u001b[0m');
      })
      .catch(err => {
        console.log("\u001b[32m不正な URL で Regular.xml が見つからなかった ( エラーハンドリング OK )\u001b[0m");
        assert(true);
      });
  });

  afterEach(() => {
    stub.restore();
  });
});

