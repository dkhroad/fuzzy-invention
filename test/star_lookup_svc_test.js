const { expect } = require('code');
const Lab = require('lab');
const { after,before,describe,it } = exports.lab = Lab.script();
const Hapi = require('hapi');
const del = require('del');
const config = require('../env.json')[process.env.NODE_ENV || 'test']
const server = require('../index.js');

const manifest = {
  server: {
      port: 8000,
      host: 'localhost'
  },
  register : {
    plugins: [
      {
        plugin: require('../star_lookup_svc'),
      }
    ]
  }
}

describe('GET /stars/address:{address}',async () => {
  let my_server;
  before(async () => {
    del.sync(config.db);
    my_server = await server(manifest);
    my_server.table().forEach((route) => console.log(`${route.method}\t${route.path}`));
    let payloads = [
      {
        "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
        "star": {
          "dec": "-26° 29' 24.9",
          "ra": "16h 29m 1.0s",
          "story": new Buffer.from("Found star using https://www.google.com/sky/").toString('hex'),
          "storyDecoded": "Found star using https://www.google.com/sky/"
        }
      },
      {
        "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
        "star": {
          "dec": "-25° 28' 23.9",
          "ra": "15h 28m 1.0s",
          "story": new Buffer.from("Found another star using https://www.google.com/sky/").toString('hex'),
          "storyDecoded": "Found another star using https://www.google.com/sky/"
        }
      }
    ]
    await my_server.app.blockchain.addBlockFromData(payloads[0]);
    await my_server.app.blockchain.addBlockFromData(payloads[1]);
  });

  it('gets all blocks by address',async () => {
    let resp = await my_server.inject({
      method: 'GET',
      url: '/stars/address:142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ'
    })
    expect(resp.statusCode).to.equal(200);
    expect(resp.result.length).equal(2);
    expect(resp.result[0]).include(['hash','body','time','previousBlockHash']);
    expect(resp.result[1]).include(['hash','body','time','previousBlockHash']);
    expect(resp.result[0].height).equal(1);
    expect(resp.result[1].height).equal(2);
  });
});

describe('GET /block/{height}', async () => {
  let my_server;
  before(async () => {
    del.sync(config.db);
    my_server = await server(manifest);
    my_server.table().forEach((route) => console.log(`${route.method}\t${route.path}`));
    let payload =  {
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
      "star": {
        "dec": "-26° 29' 24.9",
        "ra": "16h 29m 1.0s",
        "story": new Buffer.from("Found star using https://www.google.com/sky/").toString('hex'),
        "storyDecoded": "Found star using https://www.google.com/sky/"
      }
    }
    await my_server.app.blockchain.addBlockFromData(payload);
  });

  it("gets the block from a given height", async () => {
    let resp = await my_server.inject({
      method: 'GET',
      url: '/block/1'
    });
    expect(resp.statusCode).to.equal(200);
    expect(resp.result).include(['hash','body','time','previousBlockHash']);
    expect(resp.result.height).equal(1);
    expect(resp.result.body).include({
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
      "star": {
        "dec": "-26° 29' 24.9",
        "ra": "16h 29m 1.0s",
        "story": '466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f',
        "storyDecoded": "Found star using https://www.google.com/sky/"
      }
    });
  });
});

describe('GET /stars/:{hash}', async () => {
  let my_server;
  before(async ({context}) => {
    del.sync(config.db);
    my_server = await server(manifest);
    my_server.table().forEach((route) => console.log(`${route.method}\t${route.path}`));
    let payload =  {
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
      "star": {
        "dec": "-26° 29' 24.9",
        "ra": "16h 29m 1.0s",
        "story": new Buffer.from("Found star using https://www.google.com/sky/").toString('hex'),
        "storyDecoded": "Found star using https://www.google.com/sky/"
      }
    }
    await my_server.app.blockchain.addBlockFromData(payload);
    // context.hash = await my_server.app.blockchain.getBlock(1).hash;
    let b = await my_server.app.blockchain.getBlock(1);
    context.hash = b.hash;
  });

  it("gets the block by a given hash", async ({context}) => {
    let resp = await my_server.inject({
      method: 'GET',
      url: '/stars/hash:'+context.hash
    });
    expect(resp.statusCode).to.equal(200);
    expect(resp.result).include(['hash','body','time','previousBlockHash']);
    expect(resp.result.hash).equal(context.hash);
    expect(resp.result.height).equal(1);
    expect(resp.result.body).include({
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
      "star": {
        "dec": "-26° 29' 24.9",
        "ra": "16h 29m 1.0s",
        "story": '466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f',
        "storyDecoded": "Found star using https://www.google.com/sky/"
      }
    });
  });
});


