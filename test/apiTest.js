const { expect } = require('code');
const Lab = require('lab');
const { after,before,describe,it } = exports.lab = Lab.script();
const Hapi = require('hapi');
const ApiPlugin = require('../api');

const del = require('del');
const chainTestDB = './test/chain_test_data'; 
// create a server instance 
const server = require('../index.js');
describe('GET /block{height}', async function() {
  let random = 0;
  before(async () => {
    del.sync(chainTestDB);
    random = Math.floor(Math.random() * 10);
    let res  = await server.inject({
      method: 'POST',
      url: '/block',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: {
        "body": "Testing block creation via POST - " + random
      }
    });
  });

  it('GET /block/1', async function() { 
    let res = await server.inject({method: 'GET', url: '/block/1'});
    expect(res.statusCode).to.equal(200);
    expect(res.result.body).to.equal("Testing block creation via POST - " + random);
    // console.log(res.result);
  });

});

describe('POST /block', async () => {
  it('creates a new block', async () =>  {
    let random = Math.floor(Math.random() * 10);
    let res  = await server.inject({
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
});

