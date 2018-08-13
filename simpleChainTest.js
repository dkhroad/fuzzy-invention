const { 
  Block, Blockchain
} = require('./simpleChain.js');

// Instantiate blockchain with blockchain variable
let blockchain = new Blockchain();

// generate 10 blocks using a for loop
var array = [0,1,2,3,4,5,6,7,8,9];
// var array = [10,11,12,13,14,15,16,17,18,19];
array.reduce((promiseChain,i) => {
  return promiseChain.then(chainResults => 
    blockchain.addBlock(new Block('test Block ' + i)).then(currentResult => 
      [...chainResults, currentResult ]
    )
  );
}, Promise.resolve([])).then(allDone => {
      console.log('all done');
      // blockchain.showAllBlocks();
      blockchain.validateChain();
});



// induce errors by chainging block data
/*
console.log('Inducing errors on block 2,4,7');
let induceErrorBlocks = [2,4,7];
induceErrorBlocks.map(i => {
  return Promise.all(blockchain.getBlock(induceErrorBlocks[i])
    .then((block) => {
      block.body = 'induce chain error';
      return block;
    }).then((block) => {
      blockchain.chain.put(block.height,JSON.stringify(block));
    })
  );
}).then(() => {
  // validate blockchain again. The chain should fail with blocks 2,4,7
  blockchain.validateChain();
}
*/
