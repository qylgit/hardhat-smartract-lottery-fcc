const { network, ethers } = require("hardhat");
const { developmentChains, networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
require("dotenv").config();


module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    //获取部署人
    const { deployer } = await getNamedAccounts();

    const chainId = network.config.chainId;
    let vrfCoordinatorV2Address, subscriptionId,vrfCoordinatorV2MockInstance;

    const VRF_FUND_AMOUNT = ethers.parseEther("30");
    if (developmentChains.includes(network.name)) {
        
        const vrfCoordinatorV2Mock = await deployments.get("VRFCoordinatorV2Mock","bytecode");
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;

        vrfCoordinatorV2MockInstance = await ethers.getContractAt("VRFCoordinatorV2Mock", vrfCoordinatorV2Address);
        //创建一个定时任务  同理 https://vrf.chain.link/ 页面创建
        const transactionResponse = await vrfCoordinatorV2MockInstance.createSubscription();
        const transactionReceipt = await transactionResponse.wait(1);
        // 从交易收据中获取事件日志
        const logs = transactionReceipt.logs;
        for (const log of logs) {
            const parsedLog = vrfCoordinatorV2MockInstance.interface.parseLog(log);
            if (parsedLog.name === "SubscriptionCreated") {
                subscriptionId = parsedLog.args.subId;
                console.log("SubId:", subscriptionId.toString());
                break;
            }
        }
        await vrfCoordinatorV2MockInstance.fundSubscription(subscriptionId,VRF_FUND_AMOUNT);
         log("-------------------------");
        await vrfCoordinatorV2MockInstance.addConsumer(
            subscriptionId,
            vrfCoordinatorV2Address
        );
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoorinatorV2"];
        
    }
    /**
     * 
    constructor(
        address vrfCoordinatorV2, // 合约地址
        uint256 entranceFee,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 interval
    )
     */
    const entranceFee = networkConfig[chainId]["entranceFee"];
    const gasLane = networkConfig[chainId]["gasLane"];
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"];
    
    const interval = networkConfig[chainId]["interval"];
    const args = [vrfCoordinatorV2Address, entranceFee, gasLane, subscriptionId, callbackGasLimit, interval];
    const raffle = await deploy("Raffle", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    await vrfCoordinatorV2MockInstance.addConsumer(ethers.toNumber(subscriptionId), raffle.address)
    log("adding consumer...")
    log("Consumer added!")
    if (!developmentChains.includes(network.name) && process.env.ETHVERIFY_API_KEY) {
        log("Verifying...")
        await verify(raffle.address, args);
    }
    log("------------------------");
}

module.exports.tags = ["all","raffle"]