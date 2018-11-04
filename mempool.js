const {verify} = require('./sig_verify.js');
let _instance = null;

class MemPool {
  constructor(validationWindow=300) {
    if (_instance) {
      debugger;
      return _instance;
    }
    this.cache = {};
    this.validationWindow = validationWindow; // default= 5 minutes
    _instance = this;
  }

  // time remaining  in the validationWindow 
  timeRemaining(reqTimeStamp) {
    let endTime= reqTimeStamp + this.validationWindow;
    let now = parseInt(new Date().getTime()/1000);
    return (endTime - now)
  }

  timeInSeconds(tmsec) {
    return parseInt(tmsec/1000);
  }

  removeAddress(address) {
    console.log("WARNING: Validation window expired for address: " + address);
    delete this.cache[address];
  }

  inMemPool(address) {
    return this.cache.hasOwnProperty(address);
  }

  add(address) {
    let time = new Date().getTime(); 
    let req = { 
      registerStar: false,
      requestTimeStamp: this.timeInSeconds(time),
      validationWindow: this.validationWindow,
      messageSignature: "not_verified",
      message: address+':'+this.timeInSeconds(time)+':starRegistry',
      timeOut: setTimeout(() => {
        this.removeAddress(address)
      },this.validationWindow * 1000),
    }
    
    this.cache[address] = req;
    return {
      address: address,
      requestTimeStamp: req.requestTimeStamp,
      validationWindow: req.validationWindow,
      message: req.message
    }

  }

  stopTimer(address) {
    clearTimeout(this.cache[address].timeOut);
  }

  status(address) {
    if (!this.inMemPool(address)) {
      return null;
    }
   let req=this.cache[address];
    return { 
      address: address,
      messageSignature: req.messageSignature,
      validationWindow: this.timeRemaining(req.requestTimeStamp)
    }
  }

  validateSig(payload) {
    if (!this.inMemPool(payload.address)) {
      return null;
    }
    let address = payload.address;
    let req = this.cache[address];
    let sigVerified =  verify(req.message, payload.address, payload.signature);
    let validationWindow = this.timeRemaining(req.requestTimeStamp);
    req.registerStar =   validationWindow > 0 ? true : false;
    req.messageSignature =  sigVerified ? "valid" : "invalid"

    return {
      registerStar: req.registerStar,
      status: {
        address: address,
        requestTimeStamp: req.requestTimeStamp,
        message: req.message,
        validationWindow: validationWindow,
        messageSignature: req.messageSignature
      }
    }
  }
}
module.exports  = { MemPool };
