const { network, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
require("dotenv").config();

const BASE_FEE = ethers.parseEther("0.25"); //最低费用 详情见 https://docs.chain.link/vrf/v2/subscription/supported-networks/#sepolia-testnet
const GAS_PRICE_FEE= 1e9 ; // 最高价格 防止 ETH价格飙升 10000000000

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    //获取部署人
    const { deployer } = await getNamedAccounts();

    if (developmentChains.includes(network.name)) {
        log("local network detected! Deploying mocks....")
        // constructor(uint96 _baseFee, uint96 _gasPriceLink)
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: [BASE_FEE, GAS_PRICE_FEE]
        });
        log("Deployed mocks....");
        log("-------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"];