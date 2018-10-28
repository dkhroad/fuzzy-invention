const Joi = require('joi');
/* TODO: Add a proper validation of a wallet address */
const requestValidationSchema  = {
  address: Joi.string().min(26).max(34).required()
}
module.exports = {
  name: "NotarySvcPlugin",
  register: async (server,options) => {
    let mempool = options.mempool;
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
          console.log('in post handler with data: ' + JSON.stringify(request.payload)); 
          req=mempool.add(request.payload["address"]);
          console.log(req);
          return req; 
          
        }
      }
    ]);

  }
}
