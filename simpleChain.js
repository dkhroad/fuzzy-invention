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

    // used to fetch the last block on the chain
    this.currentHeight = 0; 

    // ensures genesis block is added first if missing
    this.genesisBlockPromise = this.addGenesisBlock();
  }

  /*========================================
   a simple utility function 
   to create keys in lexicographical order
   =========================================*/
  lexi(n) {
    let ln = ("0000" + n).substr(-4,4);
    return ln;
  }

  /*=====================================================
   adds genesis block.
   Had to make a separate method, to avoid race condition
   in addBlock() method. 
   Since all leveldb put operatons are async, 
   a race condition does occur when multiple blocks are added
   in a quick succession after creating Blockchain instance.
   ========================================================*/
  addGenesisBlock() {
    let self = this;
    return new Promise((resolve,reject) => {
      this.getBlockHeight().
        then(height => {
          if (height === 0) { // add genesis block
            let gBlock = new Block("First block in the chain - Genesis block");
            gBlock.height = 1;
            gBlock.time = new Date().getTime().toString().slice(0,-3);
            gBlock.hash = SHA256(JSON.stringify(gBlock)).toString();
            self.chain.put(self.lexi(gBlock.height),JSON.stringify(gBlock));
          } else{
            //genesis block already exists
            self.currentHeight = height;            
          }
        }).then(resp => {
          // initialize the current block height to 1 if 
          // genesis block was added successfully.
          if (self.currentHeight == 0) {
            self.currentHeight = 1;
          }
          resolve([]);
        }).catch(err => {
          reject(err);
        });
    });
  }


  // Add new block
  addBlock(newBlock){
    let self = this;
    return new Promise((resolve,reject) => {
      // ensure genesis block is added before adding new blocks.
      // most of the time this will be a fulfilled promise.
      // so it won't be inefficient to check it before adding
      // a new block
      self.genesisBlockPromise 
        .then(() => self.getBlock(self.currentHeight))
        .then((lastBlock) => {
          if (lastBlock == null) {
            throw new Error('missing genesis block');
          } 
          newBlock.previousBlockHash = lastBlock.hash;
          newBlock.height = lastBlock.height + 1;
          newBlock.time = new Date().getTime().toString().slice(0,-3);
          newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
          self.chain.put(self.lexi(newBlock.height),JSON.stringify(newBlock));
        }).then(() => {
          self.currentHeight++;
          resolve([]);
        }).catch((err) => {
          console.log(err);
          reject(err);
        });
    });
  }

  // get a block at the given blockheight
  getBlock(blockheight) {
    return this.chain.get(this.lexi(blockheight))
      .then((block) => {
        return JSON.parse(block);
      });
  }

  // compute the current block height
  // by traversing the blockchain
  getBlockHeight() {
    let i=0;
    let self = this;
    return new Promise(function(resolve,reject) {
      self.chain.createReadStream()
        .on('data',function(data) {
          i++;
        }).on('end',function() {
          resolve(i);
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
    block.hash = blockHash; // leave the block in its original state
    // Compare
    if (blockHash===validBlockHash) {
      return true;
    } else {
      console.log('Block #'+block.height+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
      return false;
    }
  }

  // get all blocks from the blockchain 
  // blocks will be returned as an array of resolved promise
  getAllBlocks() {
    let blocks = []
    let self = this;
    return new Promise(function(resolve,reject) {
      self.chain.createReadStream()
        .on('data',function(data) {
          blocks.push(JSON.parse(data.value));
        }).on('end',function() {
          console.log('# of blocks in chain',blocks.length);
          resolve(blocks);
        }).on('error',function(error) {
          console.log(error)
          reject(error);
        });
    });
  }

  // Validate blockchain
  validateChain(){
    let errorLog = new Set();
    let self=this;
    let previousBlock=null;
    let currentBlock=null;
    return new Promise(resolve => {
      this.getAllBlocks().then(blocks => {
        blocks.reduce((prev,curr) => {
          if (!self.validateBlock(curr)){
            errorLog.add(curr.height);
          }
          if (prev) {
            if (curr.previousBlockHash !== prev.hash) {
              console.log('previousBlock hash doesnt match',curr,prev);
              errorLog.add(prev.height);
            }
          }
          return curr;
        },null);
        resolve(errorLog);
      });
    });
  }

  // utility method to show all blocks
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
