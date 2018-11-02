const { expect } = require('code');
const Lab = require('lab');
const { after, before, describe, it } = exports.lab = Lab.script();
const  NotarySvcPlugin = require('../notary_svc');
const del = require('del');
const server = require('../index.js');
const config = require('../env.json')[process.env.NODE_ENV || 'test']
const { MemPool } = require('../mempool.js');

describe('Blockchain ID validation', () => {
  it('accepts a valid request', async () => {
    await server.start();
    let res = await server.inject({
      method: 'POST',
      url: '/requestValidation',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: {
        address: "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ"
      }
    });
    expect(res.statusCode).to.equal(200);
    expect(res.result.address).to.equal('142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ');
    expect(res.result.validationWindow).equal(300);
    expect(res.result.message).to
      .equal(res.result.address+':'+res.result.requestTimeStamp+':starRegistry');
  });
});

describe('POST /message-signature/validate',() => {
  before(async ({context}) => {
    context.privateKey = 'L1fRSX7yNALy7JieBScm1wncDk44kEZV97uE7uPNJAk8TsGotV4h';
    context.address = '1Lb71xuujNBJ2sZusE2p5KSvXwPvWb2h5v';
    context.res = await server.inject({
      method: 'POST',
      url: '/requestValidation',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: {
        address: context.address
      }
    });
    if (context.res.statusCode !== 200) {
      console.log(context.res.payload);
    }
  });
  it('accepts a valid request that is in mempool',async ({context}) => {
    expect(context.res.statusCode).to.equal(200);
    let res = await server.inject({
      method: 'POST',
      url: '/message-signature/validate',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: {
        address: context.address,
        signature: context.signature
      }
    });
    expect(context.res.statusCode).to.equal(200);
  });
    it('doesnt accept a valid requies thay is not in the current mempool', async () => {
    });
});


  
