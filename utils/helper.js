const { ethers } = require("hardhat");

const FLEX = async (value) => {
  return await ethers.utils.parseEther(value.toString());
};

const toWei =  (value) => {
  return ethers.utils.parseEther(value.toString());
};

const fromWei = (amount) => {
  return ethers.utils.formatEther(amount)
};

const fastForwardTheTime = async (valueInSeconds) => {
  await ethers.provider.send("evm_increaseTime", [valueInSeconds]);
  await ethers.provider.send("evm_mine");
};

const now = async () => {
  const blockNumber = await ethers.provider.getBlockNumber();
  const block = await ethers.provider.getBlock(blockNumber)
  return block.timestamp
}

const percent = (percentage, amount) => {
  return (percentage * Number(amount)) / 100;
};

const duration = {
  seconds: function (val) {
    return val;
  },
  minutes: function (val) {
    return val * this.seconds(60);
  },
  hours: function (val) {
    return val * this.minutes(60);
  },
  days: function (val) {
    return val * this.hours(24);
  },
  weeks: function (val) {
    return val * this.days(7);
  },
  years: function (val) {
    return val * this.days(365);
  },
};

const readableFlex = async (amount) => {
  return await ethers.utils.formatEther(amount.toString());
};


module.exports = {FLEX, toWei, fromWei, fastForwardTheTime, percent, duration, readableFlex, now}