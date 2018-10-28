'use strict;'


const Hapi = require('hapi');
const api = require('./api');
const { BlockchainFactory } = require('./simpleChain.js');
const { MemPool } = require('./mempool.js');
const server = Hapi.server({
  port: 8000,
  host: 'localhost'
});




const init = async () => {
  try {
  console.log('In server init');
  blockchain =  await BlockchainFactory.create();
  mempool = new MemPool();
  console.log('registering plugins....');
  await server.register([{
    plugin: api,
    options: {blockchain: blockchain}
  }, {
    plugin: require('./notary_svc'),
    options: {blockchain: blockchain,mempool: mempool}
  }]);

  console.log('plugins registered');
  await server.start();
  console.log(`blockchain server running at: ${server.info.uri}`);
  } catch (err) {
    console.log("Error starting server", err);
  }
};

process.on('unhandledRejection',(err) => { 
  console.log(err);
});

init();

module.exports = server;
