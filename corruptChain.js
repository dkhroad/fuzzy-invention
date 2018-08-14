const { 
  Block, Blockchain
} = require('./simpleChain.js');

// Instantiate blockchain with blockchain variable
let blockchain = new Blockchain();


// induce errors by chainging block data
console.log('Inducing errors on block 2,4,7');
let induceErrorBlocks = [2,4,7];
induceErrorBlocks.map(i => {
  blockchain.getBlock(i).then(block => {
    block.body = 'induce chain error';
    blockchain.chain.put(blockchain.lexi(i),JSON.stringify(block));
  })
});
