const { network ,getNamedAccounts, deployments, ethers } = require("hardhat");
const { developmentChains,networkConfig } = require("../../helper-hardhat-config");
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const assert = chai.assert;

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit test", async function () {
        let raffleInstance,
            vrfCoordinatorV2MockInstance,
            vrfCoordinatorV2Address,
            entranceFee,
            deployer,
            interval;
        
        const chainId = network.config.chainId;

        beforeEach(async function () {
            await deployments.fixture(["mocks", "raffle"]);
            deployer = (await getNamedAccounts()).deployer;
            const raffle = await deployments.get("Raffle");
            const vrfCoordinatorV2Mock = await deployments.get("VRFCoordinatorV2Mock");
            vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
            const raffleAddress = raffle.address;
            vrfCoordinatorV2MockInstance = await ethers.getContractAt("VRFCoordinatorV2Mock", vrfCoordinatorV2Address);
            raffleInstance = await ethers.getContractAt("Raffle", raffleAddress);
            entranceFee = await raffleInstance.getEntranceFee();
            interval = await raffleInstance.getInterval();

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
                const result = await raffleInstance.enterRaffle({ value: entranceFee });
                expect(result).to.exist;
            });

            it("donest allow entrance when raffle is calculating", async function () {
                await raffleInstance.enterRaffle({ value: entranceFee });
                const intervalNmuber = ethers.toNumber(interval) + 1; 
                await network.provider.send("evm_increaseTime", [intervalNmuber]);
                //进行挖下个区块
                await network.provider.send("evm_mine", []);
                //Perform upkeep to put the contract into CALCULATING state
                
                await raffleInstance.performUpkeep("0x");
                await expect(raffleInstance.enterRaffle({ value: entranceFee })).to.eventually.be.rejectedWith( // is reverted when not paid enough or raffle is not open
                      "Raffle_NotOpen"
                  );
            });
        });
    })   