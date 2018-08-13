
const { 
  Block, Blockchain
} = require('./simpleChain.js');

// Instantiate blockchain with blockchain variable
let blockchain = new Blockchain();
blockchain.validateChain().then(errorLog => {
  if (errorLog.size>0) {
          console.log('Block errors = ' + errorLog.size);
          console.log('Blocks: ', errorLog);
        } else {
          console.log('No errors detected');
        }
});
