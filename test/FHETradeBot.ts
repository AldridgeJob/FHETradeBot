import { expect } from "chai";
import { ethers, fhevm, network } from "hardhat";

describe("FHETradeBot", function () {
  it("deposit, place order (encrypted), execute and mint", async function () {
    const [deployer, user, bot] = await ethers.getSigners();

    // Deploy TradeBot with bot address
    const TradeBotFactory = await ethers.getContractFactory("FHETradeBot");
    const tradeBot = await TradeBotFactory.deploy(bot.address);

    // Deploy Mock token with minter TradeBot
    const TokenFactory = await ethers.getContractFactory("MockMintableToken");
    const token = await TokenFactory.deploy("Mock", "MCK", await tradeBot.getAddress());

    // User deposit
    await (await tradeBot.connect(user).deposit({ value: ethers.parseEther("1") })).wait();
    expect(await tradeBot.getDeposit(user.address)).to.equal(ethers.parseEther("1"));

    // Encrypt token address + amount (uint64)
    const input = fhevm.createEncryptedInput(await tradeBot.getAddress(), user.address);
    input.addAddress(await token.getAddress());
    input.add64(1000n);
    const enc = await input.encrypt();

    const executeAt = BigInt((await ethers.provider.getBlock("latest")).timestamp + 10);
    await (
      await tradeBot
        .connect(user)
        .placeOrder(enc.handles[0], enc.handles[1], enc.inputProof, executeAt)
    ).wait();

    // Advance time
    await network.provider.send("evm_increaseTime", [11]);
    await network.provider.send("evm_mine");

    // Bot executes with decrypted values
    await (
      await tradeBot.connect(bot).executeOrder(1, await token.getAddress(), 1000n)
    ).wait();

    // Check token balance minted to user
    expect(await token.balanceOf(user.address)).to.equal(1000n);
    // Check deposit decreased (pricePerUnitWei default 1 wei)
    expect(await tradeBot.getDeposit(user.address)).to.equal(ethers.parseEther("1") - 1000n);
  });
});

