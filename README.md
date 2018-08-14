# Blockchain Data

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

- Use NPM to initialize your project and create package.json to store project dependencies.
```
npm init
```
- Install crypto-js with --save flag to save dependency to our package.json file
```
npm install crypto-js --save
```
- Install level with --save flag
```
npm install level --save
```

## Testing

The following command runs the tests from the file `simpleChainTest.js`
```
npm test
```

simpleChainTest.js files contains same tests as suggested in the
original testing instructions below with the following minor modifications.

  * In order to avoid manually copy the test code in the nodejs repl, 
    it is consistent and less error prone run tests from a file.
  * Running these tests from a file actually uncovered a few race
    condition bugs that are not evident when test code is manually 
    copied in the repl. The reason being asynchronous nature all get/put calls
    to the persistent storage. 
  * Running tests from a file, required one minor change to `validateChain`
    method. It returns the corrupt blocks in a set as a resolved promise argument
    as show below.

   ```
        blockchain.validateChain()
          .then(errorLog => {
            if (errorLog.size>0) {
              console.log('Block errors = ' + errorLog.size);
              console.log('Blocks: ', errorLog);
            } else {
              console.log('*No errors detected*');
            }
          })

   ```
### Original Testing Instructions

To test code:
1: Open a command prompt or shell terminal after install node.js.
2: Enter a node session, also known as REPL (Read-Evaluate-Print-Loop).
```
node
```
3: Copy and paste your code into your node session
4: Instantiate blockchain with blockchain variable
```
let blockchain = new Blockchain();
```
5: Generate 10 blocks using a for loop
```
for (var i = 0; i <= 10; i++) {
  blockchain.addBlock(new Block("test data "+i));
}
```
6: Validate blockchain
```
blockchain.validateChain();
```
7: Induce errors by changing block data
```
let inducedErrorBlocks = [2,4,7];
for (var i = 0; i < inducedErrorBlocks.length; i++) {
  blockchain.chain[inducedErrorBlocks[i]].data='induced chain error';
}
```
8: Validate blockchain. The chain should now fail with blocks 2,4, and 7.
```
blockchain.validateChain();
```
