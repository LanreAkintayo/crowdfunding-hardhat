const { expect, assert } = require("chai");
const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const {
  fastForwardTheTime,
  duration,
  toWei,
  fromWei,
  now,
} = require("../utils/helper.js");

const forkBinanceSmartChain = async () => {
  console.log("Forking binance smart chain ......................");

  const bscProvider = new ethers.providers.JsonRpcProvider(process.env.BSC_URL);

  const latestBlockNumber = await bscProvider.getBlockNumber();

  // 20724721

  await network.provider.send("hardhat_reset", [
    {
      forking: {
        jsonRpcUrl: process.env.BSC_URL,
        blockNumber: latestBlockNumber,
      },
    },
  ]);

  console.log("Binance smart chain forked......................");
};


async function pledgeAndclaim() {
    let crowdfund, wbnb, dai, xrp, busd;
    let deployer, user1, user2, user3, user4, user5;

    // await forkBinanceSmartChain();

    deployer = (await getNamedAccounts()).deployer;

    const {
      wbnbAddress,
      daiAddress,
      xrpAddress,
      busdAddress,
      bnbUsdPriceFeed,
      daiUsdPriceFeed,
      xrpUsdPriceFeed,
      busdUsdPriceFeed,
    } = networkConfig[network.config.chainId];

    const users = await getUnnamedAccounts();
    user1 = await ethers.getSigner(users[0]);
    user2 = await ethers.getSigner(users[1]);
  
    // // crowdfund = await ethers.getContract("Crowdfund", deployer);
    Crowdfund = await ethers.getContractFactory("Crowdfund");
    // crowdfund = await Crowdfund.attach("0xCB15E380af360b7c5EB4B4958038441830AC42F5")

    crowdfund = await Crowdfund.deploy()

    await crowdfund.deployed()

    wbnb = await ethers.getContractAt("IWBNB", wbnbAddress);

    const supportedTokensAddress = [wbnbAddress];
    const correspondingPriceFeeds = [bnbUsdPriceFeed];

    const setSupportedTokensTx = await crowdfund.setSupportedTokensAddress(
      supportedTokensAddress
    );
    await setSupportedTokensTx.wait(1);

    for (let i = 0; i < supportedTokensAddress.length; i++) {
      let setTokenToPriceFeedTx = await crowdfund.setTokenToPriceFeed(
        supportedTokensAddress[i],
        correspondingPriceFeeds[i]
      );
      await setTokenToPriceFeedTx.wait(1);
    }

       // Launch a project
       const startDay = await now();
       const fundDuration = duration.seconds(100);
       const goal = toWei(0.01); // 100 dollars

       const contractWbnbAddress = await crowdfund.WBNB();

       const launchTx = await crowdfund
         .connect(user1)
         .launch(startDay, fundDuration, goal);
       await launchTx.wait(1);

       // Grab the project ID
       const [, id, , , ] = await crowdfund.projects(0);

       // Pledge to the project
       await wbnb.deposit({value: toWei(0.01)})
       await wbnb.approve(crowdfund.address, toWei(0.01))

        const backerBalanceBefore = fromWei(await wbnb.balanceOf(deployer));
       const backerBnbBalanceBefore = fromWei(await ethers.provider.getBalance(deployer))

       const code = await ethers.provider.getCode(crowdfund.address)

       const contractWbnbBalanceBeforePledging = fromWei(await wbnb.balanceOf(crowdfund.address))


       const pledgeTx = await crowdfund.pledge(id, wbnbAddress, toWei(0.008));
       await pledgeTx.wait(1);

       // Wait for the duration to elapse (Make sure that the goal is reached)

       // Check if the owner is going to clam successfully

       const backerBalanceAfter = fromWei(await wbnb.balanceOf(deployer));

       const projectOwnerBalanceBefore = fromWei(
         await wbnb.balanceOf(user1.address)
       );
       const projectOwnerBnbBalanceBefore = fromWei(await ethers.provider.getBalance(user1.address))

       
       const totalRaisedInDollarsBefore = fromWei(
         await crowdfund.getTotalAmountRaisedInDollars(id)
       );

       const contractWbnbBalanceAfterPledging = fromWei(await wbnb.balanceOf(crowdfund.address))

      //  const delayInMilliseconds = Number(fundDuration) * 1000

      // await fastForwardTheTime(fundDuration + 30)

       const claimTx = await crowdfund.connect(user1).claim(id);
       await claimTx.wait(1);

      //  await wbnb.connect(user1).withdraw(toWei(400))

       const projectOwnerBalanceAfter = fromWei(
         await wbnb.balanceOf(user1.address)
       );
       const projectOwnerBnbBalanceAfter = fromWei(await ethers.provider.getBalance(user1.address))

       
       const totalRaisedInDollarsAfter = fromWei(
         await crowdfund.getTotalAmountRaisedInDollars(id)
       );

      //  setTimeout(async function() {
      //   //your code to be executed after 1 second
      //   const claimTx = await crowdfund.connect(user1).claim(id);
      //   await claimTx.wait(1);
 
      //   const projectOwnerBalanceAfter = fromWei(
      //     await wbnb.balanceOf(user1.address)
      //   );
      //   const projectOwnerBnbBalanceAfter = fromWei(await ethers.provider.getBalance(user1.address))
 
        
      //   const totalRaisedInDollarsAfter = fromWei(
      //     await crowdfund.getTotalAmountRaisedInDollars(id)
      //   );

      // }, delayInMilliseconds);


}

pledgeAndclaim()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })