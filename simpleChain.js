/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const level = require('level');
const config = require('./env.json')[process.env.NODE_ENV || 'development']
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
/* 
 * Blockchain factory class
 */
let _blockchain = null;
class BlockchainFactory {
  static async create() {
    if (!_blockchain) {
      _blockchain = new Blockchain();
      console.log('adding genesis block');
      await _blockchain.addGenesisBlockIfMissing(); 
      console.log('done adding genesisblock');
      console.log('1');
      return Promise.resolve(_blockchain);
    } else {  
      console.log('2');
      return Promise.resolve(_blockchain);
    }
  }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor(db=config.db) {
    console.log('opening db: ' + db);
    this.chain = level(db);
    // ensures genesis block is added first if missing
    this.genesisBlockAdded = false;
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
  async addGenesisBlockIfMissing() {
    let self = this;
    try {
      if (this.genesisBlockAdded) {
        return;
      }
      let height = await this.getBlockHeight();
      if (height == -1) { // add genesis block 
        console.log('adding genesis block');
        let gBlock = new Block("First block in the chain - Genesis block");
        gBlock.height = 0;
        gBlock.time = new Date().getTime().toString().slice(0,-3);
        gBlock.hash = SHA256(JSON.stringify(gBlock)).toString();
        await self.chain.put(self.lexi(gBlock.height),JSON.stringify(gBlock));
        this.genesisBlockAdded = true;
      }
    } catch (err) {
      console.log('Failed to add genesis block: ' + err);
    }
  }

  async addBlockFromData(body) {
   return await this.addBlock(new Block(body));
  }
  async addBlock(newBlock){
    let self = this;

    try {
      await self.addGenesisBlockIfMissing();
      let lastBlock = await self.getLastBlock();
      if (lastBlock == null) {
        throw new Error('missing genesis block');
      } 
      newBlock.previousBlockHash = lastBlock.hash;
      newBlock.height = lastBlock.height + 1 ;
      newBlock.time = new Date().getTime().toString().slice(0,-3);
      newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
      await self.chain.put(self.lexi(newBlock.height),JSON.stringify(newBlock));
      console.log('added block at height: '+ newBlock.height);
      return newBlock.height;
    }catch (err) {
      console.log(err);
    }
  }

  // get a block at the given blockheight
  async getBlock(blockheight) {
    let block = await this.chain.get(this.lexi(blockheight))
    return JSON.parse(block);
  }

  getLastBlock() {
    let self = this;
    let lastBlock = null
    return new Promise(function(resolve,reject) {
      self.chain.createReadStream({reverse: true, limit: 1})
        .on('data',function(data) {
          lastBlock = JSON.parse(data.value);
        }).on('end',function() {
          resolve(lastBlock);
        }).on('error',function(error) {
          console.log(error)
          reject(error);
        });
    });

  }
  // compute the current block height
  // by traversing the blockchain
  async getBlockHeight() {
    let i=-1;
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
      // console.log('Block #'+block.height+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
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
  Blockchain,
  BlockchainFactory
}
