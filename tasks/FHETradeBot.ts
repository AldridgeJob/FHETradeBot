import { task } from "hardhat/config";
import type { FhevmType } from "@fhevm/hardhat-plugin";

task("tradebot:deposit", "Deposit ETH into the TradeBot")
  .addParam("amount", "Amount in wei")
  .addOptionalParam("address", "FHETradeBot address")
  .setAction(async (args, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const addr = args.address || (await hre.deployments.get("FHETradeBot")).address;
    const contract = await hre.ethers.getContractAt("FHETradeBot", addr);
    const tx = await contract.connect(signer).deposit({ value: BigInt(args.amount) });
    await tx.wait();
    console.log(`Deposited ${args.amount} wei to ${addr}`);
  });

task("tradebot:place", "Place an order with encrypted token and amount")
  .addParam("token", "Token address (plaintext for client encryption)")
  .addParam("amount", "Amount (uint64)")
  .addParam("time", "Execute at timestamp")
  .addOptionalParam("address", "FHETradeBot address")
  .setAction(async (args, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const addr = args.address || (await hre.deployments.get("FHETradeBot")).address;
    const contract = await hre.ethers.getContractAt("FHETradeBot", addr);

    // Encrypt inputs using hardhat plugin
    const input = hre.fhevm.createEncryptedInput(addr, signer.address);
    input.addAddress(args.token);
    input.add64(BigInt(args.amount));
    const enc = await input.encrypt();

    const tx = await contract
      .connect(signer)
      .placeOrder(enc.handles[0], enc.handles[1], enc.inputProof, BigInt(args.time));
    const receipt = await tx.wait();
    console.log(`Order placed on ${addr}, tx: ${receipt?.hash}`);
  });

task("tradebot:execute", "Execute an order as bot")
  .addParam("order", "Order id")
  .addParam("token", "Token address (decrypted)")
  .addParam("amount", "Amount (decrypted)")
  .addOptionalParam("address", "FHETradeBot address")
  .setAction(async (args, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const addr = args.address || (await hre.deployments.get("FHETradeBot")).address;
    const contract = await hre.ethers.getContractAt("FHETradeBot", addr);
    const tx = await contract.connect(signer).executeOrder(Number(args.order), args.token, BigInt(args.amount));
    const receipt = await tx.wait();
    console.log(`Order executed, tx: ${receipt?.hash}`);
  });

