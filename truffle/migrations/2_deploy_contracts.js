const Main = artifacts.require('Main');
const { config } = require('../../config');

module.exports = function(deployer) {
  deployer.deploy(Main, config.MAX_OF_PARTICIPANTS);
};
