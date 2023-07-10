# fx15127-final-project
fx15127-final-project

# Prerequisite
- Ganache (https://www.trufflesuite.com/ganache) for Running local Ethereum network
- NodeJS (https://nodejs.org/en/) for build, test, and running Frontend application
- Truffle (https://www.trufflesuite.com/truffle) for compile and deploy Smart contract
- Metamask Chrome's extension for manage accounts and transations. 

## Truffle configuration
Truffle environment is located in `truffle` directory, with predefined configures (`truffle-config.js`):
  - Development network (using Ganache):
    - Host: 127.0.0.1 (aka `localhost`)
    - Port: 7545
    - Network Id: 5777
  - Compiled Contracts Directory: `../contracts/` which is shared between `frontend` (Dapps) and `truffle`
  - Complilers version: `^0.4.26`

You can change those configurations, and included it to your submission.

## Ganache configuration

Ganache's workspace should be created based on `truffle-config.js`.

Double check the RPC Address, Port and Network ID matching with Truffle config.

## MetaMask configuration

Add new Network by selecting `Custom RPC` with corresponding RPC Address, Port and Network ID.

Import user by input Private Key from Ganache.

# Deploy and Configure Frontend

Use truffle to complie and deploy the Main Contract.
Replace the Main Contract Address in `config.js` with new deployed address.

Execute `npm start` to run frontend.

# Frontend Development Guideline

All function connecting with Smart contract are located in `index.js` with `TODO:` prefix. 

# Custom Note:
- Install `yarn install`
- cd to `truffle` folder `truffle migrate`, copy smart contract address deploy.
- Update smart contract address to `mainContract` in `config.js` file.
- Run `yarn start`
- App url `http://localhost:1234`
- Unit Test:
```
cd truffle
truffle test ./test/main.js
truffle test ./test/session.js
```
- Debug: Connect local to Remix IDE (install remixd https://www.npmjs.com/package/@remix-project/remixd): 
```
cd truffle/
remixd -s ./ -u https://remix.ethereum.org
```
