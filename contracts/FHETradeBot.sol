// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, eaddress, euint64, externalEaddress, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

interface IMintableERC20 {
    function mint(address to, uint256 amount) external;
}

contract FHETradeBot is ZamaEthereumConfig {
    struct Order {
        // Encrypted fields
        eaddress encToken;
        euint64 encAmount;
        // Plaintext meta
        uint256 executeAt;
        address buyer;
        bool executed;
    }

    address public immutable owner;
    address public bot; // bot address allowed to decrypt and execute
    uint256 public nextOrderId;

    // Simulated market price per unit (wei per token unit)
    uint256 public pricePerUnitWei = 1;

    mapping(uint256 => Order) private _orders; // orderId -> Order
    mapping(address => uint256) public deposits; // user -> ETH balance

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event OrderPlaced(uint256 indexed orderId, address indexed user, uint256 executeAt);
    event OrderExecuted(uint256 indexed orderId, address indexed user, address token, uint256 amount, uint256 costWei);
    event BotUpdated(address indexed bot);
    event PriceUpdated(uint256 pricePerUnitWei);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyBot() {
        require(msg.sender == bot, "Not bot");
        _;
    }

    constructor(address botAddress) {
        owner = msg.sender;
        bot = botAddress;
        emit BotUpdated(botAddress);
    }

    // ============ Funds management ============

    function deposit() external payable {
        require(msg.value > 0, "No ETH sent");
        deposits[msg.sender] += msg.value;
        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "Zero amount");
        require(deposits[msg.sender] >= amount, "Insufficient balance");
        deposits[msg.sender] -= amount;
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "Withdraw failed");
        emit Withdrawn(msg.sender, amount);
    }

    // View method must not rely on msg.sender to fetch state
    function getDeposit(address user) external view returns (uint256) {
        return deposits[user];
    }

    // ============ Order lifecycle ============

    function placeOrder(
        externalEaddress inputEncToken,
        externalEuint64 inputEncAmount,
        bytes calldata inputProof,
        uint256 executeAt
    ) external returns (uint256 orderId) {
        require(executeAt > block.timestamp, "Invalid time");

        eaddress encToken = FHE.fromExternal(inputEncToken, inputProof);
        euint64 encAmount = FHE.fromExternal(inputEncAmount, inputProof);

        // ACL: allow contract and bot to access
        FHE.allowThis(encToken);
        FHE.allow(encToken, bot);

        FHE.allowThis(encAmount);
        FHE.allow(encAmount, bot);

        orderId = ++nextOrderId;
        _orders[orderId] = Order({
            encToken: encToken,
            encAmount: encAmount,
            executeAt: executeAt,
            buyer: msg.sender,
            executed: false
        });

        emit OrderPlaced(orderId, msg.sender, executeAt);
    }

    function getOrderMeta(uint256 orderId)
        external
        view
        returns (address buyer, uint256 executeAt, bool executed)
    {
        Order storage o = _orders[orderId];
        return (o.buyer, o.executeAt, o.executed);
    }

    function getOrderCiphertexts(uint256 orderId)
        external
        view
        returns (eaddress encToken, euint64 encAmount)
    {
        Order storage o = _orders[orderId];
        return (o.encToken, o.encAmount);
    }

    // Bot passes decrypted values and we perform simulated market mint
    function executeOrder(
        uint256 orderId,
        address token,
        uint256 amount
    ) external onlyBot {
        Order storage o = _orders[orderId];
        require(!o.executed, "Already executed");
        require(o.executeAt <= block.timestamp, "Too early");

        // cost = amount * price
        uint256 cost = amount * pricePerUnitWei;
        require(deposits[o.buyer] >= cost, "Insufficient deposit");

        // charge user
        deposits[o.buyer] -= cost;

        // simulate market purchase via mint
        IMintableERC20(token).mint(o.buyer, amount);
        o.executed = true;

        emit OrderExecuted(orderId, o.buyer, token, amount, cost);
    }

    // ============ Admin ============
    function setBot(address botAddress) external onlyOwner {
        bot = botAddress;
        emit BotUpdated(botAddress);
    }

    function setPricePerUnitWei(uint256 newPrice) external onlyOwner {
        pricePerUnitWei = newPrice;
        emit PriceUpdated(newPrice);
    }
}

