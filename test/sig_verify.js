const {expect} = require('code');
const Lab = require('lab');
const { after, before, beforeEach, afterEach, describe,it } = exports.lab = Lab.script();

const { verify } = require('../sig_verify.js')

describe('.verify', () => {
  it('verifies a valid signature',() => {
    const message = 'The Times 03/Jan/2009 Chancellor on brink of second bailout for banks.'
    const address = '17RebJGPcUX3z7zoWJdmUgkBbvZ7BAKPCB';
    // const signature = 'HJLQlDWLyb1Ef8bQKEISzFbDAKctIlaqOpGbrk3YVtRsjmC61lpE5ErkPRUFtDKtx98vHFGUWlFhsh3DiW6N0rE'
    const signature = 'IFn36Idac3dLo3JvQ8/+AMfgQXbj9h3WIjDXJSUO+0ZbSOVEMhQK+t6RU3CC7ECvq9QshbRtLMLThDfCxa1RkYM='
    expect(verify(message,address,signature)).to.be.true();
  });

  it('doesn not verifies an invalid signature',() => {
    const message = 'The Times 03/Jan/2009 Chancellor on brink of second bailout for banks.'
    const address = '17RebJGPcUX3z7zoWJdmUgkBbvZ7BAKPCB';
    const signature = 'HJLQlDWLyb1Ef8bQKEISzFbDAKctIlaqOpGbrk3YVtRsjmC61lpE5ErkPRUFtDKtx98vHFGUWlFhsh3DiW6N0rE'
    expect(verify(message,address,signature)).to.be.false();
  });
});
