const Joi = require('joi');
/*
// Encode image buffer to hex
imgHexEncode = new Buffer(imgReadBuffer).toString('hex');
// Decode hex
var imgHexDecode = new Buffer(imgHexEncode, 'hex');
*/

module.exports = { 
  name: "StarLookupSvc",
  register: async (server,options) => {
    server.route([
      {
        method: 'GET',
        path: '/stars/address:{address}',
        options: {
          validate: {
            params: {
              address: Joi.string().alphanum().min(26).max(34).required()
            }
          }
        },
        handler: async (request, h) => {
          let blockchain = request.server.app.blockchain;
          return blockchain.getAllBlocksForAddress(request.params.address);
        }
      },
      {
        method: 'GET',
        path: '/stars/hash:{hash}',
        options: {
          validate: {
            params: {
              hash: Joi.string().alphanum().length(64).required()
            }
          }
        },
        handler: async (request, h) => {
          let blockchain = request.server.app.blockchain;
          return blockchain.getBlockByHash(request.params.hash);
        }
      },
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
      }
    ])
  }
}
