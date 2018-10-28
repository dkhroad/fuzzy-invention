const { expect } = require('code');
const Lab = require('lab');
const { after, before, describe, it } = exports.lab = Lab.script();
const  NotarySvcPlugin = require('../notary_svc');
const del = require('del');
const server = require('../index.js');
const config = require('../env.json')[process.env.NODE_ENV || 'test']

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


  
