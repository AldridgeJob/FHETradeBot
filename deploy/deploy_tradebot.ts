import * as dotenv from "dotenv";
dotenv.config();

import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get, log } = hre.deployments;

  // Deploy TradeBot with deployer as bot initially
  const tradeBot = await deploy("FHETradeBot", {
    from: deployer,
    args: [deployer],
    log: true,
  });

  // Deploy a mock mintable token with TradeBot as minter for testing/market simulation
  const token = await deploy("MockMintableToken", {
    from: deployer,
    args: ["MockToken", "MCK", tradeBot.address],
    log: true,
  });

  console.log(`FHETradeBot: ${tradeBot.address}`);
  console.log(`MockMintableToken: ${token.address}`);
};

export default func;
func.id = "deploy_tradebot";
func.tags = ["FHETradeBot", "MockMintableToken"];

