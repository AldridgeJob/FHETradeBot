import { useEffect, useMemo, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, usePublicClient } from 'wagmi';
import { ethers } from 'ethers';
import { createInstance, SepoliaConfig } from '@zama-fhe/relayer-sdk';
import { FHETradeBotAbi } from '../abis/FHETradeBot';
import { MockMintableTokenAbi } from '../abis/MockMintableToken';

type OrderMeta = { buyer: string; executeAt: bigint; executed: boolean };

export function TradeApp() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [botAddress, setBotAddress] = useState<string>("");
  const [tradeBotAddress, setTradeBotAddress] = useState<string>("");
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [executeAt, setExecuteAt] = useState<string>("");
  const [depositInput, setDepositInput] = useState<string>("");
  const [orders, setOrders] = useState<number>(0);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [decrypted, setDecrypted] = useState<{ token?: string; amount?: bigint } | null>(null);

  const [instance, setInstance] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const inst = await createInstance(SepoliaConfig);
      setInstance(inst);
    })();
  }, []);

  const ethersProvider = useMemo(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      return new ethers.BrowserProvider((window as any).ethereum);
    }
    return null;
  }, []);

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
    if (!ethersProvider || !tradeBotAddress || !depositInput) return;
    const signer = await ethersProvider.getSigner();
    const contract = new ethers.Contract(tradeBotAddress, FHETradeBotAbi, signer);
    const tx = await contract.deposit({ value: ethers.parseEther(depositInput) });
    await tx.wait();
  }

  async function placeOrder() {
    if (!ethersProvider || !tradeBotAddress || !instance) return;
    if (!tokenAddress || !amount || !executeAt) return;
    const signer = await ethersProvider.getSigner();
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
    if (!publicClient || !tradeBotAddress || !instance || !ethersProvider) return;
    const signer = await ethersProvider.getSigner();
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
    if (!ethersProvider || !tradeBotAddress || !decrypted?.token || !decrypted?.amount) return;
    const signer = await ethersProvider.getSigner();
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
          <input placeholder="TradeBot address (sepolia)" value={tradeBotAddress} onChange={e => setTradeBotAddress(e.target.value)} />
          <input placeholder="Bot address (should be executor)" value={botAddress} onChange={e => setBotAddress(e.target.value)} />
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
          <button onClick={placeOrder} disabled={!isConnected}>Place Order</button>
        </div>
      </section>

      <section style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
        <h3>Bot Panel</h3>
        <div>Orders: {orders}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input placeholder="Order ID" value={selectedOrderId} onChange={e => setSelectedOrderId(e.target.value)} />
          <button onClick={() => decryptOrder(Number(selectedOrderId))} disabled={!isConnected}>Decrypt</button>
          <button onClick={() => execute(Number(selectedOrderId))} disabled={!isConnected || !decrypted}>Execute</button>
        </div>
        {decrypted && (
          <div style={{ marginTop: 8 }}>
            <div>Decrypted token: {decrypted.token}</div>
            <div>Decrypted amount: {decrypted.amount.toString()}</div>
          </div>
        )}
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

