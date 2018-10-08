const { expect } = require('code');
const Lab = require('lab');
const { after, before, beforeEach, afterEach, describe, it } = exports.lab = Lab.script();
const { Block, Blockchain, BlockchainFactory } = require('../simpleChain.js');
const config = require('../env.json')[process.env.NODE_ENV || 'test']
const del = require('del');


function dumpChain(bc) {
  let i=0;
  bc.chain.createReadStream()
    .on('data',function(data) {
      console.log('data',data);
    }).on('close',function() {
      console.log('Total',i);
    }).on('error',function(error) {
      console.log(error);
    });
}

describe('BlockchainFactory', () => {
  before(async () => {
    blockchain =  await BlockchainFactory.create();
  });
  it('creates Blockchain instance with genesis block', async () => {
    firstBlock = await blockchain.getBlock(0);
    expect(firstBlock.body,'block content').to.include('Genesis block');
  });
  after(async () =>  {
    await blockchain.chain.close();
  });
});

describe('Blockchain', () =>  {
  let blockchain;

  beforeEach(async function() {
    del.sync(config.db);
    blockchain = new Blockchain(); 
  });

  afterEach(async function() {
    await blockchain.chain.close();
  });


  describe('#addGenesisBlockIfMissing', function() {
      it('add genesis block', async function() {
        let orig_height = await blockchain.getBlockHeight();
        expect(orig_height,'height_before').to.equal(-1);
        await blockchain.addGenesisBlockIfMissing();
        let curr_height =  await blockchain.getBlockHeight();
        expect(curr_height,'height_after').to.equal(0);
        lastBlock = await blockchain.getLastBlock();
        expect(lastBlock.body,'block content').to.include('Genesis block');
      
      });

      it('adds genesis block one time only', async function() {
        await blockchain.addGenesisBlockIfMissing();
        let curr_height =  await blockchain.getBlockHeight();
        expect(curr_height,'height_after').to.equal(0);
        await blockchain.addGenesisBlockIfMissing();
        curr_height =  await blockchain.getBlockHeight();
        expect(curr_height,'height_after').to.equal(0);
      });
  });

  describe('#addBlock', function() {
    it('adds block',async function() {
      let bh = await blockchain.addBlock(new Block('test block'));
      expect(bh,'current block height').to.equal(1);
      lastBlock = await blockchain.getLastBlock();
      expect(lastBlock.body,'block content').to.equal('test block');
    });

    it('adds multiple blocks in a lexicographical order',async function() {
      let cbh = -2
      for (let i=0;i<=10;i++) {
         cbh = await blockchain.addBlock(new Block('Test block - #'+i));
      }
      // console.log(cbh);
      // dumpChain(blockchain);
      let lastBlock = await blockchain.getLastBlock();
      expect(lastBlock.body,'block content').to.equal('Test block - #10');

      expect(cbh,'height_after').to.equal(11);
        
    });

    it('adds genesis block if missing',async function() {
      let bh = await blockchain.addBlock(new Block('test block'));
      firstBlock = await blockchain.getBlock(0);
      expect(firstBlock.body,'block content').to.include('Genesis block');
    });
  });

  describe('#validateChain',function() {
    beforeEach(async function() {
      for (let i=0;i<=10;i++) {
        await blockchain.addBlock(new Block('Test block - #'+i));
      }
    });

    it('validates good chain correctly',async function() {
      errorLog = await blockchain.validateChain();
      expect(errorLog.size).to.equal(0);
    });

    it('detects errors in a corrupt chain',async function() {
      for (var i of [2,4,7]) {
        var b = await blockchain.getBlock(i);
        b.body = 'induce chain error -- ' + i;
        await blockchain.chain.put(blockchain.lexi(i),JSON.stringify(b));
      }
      errorLog = await blockchain.validateChain();
      expect(errorLog.size).to.equal(3);
      let it = errorLog.values();
      expect(it.next().value).to.equal(2);
      expect(it.next().value).to.equal(4);
      expect(it.next().value).to.equal(7);

    });
      
      

  });


});
