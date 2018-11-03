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
/*
describe('GET /block{height}', async function() {
  let random = 0;
  before(async () => {
    del.sync(config.db);
    random = Math.floor(Math.random() * 10);
    console.log('doing post for get');
    let res  = await server.inject({
      method: 'POST',
      url: '/block',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: {
        "body": "Testing block creation via POST for GET- " + random
      }
    });
  });
});
*/

describe('POST/GET /block', async () => {
  let my_server;
  let random = Math.floor(Math.random() * 10);
  before(async ()  => {
    del.sync(config.db);
    my_server = await server(manifest);
  });

  it('creates a new block', async () =>  {
    let res  = await my_server.inject({
      method: 'POST',
      url: '/block',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: {
        "body": "Testing block creation via POST - " + random
      }
    });
    expect(res.statusCode).to.equal(201);
    expect(res.result.body).to.equal("Testing block creation via POST - " + random);
  });

  it('fetches a given block', async () =>  { 
    let res = await my_server.inject({method: 'GET', url: '/block/1'});
    expect(res.statusCode).to.equal(200);
    expect(res.result.body).to.equal("Testing block creation via POST - " + random);
    console.log(res.result);
  });
});

