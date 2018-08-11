const { 
  Block, Blockchain
} = require('./simpleChain.js');

// Instantiate blockchain with blockchain variable
let blockchain = new Blockchain();

// generate 10 blocks using a for loop
for (var i=0; i < 10; i++) {
  blockchain.addBlock(new Block("test data " + i));
}


// validate blockchain
console.log('validating chain...');
blockchain.validateChain();

// induce errors by chainging block data
console.log('Inducing errors on block 2,4,7');
let induceErrorBlocks = [2,4,7];
for (var i=0; i < induceErrorBlocks.length; i++) {
  blockchain.chain[induceErrorBlocks[i]].body = 'induced chain error';
}
// validate blockchain again. The chain should fail with blocks 2,4,7

blockchain.validateChain();

