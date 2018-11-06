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
        plugin: require('../star_registration_svc'),
      }
    ]
  }
}

describe('POST /block', async () => {
  let my_server;
  before(async ()  => {
    del.sync(config.db);
    my_server = await server(manifest);
  });

  it('does not creat a new block for address not in mempool', async () =>  {
    let res  = await my_server.inject({
      method: 'POST',
      url: '/block',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: {
        "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
        "star": {
          "dec": "-26° 29' 24.9",
          "ra": "16h 29m 1.0s",
          "story": "Found star using https://www.google.com/sky/"
        }
      }
    });

    expect(res.statusCode).to.equal(404);
    expect(res.result).equal("Missing address");
  });

  it('does not create a new block for unvalidated address in mempool', async () =>  {
    let mempool = my_server.app.mempool;
    let address = "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ"
    mempool.add(address);
    let res  = await my_server.inject({
      method: 'POST',
      url: '/block',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: {
        "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
        "star": {
          "dec": "-26° 29' 24.9",
          "ra": "16h 29m 1.0s",
          "story": "Found star using https://www.google.com/sky/"
        }
      }
    });
    expect(res.statusCode).to.equal(400);
    expect(res.result).equal("Unverified address");
  });
  it('does not create a new block for expired address in mempool', async () =>  {
    let mempool = my_server.app.mempool;
    let address =  '1Lb71xuujNBJ2sZusE2p5KSvXwPvWb2h5v';
    let res=mempool.add(address);
    mempool.cache[address].messageSignature = 'valid'; 
    let rts = mempool.cache[address].requestTimeStamp - 301;
    mempool.cache[address].requestTimeStamp = rts;
    let response  = await my_server.inject({
      method: 'POST',
      url: '/block',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: {
        "address": address,
        "star": {
          "dec": "-26° 29' 24.9",
          "ra": "16h 29m 1.0s",
          "story": "Found star using https://www.google.com/sky/"
        }
      }
    });
    expect(response.statusCode).to.equal(400);
    expect(response.result).equal("Address validation window expired");
    
  });
  it('creates a new block for a validated address', async () =>  {
    let mempool = my_server.app.mempool;
    let address =  "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ";
    mempool.add(address);
    mempool.cache[address].messageSignature = 'valid'; 
    let rts = mempool.cache[address].requestTimeStamp - 200;
    let res  = await my_server.inject({
      method: 'POST',
      url: '/block',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: {
        "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
        "star": {
          "dec": "-26° 29' 24.9",
          "ra": "16h 29m 1.0s",
          "story": "Found star using https://www.google.com/sky/"
        }
      }
    });

    expect(res.statusCode).to.equal(201);
    expect(res.result).include(["hash","height","body","time","previousBlockHash"])
    expect(res.result.body).to.include(["address","star"]);
    expect(res.result.body.star).to.equal({
      "dec": "-26° 29' 24.9",
      "ra": "16h 29m 1.0s",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
    })
    // invalidates the request after a block is added successfully
    expect(mempool.inMemPool(address)).to.false();
  });
});

