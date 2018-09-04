'use strict;'


const {
  Block, Blockchain
} = require('./simpleChain.js');
const Hapi = require('hapi');
const Joi = require('joi');

const blockchain = new Blockchain();

const server = Hapi.server({
  port: 8000,
  host: 'localhost'
});


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
    handler: (request, h) => {
      let bh = parseInt(request.params.height);
      
      console.log(`getting block at height: ${bh}`);
      return blockchain.getLastBlock().then(lb => {
        if (bh > lb.height) {
          var err = {
            error: 'Bad Request',
            message: 'Invalid block height'
          }
          return h.response(err).code(400);
        } else {
          return blockchain.getBlock(bh);
        }
      });
      // return `Hello, ${encodeURIComponent(bh)}`;
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
    handler: (request, h) => {
      console.log('in post handler with data: ' + JSON.stringify(request.payload.body)); 
      return new Promise((resolve) => { 
        blockchain.addBlock(new Block(request.payload.body)).then(height => {
          return blockchain.getBlock(height); 
        }).then(block => {
          resolve(block);
        });
      });
    }
  }
]);


const init = async () => {
  await server.start();
  console.log(`blockchain server running at: ${server.info.uri}`);
};

process.on('unhandledRejection',(err) => { 
  console.log(err);
});

init();

