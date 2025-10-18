export const MockMintableTokenAbi = [
  { "inputs": [
      {"internalType":"string","name":"_name","type":"string"},
      {"internalType":"string","name":"_symbol","type":"string"},
      {"internalType":"address","name":"_minter","type":"address"}
    ], "stateMutability":"nonpayable","type":"constructor" },
  { "inputs": [], "name": "name", "outputs": [{"internalType":"string","name":"","type":"string"}], "stateMutability":"view", "type":"function" },
  { "inputs": [], "name": "symbol", "outputs": [{"internalType":"string","name":"","type":"string"}], "stateMutability":"view", "type":"function" },
  { "inputs": [], "name": "decimals", "outputs": [{"internalType":"uint8","name":"","type":"uint8"}], "stateMutability":"view", "type":"function" },
  { "inputs": [{"internalType":"address","name":"","type":"address"}], "name": "balanceOf", "outputs": [{"internalType":"uint256","name":"","type":"uint256"}], "stateMutability":"view", "type":"function" },
  { "inputs": [ {"internalType":"address","name":"to","type":"address"}, {"internalType":"uint256","name":"amount","type":"uint256"} ], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

