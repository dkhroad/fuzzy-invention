var expect = require('chai').expect 

const { 
  Block, Blockchain 
} = require('../simpleChain.js');

const del = require('del');

const chainTestDB = './chain_test_data'; 

async function clearDB(db) {
  return new Promise(function(resolve,reject) {
    db.destroy(chainTestDB,function(error) {
      if (error) {
        reject(error);
      } else {
        resolve([]);
      }
    });
  });
}

describe('Blockchain', function() {
  let blockchain;

  before(async function() {
    del.sync(chainTestDB);
    blockchain = new Blockchain(chainTestDB); 
  });


  describe('#addGenesisBlockIfMissing', function() {
      it('add genesis block', async function() {
      // let blockchain = new Blockchain(chainTestDB); 
        let orig_height = await blockchain.getBlockHeight();
        expect(orig_height,'height_before').to.equal(-1);
        await blockchain.addGenesisBlockIfMissing();
        let curr_height =  await blockchain.getBlockHeight();
        expect(curr_height,'height_after').to.equal(0);
        lastBlock = await blockchain.getLastBlock();
        expect(lastBlock.body,'block content').to.include('Genesis block');
      
      });

      it('adds genesis block one time', async function() {
        await blockchain.addGenesisBlockIfMissing();
        let curr_height =  await blockchain.getBlockHeight();
        expect(curr_height,'height_after').to.equal(0);
        await blockchain.addGenesisBlockIfMissing();
        curr_height =  await blockchain.getBlockHeight();
        expect(curr_height,'height_after').to.equal(0);
      });
  });


});
