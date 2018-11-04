const Joi = require('joi');


// Encode image buffer to hex
imgHexEncode = new Buffer(imgReadBuffer).toString('hex');
// Decode hex
var imgHexDecode = new Buffer(imgHexEncode, 'hex');
*/
const requestSchema = {
  address: Joi.string().alphanum().min(26).max(34).required(),
  star: Joi.object({
    dec: Joi.string().max(50).required(),
    ra: Joi.string().max(50).required(),
    story: Joi.string().max(500,'hex'),
    mag: Joi.string().regex(/^[0-9]+\.?[0-9]+$/),
    cons: Joi.string().max(50)
  })
};


module.exports = { 
  name: "StarLookupSvc",
  register: async (server,options) => {
    server.route([
    /*
      {
        method: 'GET',
        path: '/block',
        options: {
          validate: {
            payload: requestSchema
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
      */
      {
        method: 'POST',
        path: '/block',
        options: {
          validate: {
            payload: requestSchema
          }
        },
        handler: async (request, h) => {
          let blockchain = request.server.app.blockchain;
          let mempool = request.server.app.mempool;

          if (!mempool.inMemPool(request.payload.address)) {
            return h.response('Missing address').code(404);
          }
          res = mempool.status(request.payload.address);
          if (res.messageSignature !== "valid") {
            return h.response('Unverified address').code(400);
          }
          if (res.validationWindow <= 0) {
            return h.response('Address validation window expired').code(400);
          }

          request.payload.star.story = new Buffer.from(request.payload.star.story).toString('hex');
          let bh = await  blockchain.addBlockFromData(request.payload);
          let block =  await blockchain.getBlock(bh);
          return h.response(block).code(201)
        }
      }
    ]);
  }
}
