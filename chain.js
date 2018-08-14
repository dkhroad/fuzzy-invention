const { 
  Block, Blockchain
} = require('./simpleChain.js');

// Instantiate blockchain with blockchain variable
let blockchain = new Blockchain();

blockchain.showAllBlocks();
blockchain.validateChain();
blockchain.getBlockHeight().then(height => console.log(height));
