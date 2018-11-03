const Joi = require('joi');
/* TODO: Add a proper validation of a wallet address */
const requestValidationSchema  = {
  address: Joi.string().alphanum().min(26).max(34).required()
}
const messageSigValidationSchema = {
  address: Joi.string().alphanum().min(26).max(34).required(),
  signature: Joi.string().base64().required()
}

module.exports = {
  name: "NotarySvcPlugin",
  register: async (server,options) => {
    server.route([
      {
        method: 'POST',
        path: '/requestValidation',
        options: {
          validate: {
            payload: requestValidationSchema
          }
        },
        handler: async(request,h) => {
          let mempool = request.server.app.mempool;
          req=mempool.add(request.payload["address"]);
          return req; 
        }
      },
      {
        method: 'POST',
        path: '/message-signature/validate',
        options: {
          validate: {
            payload: messageSigValidationSchema
          }
        },
        handler: async(request,h) => {
          let mempool = request.server.app.mempool;
          result = mempool.validateSig(request.payload);
          if (!result) {
            return h.response("invalid address").code(404);
          } else {
            return result;
          }
        }
      }
    ]);
  }
}
