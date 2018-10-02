const Joi = require('joi');
const { 
  Block, Blockchain 
} = require('../simpleChain.js');


console.log(process.env.NODE_ENV);
const blockchain = process.env.NODE_ENV == 'test' ?
  new Blockchain('./test/chain_test_data') : 
  new Blockchain();

module.exports = { 
  name: "BlockchainApiPlugin",
  register: async (server,options) => {
    server.route([
      {
        method: 'GET',
        path: '/block/{height}',
        options: {
          validate: {
            params: {
              height: Joi.number().integer().min(0).max(9999).default(0)
            }
          }
        },
        handler: async (request, h) => {
          let bh = parseInt(request.params.height);

          console.log(`getting block at height: ${bh}`);
          let lb = await blockchain.getLastBlock();
          if (bh > lb.height) {
            var err = {
              error: 'Bad Request',
              message: 'Invalid block height'
            }
            return h.response(err).code(400);
          } else {
            return blockchain.getBlock(bh);
          }
        }
      },
      {
        method: 'POST',
        path: '/block',
        options: {
          validate: {
            payload: {
              body: Joi.string().min(5).max(200).required()
            }
          }
        },
        handler: async (request, h) => {
          console.log('in post handler with data: ' + JSON.stringify(request.payload.body)); 
          let bh = await  blockchain.addBlock(new Block(request.payload.body));
          let block =  await blockchain.getBlock(bh);
          return h.response(block).code(201)
        }
      }
    ]);
  }
}
