'use strict;'


const Hapi = require('hapi');
const api = require('./api');
const Glue = require('glue');
const { BlockchainFactory } = require('./simpleChain.js');
const { MemPool } = require('./mempool.js');


const _manifest = {
  server: {
      port: 8000,
      host: 'localhost'
  },
  register : {
    plugins: [
      {
        plugin: require('./api'),
      },
      {
        plugin: require('./notary_svc'),
      }
    ]
  }
}

const _options = {
  relativeTo: __dirname
};


const init = async (manifest=_manifest,options=_options) => {
  try {
    const server = await Glue.compose(manifest,options);
    server.app.mempool = new MemPool();
    server.app.blockchain = await BlockchainFactory.create();
    if (!module.parent) {
      await server.start();
      console.log(`blockchain server running at: ${server.info.uri}`);
    } 
    return server;
  } catch (err) {
      console.log("Error starting server", err);
  }
};

process.on('unhandledRejection',(err) => { 
  console.log(err);
});

if (!module.parent) {
  init()
}

module.exports = init;
