const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');

module.exports.verify = (message,address,signature) => { 
  return bitcoinMessage.verify(message,address,signature);
}

module.exports.sign = (privateKey,message) => {
  let keyPair = bitcoin.ECPair.fromWIF(privateKey);
  var signature = bitcoinMessage.sign(message,key.privateKey, keyPair.compress);
  return signature.toString('base64');
}

