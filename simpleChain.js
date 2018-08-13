/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const level = require('level');
const chainDB = './chaindata';

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
  constructor(data) {
    this.hash = "",
    this.height = 0,
    this.body = data,
    this.time = 0,
    this.previousBlockHash = ""
  }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor() {
    this.chain = level(chainDB);
    this.addGenesisBlock();
  }

  addGenesisBlock() {
    let self = this;
    this.getBlock(1)
    .then((block) => {
        if (block.height != 1) {
          console.log(typeof block.height);
          console.log(block.height);
          console.log('**Corrupt Genesis block',block);
          throw new Error('--Corrupt genesis block');
        }
      }).catch((err) => {
        if (err.notFound) {
          self.addBlock(new Block("First block in the chain - Genesis block"));
        }
      });
  }
  // Add new block
  addBlock(newBlock){
    let self = this;
    this.getLastBlock()
      .then((lastBlock) => {
        if (lastBlock == null) {
          newBlock.height = 1;
        } else {
          console.log('lastBlock: ',lastBlock);
          newBlock.previousBlockHash = lastBlock.hash;
          newBlock.height = lastBlock.height + 1;
        }
        newBlock.time = new Date().getTime().toString().slice(0,-3);
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
        console.log(newBlock);
        self.chain.put(newBlock.height,JSON.stringify(newBlock));
      }).catch((err) => {
        console.log(err);
      });
  }

 getBlock(blockheight) {
   return this.chain.get(blockheight)
     .then((block) => {
       return JSON.parse(block);
     });
 }

  getLastBlock() {
    let i=0;
    let last_block=null;
    let self = this;
    return new Promise(function(resolve,reject) {
      self.chain.createReadStream()
        .on('data',function(data) {
          i++;
          last_block = data.value;
        }).on('close',function() {
          if (last_block) {
            console.log('resolving to',last_block);
          } else {
            console.log('chain is empty',i);
          }
          resolve(last_block ? JSON.parse(last_block) : last_block);
         }).on('error',function(error) {
           console.log(error)
           reject(error);
         });
    });
  }

    // validate block
    validateBlock(block){

      // get block hash
      let blockHash = block.hash;
      // remove block hash to test block integrity
      block.hash = '';
      // generate block hash
      let validBlockHash = SHA256(JSON.stringify(block)).toString();
      // Compare
      if (blockHash===validBlockHash) {
        return true;
      } else {
        console.log('Block #'+block.height+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
        return false;
      }
    }

    getAllBlocks() {
      let blocks = []
      let self = this;
      return new Promise(function(resolve,reject) {
        self.chain.createReadStream()
          .on('data',function(data) {
            blocks.push(JSON.parse(data.value));
          }).on('close',function() {
            resolve(blocks);
          }).on('error',function(error) {
            console.log(error)
            reject(error);
          });
      });
    }

   // Validate blockchain
    validateChain(){
      let errorLog = [];
      let i=0;
      let previousBlock=null
      let self=this;
      this.chain.createValueStream().on('data', function(block) {
        i++;
        // validate block
        if (!self.validateBlock(JSON.parse(block))){
          errorLog.push(i);
        }
        // compare blocks hash link
        if (previousBlock) {
          if (block.previousBlockHash !== previousBlock.hash) {
            errorLog.push(i-1);
          }
        } else if (i > 1) { // there must exist previous block
            errorLog.push(i);
        }
        previousBlock = block;
      }).on('error', function(err) {
          return console.log('Unable to read data stream!', err)
      }).on('close',function() {
        /*
      for (var i = 0; i < this.chain.length-1; i++) {
        // validate block
        if (!this.validateBlock(i))
          errorLog.push(i);
        // compare blocks hash link
        let blockHash = this.chain[i].hash;
        let previousHash = this.chain[i+1].previousBlockHash;
        if (blockHash!==previousHash) {
          errorLog.push(i);
        }
      }
      */
        if (errorLog.length>0) {
          console.log('Block errors = ' + errorLog.length);
          console.log('Blocks: '+errorLog);
        } else {
          console.log('No errors detected');
        }
      });
    }

  showAllBlocks() {
    this.getAllBlocks().then((blocks) => {
      console.log('==========================================');
      blocks.forEach((block) => {
        console.log(block);
      });
      console.log('==========================================');
    });
  }
}

module.exports = { 
  Block,
  Blockchain
}

let bc = new Blockchain();
bc.addBlock(new Block('block no 1'));
bc.addBlock(new Block('block no 2'));

