const { expect } = require('code');
const Lab = require('lab');
const { after,before,describe,it } = exports.lab = Lab.script();
const Hapi = require('hapi');
const ApiPlugin = require('../api');
const del = require('del');
const config = require('../env.json')[process.env.NODE_ENV || 'test']
// create a server instance 
const server = require('../index.js');

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
  before(()  => {
    del.sync(config.db);
  });

  let random = Math.floor(Math.random() * 10);
  it('creates a new block', async () =>  {
    await server.start();
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

  it('fetches a given block', async function() { 
    let res = await server.inject({method: 'GET', url: '/block/1'});
    expect(res.statusCode).to.equal(200);
    expect(res.result.body).to.equal("Testing block creation via POST - " + random);
    console.log(res.result);
  });
});

