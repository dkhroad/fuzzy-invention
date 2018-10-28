const {expect} = require('code');
const Lab = require('lab');
const { after, before, beforeEach, afterEach, describe, it } = exports.lab = Lab.script();
const { MemPool } = require('../mempool.js');

describe('.add', () => { 
  let mempool;
  before(() => {
    mempool = new MemPool(0.05);
  });
  it('add an entry in mempool', () => {
    let rts =  mempool.timeInSeconds(new Date().getTime());
    let res = mempool.add("deadbeef");
    expect(res.address).to.equal("deadbeef");
    expect(res.validatonWindow).to.equal(0.05);
    expect(res.requestTimeStamp).to.equal(rts);
    expect(res.message).to.equal("deadbeef:"+res.requestTimeStamp+":starRegistry")
  });

  it('starts the timer', () => {
    expect(mempool.cache["deadbeef"].endTime).to.not.be.null();
  });

  it('countdown the timer (will sleep..) ', async () => {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve([])
      },50);
    })
    expect(mempool.cache["deadbeef"]).to.not.exist();
  });
});


