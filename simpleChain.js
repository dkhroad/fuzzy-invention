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
    this.currentHeight = 0;
    this.genesisBlockPromise = this.addGenesisBlock();
  }


  lexi(n) {
    let ln = ("0000" + n).substr(-4,4);
    console.log('lexi: n',n,'ln',ln);
    return ln;
  }
  addGenesisBlock() {
    let self = this;
    return new Promise((resolve,reject) => {
      this.getBlockHeight().
        then(height => {
          if (height === 0) {
            console.log('adding genesis block...');
            let gBlock = new Block("First block in the chain - Genesis block");
            gBlock.height = 1;
            gBlock.time = new Date().getTime().toString().slice(0,-3);
            gBlock.hash = SHA256(JSON.stringify(gBlock)).toString();
            self.chain.put(self.lexi(gBlock.height),JSON.stringify(gBlock));
          } else{
            console.log('genesis block already exists',height);
            self.currentHeight = height;            
          }
        }).then(resp => {
          console.log('*resp',resp);
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
      self.genesisBlockPromise
        .then(() => self.getBlock(self.currentHeight))
        .then((lastBlock) => {
          if (lastBlock == null) {
            throw new Error('missing genesis block');
          } 
          console.log('lastBlock height: ',lastBlock.height,self.currentHeight);
          newBlock.previousBlockHash = lastBlock.hash;
          newBlock.height = lastBlock.height + 1;
          newBlock.time = new Date().getTime().toString().slice(0,-3);
          newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
          console.log('adding block to chain',newBlock.height,self.currentHeight);
          self.chain.put(self.lexi(newBlock.height),JSON.stringify(newBlock));
      }).then(() => {
        self.currentHeight++;
        console.log('block added',self.currentHeight);
        resolve([]);
      }).catch((err) => {
        console.log(err);
        reject(err);
      });
    });
  }

 getBlock(blockheight) {
   return this.chain.get(this.lexi(blockheight))
     .then((block) => {
       return JSON.parse(block);
     });
 }

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
  getLastBlock() {
    let i=0;
    let last_block=null;
    let self = this;
    return new Promise(function(resolve,reject) {
      self.chain.createReadStream({reverse: true,limit:1})
        .on('data',function(data) {
          i++;
          last_block = data.value;
          console.log('===',data.key,data.value);
        }).on('end',function() {
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
      block.hash = blockHash; // leave the block in its original state
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
  /*
let bc = new Blockchain();

[1,2,3].reduce((promiseChain,i) => {
  return promiseChain.then(chainResults => 
    bc.addBlock(new Block('test Block ' + i)).then(currentResult => 
      [...chainResults, currentResult ]
    )
  );
}, Promise.resolve([])).then(allDone => {
      console.log('all done');
      bc.showAllBlocks();
});

bc.validateChain().then(errorLog => {
        if (errorLog.length>0) {
          console.log('Block errors = ' + errorLog.length);
          console.log('Blocks: ', errorLog);
        } else {
          console.log('No errors detected');
        }
});

*/ 
