// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

error Raffle__UpkeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 raffleState);
error Raffle_NotEnoughETHnetered();
error Raffle_TransferFailed();
error Raffle_NotOpen();

// 进入彩票竞选 （支付一些金额）
// 随机一名优胜者
// 智能合约 最少维护
/***
 * @notice 本合约旨在创建一个不可篡改的去中心化智能合约
 * @dev 实现了 chainlink VRF v2 以及 chainlink keepers
 */
contract Raffle is VRFConsumerBaseV2, AutomationCompatible {
    /**
     * @dev
     */
    enum RaffleState {
        OPEN,
        CALCULATING,
        CLOSED
    }

    //最低价格
    uint256 private immutable i_entranceFee;
    //玩家
    address payable[] private s_players;

    address private s_recentWinter;
    //喂价
    VRFCoordinatorV2Interface i_vrfCoordinator;
    //最大gas费
    bytes32 private immutable i_gasLane;
    uint64 private immutable s_subscriptionId;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    // 合约奖池状态
    uint256 private s_state;
    RaffleState private s_raffleState;
    //最新block时间
    uint256 private s_lastTimeStamp;
    // 每次奖金领取时间间隔
    uint256 private immutable i_interval;

    //事件 命名与函数相反
    event RaffleEnter(address indexed player);
    event RandowWinnerPick(uint256 indexed requestId);
    event RandomWordsFulfill(address indexed winner);

    constructor(
        address vrfCoordinatorV2, // 合约地址
        uint256 entranceFee,
        bytes32 gasLane,
        uint64 subscriptionId,
        uint32 callbackGasLimit,
        uint256 interval
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_entranceFee = entranceFee;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        s_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_raffleState = RaffleState.OPEN;
        s_lastTimeStamp = block.timestamp;
        i_interval = interval;
    }

    function enterRaffle() public payable {
        // 钱包余额必须大于最低设定值
        if (msg.value < i_entranceFee) {
            revert Raffle_NotEnoughETHnetered();
        }
        if (s_raffleState != RaffleState.OPEN) {
            revert Raffle_NotOpen();
        }
        s_players.push(payable(msg.sender));
        //触发合约事件
        emit RaffleEnter(msg.sender);
    }

    //获取随机赢家
    // external 外部函数可以从合约外部调用，但不能从合约内部调用或者被其他合约继承。
    function performUpkeep(bytes calldata /* performData */) external override {
        //请求随机数
        // chainlink VRF
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert Raffle__UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_raffleState)
            );
        }
        s_raffleState = RaffleState.CALCULATING;
        uint256 requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            s_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        //触发事件
        emit RandowWinnerPick(requestId);
    }

    // 从 chainlink 获取随机数并返回
    // internal：只能从当前合约内部或继承的合约中访问。
    function fulfillRandomWords(
        uint256 /*requestId*/,
        uint256[] memory randomWords
    ) internal override {
        //从参加用户数据获取随机值
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinter = s_players[indexOfWinner];
        s_recentWinter = recentWinter;
        s_raffleState = RaffleState.OPEN;
        s_players = new address payable[](0);
        //获取游戏赢家后进行转账交易
        (bool success, ) = recentWinter.call{value: address(this).balance}("");
        //判断交易是否成功
        if (!success) {
            revert Raffle_TransferFailed();
        }
        //触发事件
        emit RandomWordsFulfill(s_recentWinter);
    }

    /**
     * @dev 正确使用到 chainlink 维护合约定时任务-- 是否触发优胜者
     * 1 : 时间间隔处理方式
     * 2 ：合约系统中至少有一位玩家并且有 eth
     * 3 ： 订阅中注入了 link资金
     * 4 ： 我们合约奖池应该是处于开启状态
     */
    function checkUpkeep(
        bytes memory /* checkData */
    ) public view override returns (bool upkeepNeeded, bytes memory /* performData */) {
        // We don't use the checkData in this example. The checkData is defined when the Upkeep was registered.
        bool isOpen = (RaffleState.OPEN == s_raffleState);
        bool timePassed = (block.timestamp - s_lastTimeStamp) > i_interval;
        bool hasPlayers = (s_players.length > 0);
        bool hasBalane = address(this).balance > 0;
        upkeepNeeded = (isOpen && timePassed && hasBalane && hasPlayers);
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }

    function getRecentWinter() public view returns (address) {
        return s_recentWinter;
    }

    function getRaffleState() public view returns (RaffleState) {
        return s_raffleState;
    }

    // 常量读取 用 prue关键字
    function getNumWords() public pure returns (uint32) {
        return NUM_WORDS;
    }

    function getRequestConfirmatison() public pure returns (uint256) {
        return REQUEST_CONFIRMATIONS;
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }

    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }
}
