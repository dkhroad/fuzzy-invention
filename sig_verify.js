const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');

module.exports.verify = (message,address,signature) => { 
  return bitcoinMessage.verify(message,address,signature);
}

module.exports.sign = (privateKey,message) => {
  let keyPair = bitcoin.ECPair.fromWIF(privateKey);
  let signature = bitcoinMessage.sign(message,keyPair.privateKey, keyPair.compressed);
  let signature_b64 = signature.toString('base64');
  return signature_b64;
}

