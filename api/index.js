const Joi = require('joi');
const { Block, BlockchainFactory } = require('../simpleChain.js');



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
          let blockchain = request.server.app.blockchain;
          let lb = await blockchain.getLastBlock();
          console.log(`getting block at height: ${bh}`);
          if (bh > lb.height) {
            var err = {
              error: 'Bad Request',
              message: 'Invalid block height '+ lb.height
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
          let blockchain = request.server.app.blockchain;
          console.log('in post handler with data: ' + JSON.stringify(request.payload.body)); 
          let bh = await  blockchain.addBlock(new Block(request.payload.body));
          let block =  await blockchain.getBlock(bh);
          return h.response(block).code(201)
        }
      }
    ]);
  }
}
