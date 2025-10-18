# FHE Trade Bot

> A privacy-preserving automated trading platform powered by Fully Homomorphic Encryption (FHE)

[![License](https://img.shields.io/badge/license-BSD--3--Clause--Clear-blue.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/solidity-0.8.27-brightgreen.svg)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/hardhat-2.22.19-yellow.svg)](https://hardhat.org/)
[![React](https://img.shields.io/badge/react-19.1.1-blue.svg)](https://react.dev/)

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Why FHE Trade Bot?](#why-fhe-trade-bot)
- [Problems Solved](#problems-solved)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Smart Contracts](#smart-contracts)
- [Frontend Application](#frontend-application)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Deployment](#deployment)
- [Testing](#testing)
- [Custom Hardhat Tasks](#custom-hardhat-tasks)
- [Security Features](#security-features)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## 🔍 Overview

**FHE Trade Bot** is a cutting-edge blockchain application that revolutionizes automated trading by leveraging **Fully Homomorphic Encryption (FHE)** technology from Zama. The platform enables users to place encrypted token purchase orders that remain completely private until execution, preventing front-running attacks, MEV exploitation, and order book manipulation.

Traditional decentralized exchanges expose trading intentions through public transaction pools, allowing malicious actors to profit at the expense of legitimate traders. FHE Trade Bot solves this by encrypting both the target token address and purchase amount on-chain, ensuring complete privacy while maintaining blockchain transparency and trustlessness.

### How It Works

1. **Deposit**: Users deposit ETH into the smart contract as collateral
2. **Encrypt**: Token addresses and purchase amounts are encrypted using Zama's FHE SDK
3. **Submit**: Encrypted orders are submitted with a specified execution timestamp
4. **Store**: Smart contract stores encrypted data with strict access controls
5. **Execute**: When the execution time arrives, an authorized bot decrypts and executes the order
6. **Fulfill**: Tokens are purchased (via simulated minting) and transferred to the user
7. **Charge**: User's ETH deposit is charged for the transaction

## ✨ Key Features

### Privacy-First Trading
- **End-to-End Encryption**: Token addresses and amounts remain encrypted on-chain
- **Zero Knowledge**: No one can see your trading intentions before execution
- **MEV Protection**: Front-running and sandwich attacks become impossible
- **On-Chain Privacy**: All data lives on the blockchain but remains confidential

### Automated Execution
- **Time-Based Orders**: Schedule order execution for a specific timestamp
- **Bot-Executed**: Authorized bot automatically executes orders at the right time
- **Trustless**: Smart contract enforces all rules without intermediaries
- **Deposit System**: Pre-funded accounts enable instant order fulfillment

### Developer-Friendly
- **Full Stack Solution**: Complete smart contract + React frontend
- **Type-Safe**: Full TypeScript support with auto-generated contract types
- **Modern Web3**: Built with Wagmi, RainbowKit, Viem, and Ethers.js
- **Extensible**: Custom Hardhat tasks for easy testing and automation
- **Well-Tested**: Comprehensive test suite with 4,400+ lines of tests

### Production-Ready
- **Deployed on Sepolia**: Live testnet deployment for immediate testing
- **Gas Optimized**: Solidity optimizer enabled (800 runs)
- **Verified Contracts**: Etherscan verification support
- **Documentation**: Extensive code documentation and examples

## 🎯 Why FHE Trade Bot?

### The Problem with Traditional DEXs

Current decentralized exchanges suffer from several critical issues:

1. **Front-Running**: Bots monitor the mempool and place orders ahead of yours
2. **Sandwich Attacks**: Malicious actors place orders before and after yours to extract value
3. **Order Book Manipulation**: Large orders become visible before execution
4. **MEV Extraction**: Miners/validators reorder transactions for profit
5. **Privacy Leakage**: Trading strategies are exposed to competitors

### The FHE Trade Bot Solution

By encrypting trading data on-chain, FHE Trade Bot provides:

- **Confidential Orders**: No one knows what you're buying or how much
- **Fair Execution**: Orders execute at the intended time without interference
- **Protected Strategies**: Keep your trading logic private
- **Trustless Privacy**: No need to trust centralized parties
- **Blockchain Transparency**: Encrypted data is still verifiable and auditable

## 🔧 Problems Solved

### 1. Front-Running Prevention

**Problem**: Bots scan pending transactions and submit higher gas fees to execute first.

**Solution**: Encrypted orders prevent bots from knowing what token you're buying, making front-running impossible.

### 2. MEV Mitigation

**Problem**: Validators can reorder transactions to extract maximum value from traders.

**Solution**: Encrypted amounts prevent validators from understanding transaction value, eliminating MEV opportunities.

### 3. Order Privacy

**Problem**: Large orders on traditional DEXs cause slippage and price impact.

**Solution**: Orders remain hidden until execution, preventing market manipulation and adverse price movements.

### 4. Time-Based Execution

**Problem**: Manual trading requires constant monitoring and quick reactions.

**Solution**: Schedule orders for future execution, enabling automated trading strategies without revealing intentions.

### 5. Trustless Automation

**Problem**: Centralized trading bots require trusting third parties with funds.

**Solution**: Smart contract holds funds with cryptographic guarantees, bot only executes with user's pre-signed encrypted orders.

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                       │
│                    (React + RainbowKit)                      │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ Wagmi + Viem
                 │
┌────────────────▼────────────────────────────────────────────┐
│                    Ethereum Blockchain                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              FHETradeBot Contract                     │  │
│  │  - Encrypted Order Storage (eaddress, euint64)       │  │
│  │  - Deposit Management (ETH balances)                 │  │
│  │  - Access Control (FHE ACL)                          │  │
│  │  - Order Execution Logic                             │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │                                            │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │          MockMintableToken Contract                   │  │
│  │  - Simulates Token Market via Minting                │  │
│  │  - ERC20 Compatible                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                 ▲
                 │
                 │ Ethers.js
                 │
┌────────────────┴────────────────────────────────────────────┐
│                      Automated Bot                           │
│  - Monitors execution times                                  │
│  - Decrypts orders using Zama Relayer                       │
│  - Executes orders with decrypted values                    │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action → Encrypt with FHE → Submit to Contract → Store Encrypted
                                                            ↓
User Receives Tokens ← Transfer from Mock Market ← Bot Executes ← Decrypt at Execution Time
```

### Encryption Layer

FHE Trade Bot uses **Zama's FHEVM protocol** which provides:

- **eaddress**: Encrypted Ethereum addresses (160-bit)
- **euint64**: Encrypted unsigned integers (64-bit)
- **Access Control Lists (ACL)**: Fine-grained decryption permissions
- **Homomorphic Operations**: Compute on encrypted data without decryption

## 🛠️ Technology Stack

### Smart Contract Layer

| Technology | Version | Purpose |
|------------|---------|---------|
| **Solidity** | 0.8.27 | Smart contract language |
| **Hardhat** | 2.22.19 | Development environment |
| **@fhevm/solidity** | 0.8.0 | Zama's FHE library for Solidity |
| **@zama-fhe/oracle-solidity** | 0.1.0 | Oracle integration |
| **TypeChain** | 8.3.2 | TypeScript bindings generation |
| **Hardhat Deploy** | 0.11.45 | Deployment management |

### Frontend Layer

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | UI framework |
| **Vite** | 7.1.6 | Build tool and dev server |
| **TypeScript** | 5.8.3 | Type safety |
| **Wagmi** | 2.17.0 | React hooks for Ethereum |
| **RainbowKit** | 2.2.8 | Wallet connection UI |
| **Viem** | 2.37.6 | Ethereum library (read ops) |
| **Ethers.js** | 6.15.0 | Ethereum library (write ops) |
| **@zama-fhe/relayer-sdk** | 0.2.0 | FHE encryption SDK |
| **TanStack Query** | 5.89.0 | Server state management |

### Development & Testing

| Technology | Version | Purpose |
|------------|---------|---------|
| **Mocha** | 11.7.1 | Testing framework |
| **Chai** | 4.5.0 | Assertion library |
| **ESLint** | 8.57.1 | Code linting |
| **Prettier** | 3.6.2 | Code formatting |
| **Solhint** | 5.0.3 | Solidity linting |

## 📝 Smart Contracts

### FHETradeBot.sol

The main trading contract managing encrypted orders and fund deposits.

**Key Structures:**

```solidity
struct Order {
    eaddress encToken;     // Encrypted target token address
    euint64 encAmount;     // Encrypted purchase amount
    uint256 executeAt;     // Unix timestamp for execution
    address buyer;         // Order creator's address
    bool executed;         // Execution status flag
}
```

**Core Functions:**

| Function | Access | Description |
|----------|--------|-------------|
| `deposit()` | Public | Deposit ETH to fund future orders |
| `withdraw(uint256 amount)` | Public | Withdraw available ETH balance |
| `placeOrder(...)` | Public | Submit encrypted order with metadata |
| `executeOrder(...)` | Bot Only | Decrypt and execute order |
| `getDeposit(address user)` | View | Get user's ETH balance |
| `getOrderMeta(uint256 id)` | View | Get order metadata |
| `getOrderCiphertexts(uint256 id)` | View | Get encrypted ciphertexts (ACL protected) |
| `updateBotAddress(address)` | Owner Only | Change authorized bot |
| `updatePrice(uint256)` | Owner Only | Update execution fee |

**Access Control:**

- **Owner**: Can update bot address and pricing
- **Bot**: Can decrypt and execute orders
- **Users**: Can deposit, withdraw, and place orders
- **FHE ACL**: Governs who can decrypt encrypted values

**File Location**: `contracts/FHETradeBot.sol` (162 lines)

### MockMintableToken.sol

Simulates a token market by minting tokens instead of trading.

**Purpose**: In a production environment, this would be replaced with actual DEX integration (Uniswap, etc.). For demonstration, it mints new tokens to simulate purchases.

**Key Features:**

- ERC20-compatible token
- Mint function restricted to FHETradeBot contract
- Used to fulfill orders without real market interaction

**File Location**: `contracts/MockMintableToken.sol` (59 lines)

### FHECounter.sol

Example contract demonstrating basic FHE operations.

**Purpose**: Template showing encrypted counter increment/decrement operations. Useful for learning FHE concepts.

**File Location**: `contracts/FHECounter.sol` (46 lines)

## 🖥️ Frontend Application

### Component Structure

```
src/
├── components/
│   ├── TradeApp.tsx          # Main trading interface
│   └── Header.tsx            # Navigation header
├── hooks/
│   ├── useZamaInstance.ts    # FHE SDK initialization
│   └── useEthersSigner.ts    # Wagmi to Ethers adapter
├── config/
│   ├── contracts.ts          # Contract addresses & ABIs
│   └── wagmi.ts              # Wallet configuration
├── abis/
│   ├── FHETradeBot.ts        # Contract ABI
│   └── MockMintableToken.ts  # Token ABI
└── App.tsx                    # Root component
```

### TradeApp Component

The main user interface providing:

1. **Wallet Connection**: RainbowKit integration for multi-wallet support
2. **Balance Display**: Real-time ETH deposit balance
3. **Order Placement Form**:
   - Token address input
   - Amount input (uint64)
   - Execution timestamp picker
   - Encrypt & submit functionality
4. **Order Management**:
   - View order count
   - Select orders by ID
   - View order metadata
5. **Bot Operations**:
   - Decrypt encrypted orders
   - Execute orders with decrypted values
6. **Transaction History**: Real-time updates via TanStack Query

**File Location**: `frontend/src/components/TradeApp.tsx` (203 lines)

### Custom Hooks

**useZamaInstance**: Initializes Zama's FHE SDK for client-side encryption

```typescript
const zamaInstance = useZamaInstance();
// Creates encrypted input for contract interaction
const encryptedInput = zamaInstance.createEncryptedInput(...);
```

**useEthersSigner**: Converts Wagmi's Viem signer to Ethers.js format

```typescript
const signer = useEthersSigner();
// Enables contract write operations with Ethers.js
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm/yarn/pnpm**: Package manager
- **Wallet**: MetaMask or any Ethereum wallet
- **Testnet ETH**: Sepolia testnet ETH for testing

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/FHETradeBot.git
   cd FHETradeBot
   ```

2. **Install backend dependencies**

   ```bash
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Set up environment variables**

   ```bash
   # Set your mnemonic
   npx hardhat vars set MNEMONIC

   # Set Infura API key for Sepolia access
   npx hardhat vars set INFURA_API_KEY

   # Optional: Etherscan API key for contract verification
   npx hardhat vars set ETHERSCAN_API_KEY
   ```

5. **Compile contracts**

   ```bash
   npm run compile
   ```

6. **Run tests**

   ```bash
   npm run test
   ```

### Local Development

1. **Start local FHEVM node**

   ```bash
   npx hardhat node
   ```

2. **Deploy contracts (in new terminal)**

   ```bash
   npx hardhat deploy --network localhost
   ```

3. **Start frontend dev server**

   ```bash
   cd frontend
   npm run dev
   ```

4. **Open browser**

   Navigate to `http://localhost:5173`

## 📖 Usage

### For Users

1. **Connect Wallet**
   - Click "Connect Wallet" in the UI
   - Select your wallet provider (MetaMask, WalletConnect, etc.)
   - Approve connection

2. **Deposit ETH**
   - Enter deposit amount in ETH
   - Click "Deposit"
   - Confirm transaction in wallet

3. **Place Encrypted Order**
   - Enter target token contract address
   - Enter purchase amount (in uint64 format)
   - Select execution timestamp
   - Click "Place Order"
   - Approve two transactions:
     - FHE encryption signature
     - Order submission

4. **Monitor Order**
   - View order ID after submission
   - Check order metadata
   - Wait for execution time

5. **Receive Tokens**
   - Bot automatically executes at specified time
   - Tokens appear in your wallet
   - Deposit is charged for execution cost

### For Bot Operators

1. **Monitor Orders**
   ```bash
   npx hardhat tradebot:info --network sepolia
   ```

2. **Decrypt Order**
   - Use Zama Relayer SDK to decrypt
   - Retrieve ciphertexts from contract
   - Generate EIP-712 signature
   - Call userDecrypt() API

3. **Execute Order**
   ```bash
   npx hardhat tradebot:execute \
     --order 0 \
     --token 0xTokenAddress \
     --amount 1000 \
     --network sepolia
   ```

## 🌐 Deployment

### Deploy to Sepolia Testnet

1. **Ensure environment variables are set**

   ```bash
   npx hardhat vars list
   # Should show: MNEMONIC, INFURA_API_KEY
   ```

2. **Deploy contracts**

   ```bash
   npm run deploy:sepolia
   ```

3. **Verify on Etherscan**

   ```bash
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

4. **Update frontend contract addresses**

   Edit `frontend/src/config/contracts.ts`:

   ```typescript
   export const FHE_TRADE_BOT_ADDRESS = "0xYourDeployedAddress";
   export const MOCK_TOKEN_ADDRESS = "0xYourTokenAddress";
   ```

5. **Build and deploy frontend**

   ```bash
   cd frontend
   npm run build
   # Deploy dist/ folder to your hosting provider
   ```

### Current Deployment (Sepolia)

- **FHETradeBot**: `0x269C2cfdAe523f90217d9933Ac9bBB3134fBd3FC`
- **Bot Address**: `0xbB462967347B9A59E5603684B52cD37e6E58424f`
- **MockMintableToken**: `0x3CDc7789E13566729529283c816D317180401cA7`
- **Network**: Sepolia Testnet (Chain ID: 11155111)

## 🧪 Testing

### Run All Tests

```bash
npm run test
```

### Run Specific Test File

```bash
npx hardhat test test/FHETradeBot.ts
```

### Run Sepolia Network Tests

```bash
npm run test:sepolia
```

### Generate Coverage Report

```bash
npm run coverage
```

### Test Files

- **test/FHETradeBot.ts**: Integration tests for trading workflow
- **test/FHECounter.ts**: Unit tests for FHE operations
- **test/FHECounterSepolia.ts**: Sepolia network validation tests

### Example Test Output

```
FHETradeBot Integration Test
  ✓ Should allow deposit (1234ms)
  ✓ Should place encrypted order (2341ms)
  ✓ Should execute order and mint tokens (3122ms)
  ✓ Should charge user deposit (1543ms)

4 passing (8.2s)
```

## ⚙️ Custom Hardhat Tasks

### Trading Tasks

**Deposit ETH**
```bash
npx hardhat tradebot:deposit \
  --amount 1000000000000000000 \
  --network sepolia
```

**Place Order**
```bash
npx hardhat tradebot:place \
  --token 0x3CDc7789E13566729529283c816D317180401cA7 \
  --amount 1000 \
  --time 1735689600 \
  --network sepolia
```

**Execute Order**
```bash
npx hardhat tradebot:execute \
  --order 0 \
  --token 0x3CDc7789E13566729529283c816D317180401cA7 \
  --amount 1000 \
  --network sepolia
```

**Get Order Info**
```bash
npx hardhat tradebot:info \
  --order 0 \
  --network sepolia
```

### Counter Tasks (Example)

**Increment Counter**
```bash
npx hardhat counter:increment --network sepolia
```

**Decrypt Counter**
```bash
npx hardhat counter:decrypt --network sepolia
```

## 🔒 Security Features

### Encryption Layer

1. **Fully Homomorphic Encryption**
   - Uses Zama's TFHE (Threshold FHE) scheme
   - Supports operations on encrypted data
   - Ciphertext size optimized for blockchain

2. **Type-Safe Encryption**
   - `eaddress`: 160-bit encrypted addresses
   - `euint64`: 64-bit encrypted unsigned integers
   - Compile-time type checking prevents mistakes

3. **Access Control Lists (ACL)**
   - Fine-grained permissions for decryption
   - `FHE.allow(value, address)`: Grant decryption rights
   - `FHE.allowThis(value)`: Allow contract access
   - `FHE.isSenderAllowed(handle)`: Verify permissions

### Smart Contract Security

1. **Reentrancy Protection**
   - Checks-effects-interactions pattern
   - State updates before external calls

2. **Access Control**
   - Owner-only admin functions
   - Bot-only execution functions
   - User authorization checks

3. **Validation**
   - Timestamp validation (must be in future)
   - Balance sufficiency checks
   - Double-execution prevention
   - Signer verification in view methods

4. **Pausability** (Future Enhancement)
   - Emergency stop mechanism
   - Upgradeable contracts via proxy pattern

### Frontend Security

1. **Wallet Signature Verification**
   - EIP-712 typed data signatures
   - Prevents unauthorized decryption

2. **Input Sanitization**
   - Address validation
   - Amount range checking
   - Timestamp validation

3. **Secure Communication**
   - HTTPS for API calls
   - Zama Relayer SDK for encryption

## 🗺️ Roadmap

### Phase 1: Foundation ✅ (Completed)

- [x] Core smart contract development
- [x] FHE integration with Zama FHEVM
- [x] Basic frontend UI
- [x] Sepolia testnet deployment
- [x] Wallet integration (RainbowKit)
- [x] Deposit and withdrawal system
- [x] Encrypted order placement
- [x] Bot execution logic
- [x] Comprehensive testing suite

### Phase 2: Enhanced Privacy 🚧 (In Progress)

- [ ] Support for multiple encrypted token types (euint128, euint256)
- [ ] Encrypted slippage tolerance
- [ ] Hidden limit orders with encrypted price targets
- [ ] Batch order execution optimization
- [ ] Advanced encryption parameter tuning
- [ ] Gas optimization for FHE operations

### Phase 3: DEX Integration 📅 (Q2 2025)

- [ ] Replace MockMintableToken with real DEX integration
- [ ] Uniswap V3 integration
- [ ] SushiSwap support
- [ ] Multi-DEX routing for best prices
- [ ] Encrypted liquidity pool selection
- [ ] MEV-resistant execution strategies

### Phase 4: Advanced Features 📅 (Q3 2025)

- [ ] **Encrypted Stop-Loss Orders**: Set stop-loss triggers without revealing price levels
- [ ] **Encrypted DCA (Dollar-Cost Averaging)**: Automated recurring purchases with hidden amounts
- [ ] **Conditional Orders**: Execute based on encrypted oracle data
- [ ] **Multi-Asset Portfolios**: Manage multiple encrypted positions
- [ ] **Privacy-Preserving Analytics**: View encrypted trading history
- [ ] **Social Trading**: Follow strategies without revealing trades

### Phase 5: Mainnet & Scaling 📅 (Q4 2025)

- [ ] Mainnet deployment preparation
- [ ] Security audit by reputable firms
- [ ] Gas optimization round 2
- [ ] Layer 2 integration (Arbitrum, Optimism)
- [ ] Cross-chain bridge support
- [ ] Decentralized bot network
- [ ] Token incentives for bot operators

### Phase 6: Ecosystem Growth 📅 (2026)

- [ ] **API for Developers**: Build custom trading strategies
- [ ] **SDK Release**: JavaScript/TypeScript library
- [ ] **Mobile App**: iOS and Android applications
- [ ] **Trading Bot Marketplace**: Community-built strategies
- [ ] **DAO Governance**: Decentralized protocol upgrades
- [ ] **Liquidity Mining**: Incentivize order placement
- [ ] **Integration Partners**: Wallets, aggregators, analytics platforms

### Research & Innovation 🔬 (Ongoing)

- [ ] Exploring zero-knowledge proofs for additional privacy
- [ ] Investigating encrypted order matching (dark pools)
- [ ] Researching encrypted AMM curves
- [ ] Studying confidential NFT trading
- [ ] Analyzing encrypted derivatives and options
- [ ] Evaluating post-quantum cryptography migration

### Community Requested Features 💡

Have an idea? [Open an issue](https://github.com/yourusername/FHETradeBot/issues) or join our [Discord](https://discord.gg/your-invite) to discuss!

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **Code Contributions**
   - Fix bugs
   - Add new features
   - Improve documentation
   - Optimize gas usage
   - Enhance UI/UX

2. **Testing**
   - Report bugs
   - Test on different networks
   - Stress test smart contracts
   - Review security

3. **Documentation**
   - Improve README
   - Write tutorials
   - Create video guides
   - Translate to other languages

4. **Community**
   - Answer questions
   - Help newcomers
   - Share feedback
   - Promote the project

### Development Workflow

1. **Fork the repository**

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, documented code
   - Follow existing code style
   - Add tests for new features
   - Update documentation

4. **Run tests and linting**
   ```bash
   npm run test
   npm run lint
   npm run lint:sol
   ```

5. **Commit your changes**
   ```bash
   git commit -m "feat: add encrypted stop-loss orders"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Open a Pull Request**
   - Describe your changes
   - Reference related issues
   - Add screenshots for UI changes

### Code Style

- **Solidity**: Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- **TypeScript**: Use ESLint + Prettier configuration
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/)

### Testing Requirements

All PRs must include:
- Unit tests for new functions
- Integration tests for new features
- All existing tests must pass
- Code coverage should not decrease

## 📄 License

This project is licensed under the **BSD-3-Clause-Clear License**.

### What This Means

✅ **You CAN**:
- Use commercially
- Modify the code
- Distribute copies
- Use privately

❌ **You CANNOT**:
- Hold liable
- Use trademarks
- Claim patent grants (explicitly excluded)

📝 **You MUST**:
- Include copyright notice
- Include license text
- State significant changes

See the [LICENSE](LICENSE) file for full details.

## 📚 Documentation & Resources

### Official Documentation

- **Zama FHEVM**: [docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **Hardhat**: [hardhat.org/docs](https://hardhat.org/docs)
- **Wagmi**: [wagmi.sh](https://wagmi.sh/)
- **RainbowKit**: [rainbowkit.com](https://rainbowkit.com/)

### Tutorials & Guides

- [Getting Started with FHE](https://docs.zama.ai/protocol/solidity-guides/getting-started)
- [Writing FHE Smart Contracts](https://docs.zama.ai/protocol/solidity-guides/development-guide)
- [Testing FHE Contracts](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)
- [Deploying to Production](https://docs.zama.ai/protocol/solidity-guides/deployment)

### Research Papers

- [TFHE-rs: Pure Rust Implementation of TFHE](https://github.com/zama-ai/tfhe-rs)
- [Fully Homomorphic Encryption](https://en.wikipedia.org/wiki/Homomorphic_encryption)
- [MEV on Ethereum](https://ethereum.org/en/developers/docs/mev/)

## 🆘 Support

### Get Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/yourusername/FHETradeBot/issues)
- **Discord**: [Join our community](https://discord.gg/your-invite)
- **Twitter**: [@FHETradeBot](https://twitter.com/your-handle)
- **Email**: support@fhetradebot.com

### FAQ

**Q: Is this ready for mainnet?**
A: Not yet. Currently deployed on Sepolia testnet. Mainnet launch planned for Q4 2025 after security audits.

**Q: What are the fees?**
A: Currently only gas fees. Execution fees can be configured by contract owner (default: 0.001 ETH).

**Q: Can I run my own bot?**
A: Yes! Anyone can decrypt orders they're authorized for. Contact us for bot operator documentation.

**Q: Is my data really private?**
A: Yes! Token addresses and amounts are encrypted on-chain using FHE. Only authorized parties can decrypt.

**Q: What wallets are supported?**
A: Any Web3 wallet compatible with RainbowKit (MetaMask, WalletConnect, Coinbase Wallet, etc.).

**Q: Can I cancel an order?**
A: Not in current version. Order cancellation is planned for Phase 2.

**Q: How does the bot make money?**
A: Bot operators charge configurable execution fees. Future versions may include tip mechanisms.

## 🌟 Acknowledgments

Built with ❤️ using:

- **Zama**: For pioneering FHEVM technology
- **Ethereum Foundation**: For the incredible blockchain ecosystem
- **Hardhat Team**: For the best development environment
- **RainbowKit Team**: For beautiful wallet UX
- **Wagmi Contributors**: For React Web3 hooks
- **Open Source Community**: For endless inspiration

## 📊 Project Stats

- **Smart Contracts**: 3 contracts, ~266 lines
- **Frontend**: ~397 lines of React/TypeScript
- **Tests**: ~4,400 lines of comprehensive tests
- **Dependencies**: 50+ carefully selected packages
- **Networks**: Sepolia testnet (more coming soon)
- **Security**: FHE encryption + ACL access control

## 🚀 Quick Links

- **Live Demo**: [https://fhetradebot.netlify.app](https://fhetradebot.netlify.app)
- **GitHub**: [https://github.com/yourusername/FHETradeBot](https://github.com/yourusername/FHETradeBot)
- **Documentation**: [https://docs.fhetradebot.com](https://docs.fhetradebot.com)
- **Twitter**: [@FHETradeBot](https://twitter.com/your-handle)

---

**Built with privacy, powered by encryption, secured by blockchain.**

*FHE Trade Bot - The future of confidential DeFi trading* 🔐
