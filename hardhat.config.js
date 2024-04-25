
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();

const SEPOLIA_RPC_URL =
  process.env.SEPOLIA_RPC_URL ||
  "https://eth-sepolia.g.alchemy.com/v2/RIKm0qgpqUxCbiaTwH2CWfrsSaUwmWSJ";
const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  "7a5caf4c131ddd7a988ba8f6e71c6fa6aa21d377c24a77ef57ad0777a77406ce";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "U8EX6UQTD5HZYSDU3UTZM87QUQHITHR1S2";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ""

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.7",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      blockConfirmations:1
    },
    sepolia: {
        url: SEPOLIA_RPC_URL,
        accounts: [PRIVATE_KEY],
        chainId: 11155111,
        blockConfirmations: 6,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
    // customChains: [], // uncomment this line if you are getting a TypeError: customChains is not iterable
  },
  namedAccounts:{
    deployer: {
      default: 0,
    },
    player:{
      default :1
    }
  },
};
