describe("関数 getUrlOverall のテスト\n", function() {
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

  it ("正しい都道府県コードで getUrlOverall() を呼び出した場合", async () => {
    console.log("正しい都道府県コードで getUrlOverall() を呼び出した場合");
    await getUrlJmaRegular( 'http://www.data.jma.go.jp/developer/xml/feed/regular.xml' )
      .then(async data => {
        await getUrlOverall(data, "280000")
          .then(data => {
            console.log("\u001b[32mURL = "+data+"\u001b[0m");
            assert(true);
          })
          .catch(err => {
            console.log("\u001b[31mURL が取得できなかった : "+err+'\u001b[0m');
            assert(false);
          });
      })
      .catch(err => {
        assert(err, "\u001b[31mNot Found Regular.xml : "+err+'\u001b[0m');
      });
  });

  it ("不正な都道府県コードで getUrlOverall() を呼び出した場合", async () => {
    console.log("不正な都道府県コードで getUrlOverall() を呼び出した場合");
    await getUrlJmaRegular( 'http://www.data.jma.go.jp/developer/xml/feed/regular.xml' )
      .then(async data => {
        await getUrlOverall(data, "980000")
          .then(data => {
            assert(false,"\u001b[31mFound URL!! : "+data+"\n見つかったらあかん！！\u001b[0m" );
          })
          .catch(err => {
            console.log("\u001b[32mNot Found URL ( エラーハンドリング OK ) : "+err+"\u001b[0m");
            assert(true);
          });
      })
      .catch(err => {
        assert(false, "\u001b[31mNot Found Regular.xml : "+err+'\u001b[0m');
      });
  });

  afterEach(() => {
    stub.restore();
  });
});

