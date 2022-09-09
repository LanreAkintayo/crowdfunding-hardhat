require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();
require("solidity-coverage");
require("hardhat-deploy");

const MNEMONIC = process.env.MNEMONIC;
const TESTNET_URL = process.env.TESTNET_URL
const BSC_URL = process.env.BSC_URL
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.9",
      },
      {
        version: "0.7.0",
      },
    ],
  },
  networks: {
    localhost: {
      timeout: 100_000_000,
    },
    testnet: {
      url: TESTNET_URL,
      chainId: 97,
      gasPrice: 20000000000,
      blockConfirmations: 6,
      accounts: { mnemonic: MNEMONIC },
    },
    mainnet: {
      url: BSC_URL,
      chainId: 56,
      gasPrice: 20000000000,
      blockConfirmations: 6,
      accounts: { mnemonic: MNEMONIC },
    },
  },
  // etherscan: {
  //   apiKey: {
  //     testnet: BSCSCAN_API_KEY
  //   },
  //   customChains: [
  //     {
  //       network: "testnet",
  //       chainId: 97,
  //       urls: {
  //         apiURL: "https://api-testnet.bscscan.com",
  //         browserURL: "https://testnet.bscscan.com"
  //       }
  //     }
  //   ]
  // },
  etherscan: {
    apiKey: BSCSCAN_API_KEY,
       customChains: [
      {
        network: "testnet",
        chainId: 97,
        urls: {
          apiURL: "https://api-testnet.bscscan.com",
          browserURL: "https://testnet.bscscan.com"
        }
      }
    ]
  },

  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  mocha: {
    timeout: 100000000,
  },
};
