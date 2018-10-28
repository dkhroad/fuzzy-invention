const config = require('./env.json')[process.env.NODE_ENV || 'development'];
const { 
  Block, Blockchain, BlockchainFactory
} = require('./simpleChain.js');

// Instantiate blockchain with blockchain variable
async function getBlockchainInstance() {
  let bc = await BlockchainFactory.create();
  console.log('bc*****************************************: '+ bc);
  return Promise.resolve(bc);
}

const blockchain =  new Blockchain();

let last_block;
let i=0;
blockchain.chain.createReadStream()
  .on('data',function(data) {
    last_block = data;
    i++;
    // console.log('data',data.key,data.value);
    console.log('data',data);
  }).on('close',function() {
      console.log('Total',i);
  }).on('error',function(error) {
    console.log(error)
    reject(error);
  });
/*
blockchain.validateChain().then(errorLog => {
        if (errorLog.size>0) {
          console.log('Block errors = ' + errorLog.length);
          console.log('Blocks: ', errorLog);
        } else {
          console.log('No errors detected');
        }
});
 */
