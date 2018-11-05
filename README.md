# A private blockchain based notary service

This web service allows users to notarize star ownership using their
blockchain identity.

Notarizing a star ownership requires the following steps: 

1. Verify a wallet address
2. Once a wallet is verified, user has the right to register a star.
3. Once registered, users will be able to lookup their start by hash, block height or 
   wallet address.

This web application provides the following REST APIs to the above mentioned steps.
The app is configured to run on the localhost on port 8000


## API End-Points

### 1. Submit User Request for Validation API -- *POST /requestValidation*

This API allows users to submit their request using a wallet address. The API accepts wallet
address (blockchain id) with a request for a star registration.

The user's wallet address with be stored with a timestamp. The timestamp is used to time wall
the user request for star registration. 

In the event the time expires, the address is removed from the validation routine forcing the user
to restart the proces. The validation window is limited to 5 minutes. When resubmitting within 
validation window, the validation window will reduce until it expires. 
  
The post should be made with payload in JSON format containing your wallet address in the following format.

   ```
   { 
      "address": <your wallet address> 
   }
   ```

   After submitting a request, the application returns a response in JSON format with a message
   to sign in order to prove their blockchain identity.Here is an example of such a response.

#### Example

  **Request:** 

   ```
    curl -X "POST" "http://localhost:8000/requestValidation" \
   -H 'Content-Type: application/json; charset=utf-8' \
   -d $'{
           "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ"
    }'
   ```
  **Response:**
  
  ```
  {
  "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
  "requestTimeStamp": "1532296090",
  "message": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532296090:starRegistry",
  "validationWindow": 300
  }
  ```

### 2. User Request Validation API -  *POST /message-signature/validate*

After receiving a response from the previous API, user must sign the message (specified
by the `message` key in the JSON response) using their private key. After signing the message,
user makes a POST request to `/message-signature/validate` API end-point to have their request
validated (by proving the ownership of the wallet address). 

The payload delivered by the user requires the following fields:

  * Wallet address
  * Message signature. 


The APIs returns a JSON response indicating if message signature is valid or invalid. 

#### Example 

  *Request:*

  ```
  curl -X "POST" "http://localhost:8000/message-signature/validate" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
            "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
            "signature": "H6ZrGrF0Y4rMGBMRT2+hHWGbThTIyhBS0dNKQRov9Yg6GgXcHxtO9GJN4nwD2yNXpnXHTWU9i+qdw5vpsooryLU="
  }'
  ```

  *Response:*

  ```
  {
  "registerStar": true,
  "status": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "requestTimeStamp": "1532296090",
    "message": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ:1532296090:starRegistry",
    "validationWindow": 193,
    "messageSignature": "valid"
  }
  }
  ```

### 3. Star Registration API - *POST /block*

If a validation request is successful, the user can register a star using the star
registration API. The HTTP post payload in JSON format must have the following properties.

  * "address" - A verified wallet address
  * "star" - star object with the following properties:
    * "dec": declination
    * "ra":  right ascension
    * "mag": magnitude (optional)
    * "cons": constellation (optional) 
    * "story": star story limited to 250 words.
    
On a successful registration, this API adds this star registration information to the blockchain and return 
the block information in JSON format.

#### Example

  *Request:*

  ```
  curl -X "POST" "http://localhost:8000/block" \
     -H 'Content-Type: application/json; charset=utf-8' \
     -d $'{
           "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
           "star": {
              "dec": "-26° 29' 24.9",
              "ra": "16h 29m 1.0s",
              "story": "Found star using https://www.google.com/sky/"
            }
        }'
  ```

  *Response:*

  ```
  {
  "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
  "height": 1,
  "body": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "star": {
      "ra": "16h 29m 1.0s",
      "dec": "-26° 29' 24.9",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
    }
  },
  "time": "1532296234",
  "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
  }
  ```

### 4. Star Lookup APIs

This API provides the option to search for a registered star by:

  * Blockchain wallet address - `GET /stars/address:[ADDRESS]`
  * Star block hash - `GET /stars/hash:[HASH]`
  * Star block height - `GET /block/[HEIGHT]`

#### Examples

##### Search by Blockchain wallet address

  *Request:* 

  ```
  curl "http://localhost:8000/stars/address:142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ"
  ```

  *Response:* 
  ```
  [
  {
    "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
    "height": 1,
    "body": {
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
      "star": {
        "ra": "16h 29m 1.0s",
        "dec": "-26° 29' 24.9",
        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
        "storyDecoded": "Found star using https://www.google.com/sky/"
      }
    },
    "time": "1532296234",
    "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
  },
  {
    "hash": "6ef99fc533b9725bf194c18bdf79065d64a971fa41b25f098ff4dff29ee531d0",
    "height": 2,
    "body": {
      "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
      "star": {
        "ra": "17h 22m 13.1s",
        "dec": "-27° 14' 8.2",
        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
        "storyDecoded": "Found star using https://www.google.com/sky/"
      }
    },
    "time": "1532330848",
    "previousBlockHash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f"
  }
  ]
  ```

##### Search by star block hash

  *Request:*

  ```
  curl "http://localhost:8000/stars/hash:a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f"
  ````

  *Response:* 

  ```
  {
  "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
  "height": 1,
  "body": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "star": {
      "ra": "16h 29m 1.0s",
      "dec": "-26° 29' 24.9",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
      "storyDecoded": "Found star using https://www.google.com/sky/"
    }
  },
  "time": "1532296234",
  "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
  }
  ```

##### Search by star block height

  *Request:*

  ```
  curl "http://localhost:8000/block/1"
  ```

  *Response:*

  ```
  {
  "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
  "height": 1,
  "body": {
    "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
    "star": {
      "ra": "16h 29m 1.0s",
      "dec": "-26° 29' 24.9",
      "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
      "storyDecoded": "Found star using https://www.google.com/sky/"
    }
  },
  "time": "1532296234",
  "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
  }
  ```


## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

- Use NPM to initialize your project and install the necessary dependencies.
```
npm install  
```

This will install the following package dependencies: 
- [crypto-js](https://github.com/brix/crypto-js)
- [ nodejs leveldb wrapper ]( https://github.com/Level/level )
- [ hapijs framework ]( https://hapijs.com )

## Running The Server

`node index.js`

Runs the web service on the localhost on port 8000

## Testing

The web-service functionality can be tested using `curl` command examples 
shown in the [API section above](#API End-Points). You will have to provide a valid wallet 
address, and must sign the message with your own key. 

BDD based unit tests are implemented in the test directory using 
[ lab testing framework ](https://github.com/hapijs/lab) and using [code assertion library](https://github.com/hapijs/code). To run these tests, type `npm test` from the root directory of the project.

Note that there is a bug in the testing code (most likely related to hapijs server cleanup), that may cause the `npm test` command to hang. In that case running the tests separately should work fine.

* To test Memory pool functionality: run `./node_modules/.bin/lab -v   test/mempool_test.js`
* To test core Blockchain functionalit: run `./node_modules/.bin/lab -v  test/simple_chain_test.js`
* To test request validation: run `./node_modules/.bin/lab -v   test/notary_svc_test.js`
* To test star registration: run `./node_modules/.bin/lab -v  test/star_registration_svc_test.js`
* To test star lookup: run `./node_modules/.bin/lab -v   test/star_lookup_svc_test.js`
* To test signature verification testing: run `./node_modules/.bin/lab    -v   ./test/sig_verify_test.js`
