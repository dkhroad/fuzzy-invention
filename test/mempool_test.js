const {expect} = require('code');
const Lab = require('lab');
const { after, before, beforeEach, afterEach, describe, it } = exports.lab = Lab.script();
const { MemPool } = require('../mempool.js');
const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');


describe('.add', () => { 
  let mempool;
  before(({context}) => {
    context.validationWindow = 0.05
    mempool = new MemPool();
    context.origValidatonWindow = mempool.validationWindow;
    mempool.validationWindow = 0.05; 
  });
  after(({context}) => {
    mempool.validationWindow = context.origValidatonWindow;
  });
  it('add an entry in mempool', ({context}) => {
    // let mempool = context.mempool;
    let rts =  mempool.timeInSeconds(new Date().getTime());
    let res = mempool.add("deadbeef");
    expect(res.address).to.equal("deadbeef");
    expect(res.validationWindow).to.below(context.validationWindow);
    expect(res.requestTimeStamp).to.equal(rts);
    expect(res.message).to.equal("deadbeef:"+res.requestTimeStamp+":starRegistry")
    expect(mempool.cache["deadbeef"].timeOut).to.not.be.undefined();
  });


  it.skip('removes the entry when timer expires (will sleep..) ', async () => {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve([])
      },1500);
    })
    expect(mempool.cache["deadbeef"]).to.not.exist();
    expect(res.validationWindow).to.equal(context.validationWindow);
  });

  it('reduces validation window on resubmitting',async () => {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve([])
      },10);
    })
    let res = mempool.add("deadbeef");
    expect(res.validationWindow).to.be.below(0.05);

  });

});


function sign(privateKey, message) {
  let keyPair = bitcoin.ECPair.fromWIF(privateKey);
  let signature = bitcoinMessage.sign(message,keyPair.privateKey,keyPair.compressed);
  let signature_b64 = signature.toString('base64');
  // console.log(signature_b64);
  return signature_b64;
}

describe('.validateSig',() => {
  let mempool;

  before(({context}) => {
    mempool = new MemPool();
    context.address =  '1Lb71xuujNBJ2sZusE2p5KSvXwPvWb2h5v';
    context.pvtKey = 'L1fRSX7yNALy7JieBScm1wncDk44kEZV97uE7uPNJAk8TsGotV4h';
  });

  it('validates the correct sig',({context}) => {
    let res=mempool.add(context.address);
    let sig = sign(context.pvtKey,res.message);
    let val_res = mempool.validateSig({address: context.address,signature: sig})
    expect(val_res).to.include({registerStar: true});
    expect(val_res.status).to.include({
      address: context.address,
      messageSignature: 'valid',
      message: res.message,
      validationWindow: 300 
    });
  });


  it('does not validate the incorrect sig',({context}) => {
    let res=mempool.add(context.address);
    let sig = sign(context.pvtKey,res.message+' ');
    let val_res = mempool.validateSig({address: context.address,signature: sig})
    expect(val_res).to.include({registerStar: true});
    expect(val_res.status).to.include({
      address: context.address,
      messageSignature: 'invalid',
      message: res.message,
      validationWindow: 300 
    });
  });

  it('set registerStar flag to false when validationWindow expires',({context}) => {
    let res=mempool.add(context.address);
    mempool.cache[context.address].requestTimeStamp = res.requestTimeStamp - mempool.validationWindow - 10;
    let sig = sign(context.pvtKey,res.message);
    let val_res = mempool.validateSig({address: context.address,signature: sig})
    expect(val_res).to.include({registerStar: false});
    expect(val_res.status).to.include({
      address: context.address,
      messageSignature: 'valid',
      message: res.message,
      validationWindow: -10 
    });
  });

});


describe('.timeRemaining',() => {
  let mp = new MemPool();
  it('correctly calulates time remaining',() => {
    rts = parseInt(new Date().getTime()/1000) - 15;
    expect(mp.timeRemaining(rts)).to.equal(285);
  });
});

