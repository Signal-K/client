//require("@nomicfoundation/hardhat-toolbox")
require(`@nomiclabs/hardhat-waffle`);

const INFURA_API_KEY = process.env.WEB3_INFURA_PROJECT_ID;
const GOERLI_PRIVATE_KEY = process.env.PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.0',
    networks: {
      goerli: {
        url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
        accounts: [GOERLI_PRIVATE_KEY],
        chainID: 5,
      }
    }
  },
};