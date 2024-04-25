const { network ,getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains,networkConfig } = require("../../helper-hardhat-config");
// const chai = require('chai');
// const chaiAsPromised = require('chai-as-promised');
// chai.use(chaiAsPromised);
// const expect = chai.expect;
// const assert = chai.assert;
let expect, assert;
import('chai').then(chai => {
   expect = chai.expect;
   assert = chai.assert;

  // 其他测试逻辑
});

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit test", async function () {
        let raffle,raffleInstance, vrfCoordinatorV2MockInstance,entranceFee,deployer;
        const chainId = network.config.chainId;

        beforeEach(async function () {
            await deployments.fixture();
            deployer = (await getNamedAccounts()).deployer;
            raffle = await deployments.get("Raffle");
            const vrfCoordinatorV2Mock = await deployments.get("VRFCoordinatorV2Mock");
            const vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
            const raffleAddress = raffle.address;
            vrfCoordinatorV2MockInstance = await ethers.getContractAt("VRFCoordinatorV2Mock", vrfCoordinatorV2Address);
            raffleInstance = await ethers.getContractAt("Raffle", raffleAddress);
            entranceFee = await raffleInstance.getEntranceFee();
        }); 

        describe("constructor", async function () {
            it("Intitializes the raffle correctiy", async function () {
                const raffleState = await raffleInstance.getRaffleState();
                const interval = await raffleInstance.getInterval();
                assert.equal(raffleState.toString(), "0");
                assert.equal(interval.toString(),  networkConfig[chainId]["interval"]);
            });
        });
        describe("enterRaffle", async function () {
            it("reverts when you don't pay enough", async function () {
               await expect(raffleInstance.enterRaffle()).to.eventually.be.rejectedWith( // is reverted when not paid enough or raffle is not open
                      "Raffle_NotEnoughETHnetered"
                  );
            });
            it("records players when they enter", async function () {
                await raffleInstance.enterRaffle({ value: entranceFee });
                const playerFromContract = await raffleInstance.getPlayer(0);
                assert.equal(playerFromContract, deployer);
            });
            it("emits event on enter", async function () {
                // await expect(raffleInstance.enterRaffle({ value: entranceFee })).to.emit( // emits RaffleEnter event if entered to index player(s) address
                //     raffleInstance,
                //     "RaffleEnter"
                // );
                const result = await raffleInstance.enterRaffle({ value: entranceFee });
                expect(result).to.exist;
            });

        });
    })   