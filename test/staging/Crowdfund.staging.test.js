const { isCrowdsaleWallet } = require("@ethersproject/json-wallets");
const { expect, assert } = require("chai");
const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");
const {
  fastForwardTheTime,
  duration,
  toWei,
  fromWei,
  now,
} = require("../../utils/helper.js");

/*
Make sure that the token to price feed mapping is mapped corrrectly
Make sure that the tokens in the supported tokens address is set correctly
Make sure that after launching a project, the project is stored correctly in the projects mapping
You can close a project that you've launched already provided that the startDay of the project is yet to elapse.
Make sure that you can pledge to a project 
*/

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Crowdfunding", function () {
      let crowdfund, wbnb, dai, xrp, busd;
      let x_usd_price_feed;
      let deployer, user1, user2, user3, user4, user5;

      beforeEach(async () => {
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
        user3 = await ethers.getSigner(users[2]);
        user4 = await ethers.getSigner(users[3]);
        user5 = await ethers.getSigner(users[4]);

        // // crowdfund = await ethers.getContract("Crowdfund", deployer);
        Crowdfund = await ethers.getContractFactory("Crowdfund");
        crowdfund = await Crowdfund.attach("0x32727661e770a43Cb44f1c81Cd37807F5C3c6Cf9")

        // crowdfund = await Crowdfund.deploy()

        // await crowdfund.deployed()
   


        wbnb = await ethers.getContractAt("IWBNB", wbnbAddress);
        // dai = await ethers.getContractAt("IERC20", daiAddress);
        // xrp = await ethers.getContractAt("IERC20", xrpAddress);
        // busd = await ethers.getContractAt("IERC20", busdAddress);

        // const supportedTokensAddress = [
        //   wbnbAddress, daiAddress, xrpAddress, busdAddress
        // ];
        // const correspondingPriceFeeds = [
        //   bnbUsdPriceFeed, daiUsdPriceFeed, xrpUsdPriceFeed, busdUsdPriceFeed
        // ];

        // const setSupportedTokensTx = await crowdfund.setSupportedTokensAddress(
        //   supportedTokensAddress
        // );
        // await setSupportedTokensTx.wait(1);

        // for (let i = 0; i < supportedTokensAddress.length; i++) {
        //   let setTokenToPriceFeedTx = await crowdfund.setTokenToPriceFeed(
        //     supportedTokensAddress[i],
        //     correspondingPriceFeeds[i]
        //   );
        //   await setTokenToPriceFeedTx.wait(1);
        // }
      });

      describe("Launching a Project", function () {
        beforeEach(async () => {
          const startDay = await now();
          const fundDuration = duration.seconds(30);
          const goal = toWei(0.049); // 100 dollars
          const projectTitle = "Project Title"
         const projectSubtitle = "Project Subtitle"
         const projectNote = "project Note"
         const projectImageUrl = "This is the url"

          const launchTx = await crowdfund
            .connect(user1)
            .launch(startDay, fundDuration, goal, projectTitle, projectSubtitle, projectNote, projectImageUrl);
          await launchTx.wait(1);
        });
        it("should be able to pledge with an ERC20 token", async function () {
          const [owner, id, startDay, endDay, goal, projectTitle] = await crowdfund.projects(
            0
          );

          // Pledge to the project

          await dai.approve(crowdfund.address, toWei(0.05))

          const pledgeTx = await crowdfund.pledge(id, dai.address, toWei(0.05));
          await pledgeTx.wait(1);

          // Wait for the duration to elapse (Make sure that the goal is reached)

          // Check if the owner is going to clam successfully

          const projectOwnerBalanceBefore = fromWei(
            await dai.balanceOf(user1.address)
          );
          const backerBalanceBefore = fromWei(await dai.balanceOf(deployer));

          const totalRaisedInDollarsBefore = fromWei(
            await crowdfund.getTotalAmountRaisedInDollars(id)
          );

          const claimTx = await crowdfund.connect(user1).claim(id);
          await claimTx.wait(1);

          const projectOwnerBalanceAfter = fromWei(
            await dai.balanceOf(user1.address)
          );
          const backerBalanceAfter = fromWei(await dai.balanceOf(deployer));

          const totalRaisedInDollarsAfter = fromWei(
            await crowdfund.getTotalAmountRaisedInDollars(id)
          );

          
        });


        it("should be able to pledge with BNB", async function () {
          const [owner, id, startDay, endDay, goal] = await crowdfund.projects(
            0
          );

          // Pledge to the project

          await wbnb.deposit({value: toWei(0.05)})
          await wbnb.approve(crowdfund.address, toWei(0.02))

          // const backerBalanceBefore = fromWei(await wbnb.balanceOf(deployer));
          // const backerBnbBalanceBefore = fromWei(await ethers.provider.getBalance(deployer))

          const code = await ethers.provider.getCode(crowdfund.address)

          const pledgeTx = await crowdfund.pledge(id, wbnb.address, toWei(0.02));
          await pledgeTx.wait(1);

          // // Wait for the duration to elapse (Make sure that the goal is reached)

          // // Check if the owner is going to clam successfully

          // const backerBalanceAfter = fromWei(await wbnb.balanceOf(deployer));

          // const projectOwnerBalanceBefore = fromWei(
          //   await wbnb.balanceOf(user1.address)
          // );
          // const projectOwnerBnbBalanceBefore = fromWei(await ethers.provider.getBalance(user1.address))

          
          // const totalRaisedInDollarsBefore = fromWei(
          //   await crowdfund.getTotalAmountRaisedInDollars(id)
          // );

          const claimTx = await crowdfund.connect(user1).claim(id);
          await claimTx.wait(1);

          // const projectOwnerBalanceAfter = fromWei(
          //   await wbnb.balanceOf(user1.address)
          // );
          // const projectOwnerBnbBalanceAfter = fromWei(await ethers.provider.getBalance(user1.address))

          
          // const totalRaisedInDollarsAfter = fromWei(
          //   await crowdfund.getTotalAmountRaisedInDollars(id)
          // );


        });

        it("", async function () {
          const [owner, id, startDay, endDay, goal] = await crowdfund.projects(
            0
          );

          // Pledge to the project
          const pledgeTx = await crowdfund.pledge(id, dai.address, toWei(0.05));
          await pledgeTx1.wait(1);

          // Wait for the duration to elapse (Make sure that the goal is not reached)

          // Check if the owner is going to be refunded
        });
      });

      describe("Performing some tasks", function(){
        it("should launch a project and pledge to the project", async function() {
          // Launch a project
          const startDay = await now();
          const fundDuration = duration.seconds(40);
          const goal = toWei(0.049); // 100 dollars
          const projectTitle = "Project Title"
         const projectSubtitle = "Project Subtitle"
         const projectNote = "project Note"
         const projectImageUrl = "This is the url"

          const launchTx = await crowdfund
            .connect(user1)
            .launch(startDay, fundDuration, goal, projectTitle, projectSubtitle, projectNote, projectImageUrl);
          await launchTx.wait(1);

          // Grab the project ID
          const [, id, , , ] = await crowdfund.projects(1);

          // Pledge to the project

          await dai.approve(crowdfund.address, toWei(0.05))

          const pledgeTx = await crowdfund.pledge(id, dai.address, toWei(0.05));
          await pledgeTx.wait(1);

          // Wait for the duration to elapse (Make sure that the goal is reached)

          // Check if the owner is going to clam successfully

          const projectOwnerBalanceBefore = fromWei(
            await dai.balanceOf(user1.address)
          );
          const backerBalanceBefore = fromWei(await dai.balanceOf(deployer));

          const totalRaisedInDollarsBefore = fromWei(
            await crowdfund.getTotalAmountRaisedInDollars(id)
          );

          const claimTx = await crowdfund.connect(user1).claim(id);
          await claimTx.wait(1);

          const projectOwnerBalanceAfter = fromWei(
            await dai.balanceOf(user1.address)
          );
          const backerBalanceAfter = fromWei(await dai.balanceOf(deployer));

          const totalRaisedInDollarsAfter = fromWei(
            await crowdfund.getTotalAmountRaisedInDollars(id))

        })

        it("should launch a project and pledge to the project with BNB", async function() {
          // Launch a project
          const startDay = await now();
          const fundDuration = duration.seconds(20);
          const goal = toWei(0.049); // 100 dollars
          const projectTitle = "Project Title"
         const projectSubtitle = "Project Subtitle"
         const projectNote = "project Note"
         const projectImageUrl = "This is the url"

          const launchTx = await crowdfund
            .connect(user1)
            .launch(startDay, fundDuration, goal, projectTitle, projectSubtitle, projectNote, projectImageUrl);
          await launchTx.wait(1);

          // Grab the project ID
          const [, id, , , ] = await crowdfund.projects(4);

          // Pledge to the project
          await wbnb.deposit({value: toWei(0.05)})
          await wbnb.approve(crowdfund.address, toWei(0.02))

            const backerBalanceBefore = fromWei(await wbnb.balanceOf(deployer));
          const backerBnbBalanceBefore = fromWei(await ethers.provider.getBalance(deployer))

          const code = await ethers.provider.getCode(crowdfund.address)

          const pledgeTx = await crowdfund.pledge(id, wbnb.address, toWei(0.02));
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

          const claimTx = await crowdfund.connect(user1).claim(id);
          await claimTx.wait(1);

          const projectOwnerBalanceAfter = fromWei(
            await wbnb.balanceOf(user1.address)
          );
          const projectOwnerBnbBalanceAfter = fromWei(await ethers.provider.getBalance(user1.address))

          
          const totalRaisedInDollarsAfter = fromWei(
            await crowdfund.getTotalAmountRaisedInDollars(id)
          );


        })
      })
    });
