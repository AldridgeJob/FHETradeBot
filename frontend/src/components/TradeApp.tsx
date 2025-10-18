import { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, usePublicClient } from 'wagmi';
import { ethers } from 'ethers';
import { FHETradeBotAbi } from '../abis/FHETradeBot';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';
import { contracts } from '../config/contracts';

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
  const [decrypted, setDecrypted] = useState<{ token?: string; amount?: bigint } | null>(null);

  async function fetchOrders() {
    if (!tradeBotAddress || !publicClient) return;
    const id: bigint = (await publicClient.readContract({
      address: tradeBotAddress as `0x${string}`,
      abi: FHETradeBotAbi as any,
      functionName: 'nextOrderId',
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

    setDecrypted({ token: result[encToken], amount: BigInt(result[encAmount]) });
  }

  async function execute(orderId: number) {
    if (!tradeBotAddress || !decrypted?.token || !decrypted?.amount || !signerPromise) return;
    const signer = await signerPromise;
    const contract = new ethers.Contract(tradeBotAddress, FHETradeBotAbi, signer);
    const tx = await contract.executeOrder(orderId, decrypted.token, decrypted.amount);
    await tx.wait();
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>FHE Trade Bot</h2>
        <ConnectButton />
      </header>

      <section style={{ background: '#fff', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <h3>Contracts</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            <span>TradeBot (Sepolia)</span>
            <input value={tradeBotAddress} readOnly style={{ color: '#111827' }} />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            <span>Bot Executor</span>
            <input value={botAddress} readOnly style={{ color: '#111827' }} />
          </label>
        </div>
      </section>

      <section style={{ background: '#fff', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <h3>Deposit ETH</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <input placeholder="Amount in ETH" value={depositInput} onChange={e => setDepositInput(e.target.value)} />
          <button onClick={deposit} disabled={!isConnected}>Deposit</button>
        </div>
        <div style={{ marginTop: 8 }}>
          {address && tradeBotAddress && (
            <AsyncDeposit tradeBotAddress={tradeBotAddress} user={address} getDeposit={getDeposit} />
          )}
        </div>
      </section>

      <section style={{ background: '#fff', padding: 16, borderRadius: 8, marginBottom: 16 }}>
        <h3>Place Encrypted Order</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          <input placeholder="Token address" value={tokenAddress} onChange={e => setTokenAddress(e.target.value)} />
          <input placeholder="Amount (uint64)" value={amount} onChange={e => setAmount(e.target.value)} />
          <input placeholder="Execute at (unix seconds)" value={executeAt} onChange={e => setExecuteAt(e.target.value)} />
          <button onClick={placeOrder} disabled={!isConnected || !instance || isZamaLoading}>Place Order</button>
        </div>
        {zamaError && <div style={{ color: 'red', marginTop: 8 }}>{zamaError}</div>}
      </section>

      <section style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
        <h3>Bot Panel</h3>
        <div>Orders: {orders}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input placeholder="Order ID" value={selectedOrderId} onChange={e => setSelectedOrderId(e.target.value)} />
          <button onClick={() => decryptOrder(Number(selectedOrderId))} disabled={!isConnected || !instance || isZamaLoading}>Decrypt</button>
          <button onClick={() => execute(Number(selectedOrderId))} disabled={!isConnected || !decrypted}>Execute</button>
        </div>
        {decrypted && (
          <div style={{ marginTop: 8 }}>
            <div>Decrypted token: {decrypted.token}</div>
            <div>Decrypted amount: {decrypted.amount.toString()}</div>
          </div>
        )}
      </section>

      <section style={{ background: '#fff', padding: 16, borderRadius: 8, marginTop: 16 }}>
        <h3>Usage Guide</h3>
        <ol style={{ margin: 0, paddingLeft: 20, color: '#4b5563', lineHeight: 1.6 }}>
          <li>Connect your wallet with the button in the header.</li>
          <li>Review the deployed TradeBot and bot executor addresses above.</li>
          <li>Deposit the ETH amount you want the bot to spend.</li>
          <li>Provide the encrypted order details and the execution timestamp, then place the order.</li>
          <li>When the execution window opens, decrypt and execute the order from the bot panel.</li>
        </ol>
      </section>
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
  return <div>Deposit: {dep !== null ? `${ethers.formatEther(dep)} ETH` : '...'}</div>;
}
