const { getNamedAccounts, deployments, network, ethers } = require("hardhat");
const { toWei } = require("../utils/helper");

const DECIMALS = 18
const INITIAL_ANSWER = "200000000000000000000"

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
 
  if (chainId == 31337) {
    console.log("Local network detected! Deploying mocks...");

    const initialAnswer = await toWei(1)

    const mockV3Aggregator = await deploy("MockV3Aggregator", {
      from: deployer,
      log: true,
      args: [DECIMALS, initialAnswer],
    });

    console.log(`Mocks Deployed at ${mockV3Aggregator.address}`);
  }
};
module.exports.tags = ["all", "mocks"];
