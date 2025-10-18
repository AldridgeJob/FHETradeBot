export const FHETradeBotAbi = [
  { "inputs": [{"internalType":"address","name":"botAddress","type":"address"}], "stateMutability":"nonpayable", "type":"constructor" },
  { "inputs": [], "name": "bot", "outputs": [{"internalType":"address","name":"","type":"address"}], "stateMutability":"view", "type":"function" },
  { "inputs": [], "name": "nextOrderId", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability":"view", "type":"function" },
  { "inputs": [], "name": "owner", "outputs": [{"internalType":"address","name":"","type":"address"}], "stateMutability":"view", "type":"function" },
  { "inputs": [], "name": "pricePerUnitWei", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability":"view", "type":"function" },
  { "inputs": [], "name": "deposit", "outputs": [], "stateMutability": "payable", "type": "function" },
  { "inputs": [{"internalType":"uint256","name":"amount","type":"uint256"}], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"internalType":"address","name":"user","type":"address"}], "name": "getDeposit", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability": "view", "type": "function" },
  { "inputs": [
      {"internalType":"externalEaddress","name":"inputEncToken","type":"bytes32"},
      {"internalType":"externalEuint64","name":"inputEncAmount","type":"bytes32"},
      {"internalType":"bytes","name":"inputProof","type":"bytes"},
      {"internalType":"uint256","name":"executeAt","type":"uint256"}
    ],
    "name": "placeOrder",
    "outputs": [{"internalType":"uint256","name":"orderId","type":"uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  { "inputs": [{"internalType":"uint256","name":"orderId","type":"uint256"}], "name": "getOrderMeta", "outputs": [
      {"internalType":"address","name":"buyer","type":"address"},
      {"internalType":"uint256","name":"executeAt","type":"uint256"},
      {"internalType":"bool","name":"executed","type":"bool"}
    ], "stateMutability": "view", "type": "function" },
  { "inputs": [{"internalType":"uint256","name":"orderId","type":"uint256"}], "name": "getOrderCiphertexts", "outputs": [
      {"internalType":"eaddress","name":"encToken","type":"bytes32"},
      {"internalType":"euint64","name":"encAmount","type":"bytes32"}
    ], "stateMutability": "view", "type": "function" },
  { "inputs": [
      {"internalType":"uint256","name":"orderId","type":"uint256"},
      {"internalType":"address","name":"token","type":"address"},
      {"internalType":"uint256","name":"amount","type":"uint256"}
    ],
    "name": "executeOrder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  { "inputs": [{"internalType":"address","name":"botAddress","type":"address"}], "name": "setBot", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"internalType":"uint256","name":"newPrice","type":"uint256"}], "name": "setPricePerUnitWei", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

