const Joi = require('joi');
/* TODO: Add a proper validation of a wallet address */
const requestValidationSchema  = {
  address: Joi.string().alphanum().min(26).max(34).required()
}
const messageSigValidationSchema = {
  address: Joi.string().alphanum().min(26).max(34).required(),
  signature: Joi.string().base64()
}

module.exports = {
  name: "NotarySvcPlugin",
  register: async (server,options) => {
    let mempool = options.mempool;
    let sigValidationSvc = options.sigValidationSvc;
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
          result = sigValidationsvc.validateSignature(mempool[request.payload.address],request.payload);
          return result;
        }
      }
    ]);
  }
}
