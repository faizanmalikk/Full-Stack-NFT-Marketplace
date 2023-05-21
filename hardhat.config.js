require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config()
require('hardhat-deploy');
require("@nomiclabs/hardhat-ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.7",
      },
      {
        version: "0.8.0",
      },
      {
        version: "0.6.6",
    },
    ],
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 31337,
      blockConfirmations: 1
    },
    sepolia: {
      url: process.env.RPC_UR,
      accounts: [
        process.env.PRIVATE_KEY,
      ],
      chainId: 11155111,
      blockConfirmations: 6
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_PRIVATE_KEY
  },
  gasReporter: {
    enabled: false,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: process.env.COINMARTKET_API_KEY
  },
  namedAccounts: {
    deployer: {
      default: 0
    },
  },
  mocha: {
    timeout: 500000, // 500 seconds max for running tests
  },
};
