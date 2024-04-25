const { ethers } = require("hardhat");

const networkConfig = { 
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        vrfCoorinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
        entranceFee: ethers.parseEther("0.01"),
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        subscriptionId: "0",
        callbackGasLimit: "500000",
        interval: "30"
    },
    
    31337: {
        name: "hardhat",
        // ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
        // vrfCoorinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
        entranceFee: ethers.parseEther("0.01"),
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c",
        subscriptionId: "0",
        callbackGasLimit: "500000",
        interval: "30"
    },
    // 300: {
    //     name: "zkSync",
    //     ethUsdPriceFeed: "0xfEefF7c3fB57d18C5C6Cdd71e45D2D0b4F9377bF"
    // },
    // 59144: {
    //     name: "linea",
    //     ethUsdPriceFeed: "0xfEefF7c3fB57d18C5C6Cdd71e45D2D0b4F9377bF"
    // }
}
const developmentChains = ["hardhat", "localhost","31337"];
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER
}