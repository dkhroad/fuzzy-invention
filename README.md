# RESTful Web API with hapijs Framework

This web service provides the following REST API for a private blockchain
using hapijs framework.
The app is configured to run on the localhost on port 8000

## API Endpoints 

1.Get a block at the given height: 

  GET /block/{BLOCK_HEIGHT}

  Returns a block at block height specified by parameter BLOCK_HEIGHT.
  The block content is returned in JSON format.
  If BLOCK_HEIGHT is invalid, response 400 will be returned.

2. Create a new block using 

  POST /block
  Content-Type: application/json
  Request body: {"body": "block body content"}

  Creates a new block in the blockchain. Request body must contains the 
  key 'body' with the value with which a new block is to be created.

  Return the content of newly created block in JSON format.

See the [testing section](#Testing)  for usage details.

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
- (crypto-js)[https://github.com/brix/crypto-js]
- (nodejs leveldb wrapper)[https://github.com/Level/level]
- (hapijs framework)[https://hapijs.com]
-

## Running The Server

`node index.js`

Runs the web service on the localhost on port 8000

## Testing

The web-service can be tested using `curl` command.

1. GET /block/{BLOCK_HEIGHT}

    * Request:
    ```
    curl   http://localhost:8000/block/31
    ```

    * Response:

    ```
    {"hash":"3e4fbeeb487c3e8c7b49b49073e01e85246166e5a1c08fd6cf7be369fb3db4c4","height":31,"body":"Testi
    block with test string
    data","time":"1536026335","previousBlockHash":"cecfd2273fe562af0c766832c314741ea28e8689c6f802f115c0e
    ```

2. POST /block
   Content-Type: application/json
   Request body: {"body": "block body content"}


  * Request:
  ```
  curl -X "POST" "http://localhost:8000/block" \
       -H 'Content-Type: application/json' \
       -d $'{
    "body": "Testing block with test string data"
  }'
  ```

  * Response:
  ```
  {"hash":"3f66086da32e814411c1cba0c0d86e1e26d07fcb621b78984c6061f60bcfdbf9","height":32,"body":"Testig block with test string data","time":"1536026396","previousBlockHash":"3e4fbeeb487c3e8c7b49b49073e01e85246166e5a1c08fd6cf7be"}
  ```

