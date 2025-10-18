import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, usePublicClient } from 'wagmi';
import { ethers } from 'ethers';
import { FHETradeBotAbi } from '../abis/FHETradeBot';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { contracts } from '../config/contracts';
import '../styles/TradeApp.css';

export function TradeApp() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const signerPromise = useEthersSigner();
  const { instance, isLoading: isZamaLoading, error: zamaError } = useZamaInstance();

  const tradeBotAddress = contracts.tradeBot;
  const botAddress = contracts.botExecutor;
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [executeAt, setExecuteAt] = useState<string>("");
  const [depositInput, setDepositInput] = useState<string>("");
  const [orders, setOrders] = useState<number>(0);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [decrypted, setDecrypted] = useState<{ token: string; amount: bigint } | null>(null);

  async function fetchOrders() {
    if (!tradeBotAddress || !publicClient) return;
    const id: bigint = (await publicClient.readContract({
      address: tradeBotAddress as `0x${string}`,
      abi: FHETradeBotAbi as any,
      functionName: 'nextOrderId',
      args: [],
    })) as any;
    setOrders(Number(id));
  }

  useEffect(() => {
    fetchOrders();
  }, [tradeBotAddress, publicClient]);

  async function deposit() {
    if (!tradeBotAddress || !depositInput || !signerPromise) return;
    const signer = await signerPromise;
    const contract = new ethers.Contract(tradeBotAddress, FHETradeBotAbi, signer);
    const tx = await contract.deposit({ value: ethers.parseEther(depositInput) });
    await tx.wait();
  }

  async function placeOrder() {
    if (!tradeBotAddress || !instance || !signerPromise) return;
    if (!tokenAddress || !amount || !executeAt) return;
    const signer = await signerPromise;
    const input = instance.createEncryptedInput(tradeBotAddress, await signer.getAddress());
    input.addAddress(tokenAddress);
    input.add64(BigInt(amount));
    const enc = await input.encrypt();
    const contract = new ethers.Contract(tradeBotAddress, FHETradeBotAbi, signer);
    const tx = await contract.placeOrder(enc.handles[0], enc.handles[1], enc.inputProof, BigInt(executeAt));
    await tx.wait();
    await fetchOrders();
  }

  async function getDeposit(user: string) {
    if (!publicClient || !tradeBotAddress || !user) return 0n;
    const res = await publicClient.readContract({
      address: tradeBotAddress as `0x${string}`,
      abi: FHETradeBotAbi as any,
      functionName: 'getDeposit',
      args: [user],
    });
    return res as bigint;
  }

  async function decryptOrder(orderId: number) {
    if (!publicClient || !tradeBotAddress || !instance || !signerPromise) return;
    const signer = await signerPromise;
    const [encToken, encAmount] = (await publicClient.readContract({
      address: tradeBotAddress as `0x${string}`,
      abi: FHETradeBotAbi as any,
      functionName: 'getOrderCiphertexts',
      args: [orderId],
    })) as any[];

    const handleContractPairs = [
      { handle: encToken, contractAddress: tradeBotAddress },
      { handle: encAmount, contractAddress: tradeBotAddress },
    ];

    const keypair = instance.generateKeypair();
    const startTimeStamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = '10';
    const eip712 = instance.createEIP712(keypair.publicKey, [tradeBotAddress], startTimeStamp, durationDays);
    const signature = await (signer as any).signTypedData(
      eip712.domain,
      { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
      eip712.message,
    );

    const result = await instance.userDecrypt(
      handleContractPairs,
      keypair.privateKey,
      keypair.publicKey,
      signature.replace('0x', ''),
      [tradeBotAddress],
      await signer.getAddress(),
      startTimeStamp,
      durationDays,
    );

    const tokenValue = result[encToken];
    const amountValue = result[encAmount];

    if (!tokenValue || amountValue === undefined) {
      return;
    }

    setDecrypted({ token: tokenValue, amount: BigInt(amountValue) });
  }

  async function execute(orderId: number) {
    if (!tradeBotAddress || !signerPromise || !decrypted) return;
    const { token, amount } = decrypted;
    if (!token) return;
    const signer = await signerPromise;
    const contract = new ethers.Contract(tradeBotAddress, FHETradeBotAbi, signer);
    const tx = await contract.executeOrder(orderId, token, amount);
    await tx.wait();
  }

  return (
    <div className="trade-app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-container">
              <div className="logo-icon">🔐</div>
              <div>
                <h1 className="app-title">FHE Trade Bot</h1>
                <p className="app-subtitle">Privacy-First Encrypted Trading</p>
              </div>
            </div>
          </div>
          <ConnectButton />
        </div>
      </header>

      <div className="main-container">
        <div className="grid-layout">
          {/* Left Column */}
          <div className="left-column">
            {/* Contracts Info */}
            <section className="card contracts-card">
              <div className="card-header">
                <h3 className="card-title">
                  <span className="icon">📜</span>
                  Smart Contracts
                </h3>
                <span className="badge badge-success">Sepolia</span>
              </div>
              <div className="card-body">
                <div className="input-group">
                  <label className="input-label">
                    <span className="label-text">TradeBot Contract</span>
                    <div className="contract-address">
                      <input
                        value={tradeBotAddress}
                        readOnly
                        className="input-readonly"
                      />
                      <button
                        className="btn-copy"
                        onClick={() => navigator.clipboard.writeText(tradeBotAddress)}
                        title="Copy address"
                      >
                        📋
                      </button>
                    </div>
                  </label>
                  <label className="input-label">
                    <span className="label-text">Bot Executor</span>
                    <div className="contract-address">
                      <input
                        value={botAddress}
                        readOnly
                        className="input-readonly"
                      />
                      <button
                        className="btn-copy"
                        onClick={() => navigator.clipboard.writeText(botAddress)}
                        title="Copy address"
                      >
                        📋
                      </button>
                    </div>
                  </label>
                </div>
              </div>
            </section>

            {/* Deposit Section */}
            <section className="card deposit-card">
              <div className="card-header">
                <h3 className="card-title">
                  <span className="icon">💰</span>
                  Deposit ETH
                </h3>
                {address && tradeBotAddress && (
                  <AsyncDeposit tradeBotAddress={tradeBotAddress} user={address} getDeposit={getDeposit} />
                )}
              </div>
              <div className="card-body">
                <div className="deposit-input-group">
                  <input
                    className="input-primary"
                    placeholder="Amount in ETH (e.g., 0.1)"
                    value={depositInput}
                    onChange={e => setDepositInput(e.target.value)}
                    type="number"
                    step="0.001"
                  />
                  <button
                    className="btn-primary"
                    onClick={deposit}
                    disabled={!isConnected || !depositInput}
                  >
                    Deposit
                  </button>
                </div>
                <p className="help-text">
                  Deposit ETH to fund your encrypted orders
                </p>
              </div>
            </section>

            {/* Usage Guide */}
            <section className="card guide-card">
              <div className="card-header">
                <h3 className="card-title">
                  <span className="icon">📖</span>
                  Quick Start Guide
                </h3>
              </div>
              <div className="card-body">
                <ol className="guide-list">
                  <li>
                    <span className="step-number">1</span>
                    <span>Connect your wallet using the button above</span>
                  </li>
                  <li>
                    <span className="step-number">2</span>
                    <span>Deposit ETH to fund your trading account</span>
                  </li>
                  <li>
                    <span className="step-number">3</span>
                    <span>Place an encrypted order with token details</span>
                  </li>
                  <li>
                    <span className="step-number">4</span>
                    <span>Wait for execution time or use bot panel</span>
                  </li>
                </ol>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="right-column">
            {/* Place Order */}
            <section className="card order-card">
              <div className="card-header">
                <h3 className="card-title">
                  <span className="icon">🔒</span>
                  Place Encrypted Order
                </h3>
                <span className="badge badge-primary">FHE Protected</span>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="input-label">
                    <span className="label-text">Token Address</span>
                    <input
                      className="input-primary"
                      placeholder="0x..."
                      value={tokenAddress}
                      onChange={e => setTokenAddress(e.target.value)}
                    />
                  </label>
                  <label className="input-label">
                    <span className="label-text">Amount (uint64)</span>
                    <input
                      className="input-primary"
                      placeholder="1000"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      type="number"
                    />
                  </label>
                  <label className="input-label">
                    <span className="label-text">Execute At (Unix Timestamp)</span>
                    <input
                      className="input-primary"
                      placeholder={Math.floor(Date.now() / 1000 + 3600).toString()}
                      value={executeAt}
                      onChange={e => setExecuteAt(e.target.value)}
                      type="number"
                    />
                    <span className="help-text-small">
                      Current: {Math.floor(Date.now() / 1000)} (+1h: {Math.floor(Date.now() / 1000 + 3600)})
                    </span>
                  </label>
                  <button
                    className="btn-primary btn-large"
                    onClick={placeOrder}
                    disabled={!isConnected || !instance || isZamaLoading}
                  >
                    {isZamaLoading ? '🔄 Loading FHE...' : '🚀 Place Encrypted Order'}
                  </button>
                </div>
                {zamaError && (
                  <div className="alert alert-error">
                    ⚠️ {zamaError}
                  </div>
                )}
              </div>
            </section>

            {/* Bot Panel */}
            <section className="card bot-card">
              <div className="card-header">
                <h3 className="card-title">
                  <span className="icon">🤖</span>
                  Bot Control Panel
                </h3>
                <span className="badge badge-info">Orders: {orders}</span>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="input-label">
                    <span className="label-text">Order ID</span>
                    <input
                      className="input-primary"
                      placeholder="0"
                      value={selectedOrderId}
                      onChange={e => setSelectedOrderId(e.target.value)}
                      type="number"
                    />
                  </label>
                  <div className="button-group">
                    <button
                      className="btn-secondary"
                      onClick={() => decryptOrder(Number(selectedOrderId))}
                      disabled={!isConnected || !instance || isZamaLoading || !selectedOrderId}
                    >
                      🔓 Decrypt Order
                    </button>
                    <button
                      className="btn-success"
                      onClick={() => execute(Number(selectedOrderId))}
                      disabled={!isConnected || !decrypted || !selectedOrderId}
                    >
                      ✅ Execute Order
                    </button>
                  </div>
                </div>
                {decrypted && (
                  <div className="decrypted-info">
                    <div className="info-item">
                      <span className="info-label">Decrypted Token:</span>
                      <code className="info-value">{decrypted.token}</code>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Decrypted Amount:</span>
                      <code className="info-value">{decrypted.amount.toString()}</code>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function AsyncDeposit({ tradeBotAddress, user, getDeposit }: { tradeBotAddress: string; user: string; getDeposit: (u: string) => Promise<bigint> }) {
  const [dep, setDep] = useState<bigint | null>(null);
  useEffect(() => {
    (async () => {
      setDep(await getDeposit(user));
    })();
  }, [tradeBotAddress, user]);
  return (
    <span className="balance-badge">
      💎 {dep !== null ? `${ethers.formatEther(dep)} ETH` : '...'}
    </span>
  );
}
