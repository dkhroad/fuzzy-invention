'use strict;'


const Hapi = require('hapi');
const Joi = require('joi');
const api = require('./api');

const server = Hapi.server({
  port: 8000,
  host: 'localhost'
});




const init = async () => {
  await server.register(api);
  await server.start();
  console.log(`blockchain server running at: ${server.info.uri}`);
};

process.on('unhandledRejection',(err) => { 
  console.log(err);
});

init();

module.exports = server;
