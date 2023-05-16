const Demo_Contract = artifacts.require("PlanetProposal");

module.exports = function(deployer) {
  deployer.deploy(Demo_Contract);
};