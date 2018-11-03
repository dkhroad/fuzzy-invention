const { expect } = require('code');
const Lab = require('lab');
const { after, before, describe, it } = exports.lab = Lab.script();
const  NotarySvcPlugin = require('../notary_svc');
const del = require('del');
const server = require('../index.js');
const {sign } = require('../sig_verify.js');
const config = require('../env.json')[process.env.NODE_ENV || 'test']


const manifest = {
  server: {
      port: 8000,
      host: 'localhost'
  },
  register : {
    plugins: [
      {
        plugin: require('../notary_svc'),
      }
    ]
  }
}

describe('POST /requestValidation', () => {
  let my_server;
  before(async () => {
    my_server=await server(manifest);
  });
  it('accepts a valid request', async () => {
    let res = await my_server.inject({
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
  let my_server;
  before(async ({context}) => {
    context.privateKey = 'L1fRSX7yNALy7JieBScm1wncDk44kEZV97uE7uPNJAk8TsGotV4h';
    context.address = '1Lb71xuujNBJ2sZusE2p5KSvXwPvWb2h5v';
    my_server=await server(manifest);
    context.res = await my_server.inject({
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
    let signature = sign(context.privateKey,context.res.result.message);
    let res = await my_server.inject({
      method: 'POST',
      url: '/message-signature/validate',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: {
        address: context.address,
        signature: signature
      }
    });
    expect(res.statusCode).to.equal(200);
    expect(res.result.status.messageSignature).to.equal('valid');
  });

  it('doesnt accept a validate request for address that is not in the current mempool', async ({context}) => {
    let bad_address = context.address.slice(0,context.address.length-3)+'abc';
    let signature = sign(context.privateKey,context.res.result.message);
    let res = await my_server.inject({
      method: 'POST',
      url: '/message-signature/validate',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: {
        address: bad_address,
        signature 
      }
    });
    expect(res.statusCode).to.equal(404);
  });
});


  
