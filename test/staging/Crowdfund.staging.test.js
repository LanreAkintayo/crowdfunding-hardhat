const { isCrowdsaleWallet } = require("@ethersproject/json-wallets");
const { expect, assert } = require("chai");
const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains, networkConfig } = require("../../helper-hardhat-config");
const {
  fastForwardTheTime,
  duration,
  toWei,
  fromWei,
  now
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
      let crowdfund, wbnb, dai, xrp, busd
      let x_usd_price_feed
      let deployer, user1, user2, user3, user4, user5
      
      beforeEach(async () => {
   
        deployer = (await getNamedAccounts()).deployer

        const {wbnbAddress, daiAddress, xrpAddress, busdAddress} = networkConfig[network.id]
        
        const users = await getUnnamedAccounts();
        user1 = await ethers.getSigner(users[0]);
        user2 = await ethers.getSigner(users[1]);
        user3 = await ethers.getSigner(users[2]);
        user4 = await ethers.getSigner(users[3]);
        user5 = await ethers.getSigner(users[4]);
       
        crowdfund = await ethers.getContract("Crowdfund", deployer )
      
        wbnb = await ethers.getContractAt("IWBNB", wbnbAddress)
        dai = await ethers.getContractAt("IERC20", daiAddress)
        xrp = await ethers.getContractAt("IERC20", xrpAddress)
        busd = await ethers.getContractAt("IERC20", busdAddress)


        const supportedTokensAddress = [wbnbAddress, daiAddress, xrpAddress, busdAddress]
        const correspondingPriceFeeds = [bnbUsdPriceFeed, daiUsdPriceFeed, xrpUsdPriceFeed, busdUsdPriceFeed]

        const setSupportedTokensTx = await crowdfund.setSupportedTokensAddress(supportedTokensAddress) 
        await setSupportedTokensTx.wait(1);

        for (let i = 0; i < supportedTokensAddress.length; i++){
          let setTokenToPriceFeedTx = await crowdfund.setTokenToPriceFeed(supportedTokensAddress[i], correspondingPriceFeeds[i])
          await setTokenToPriceFeedTx.wait(1)
        }
    
      });

        describe("Launching a Project", function() {
          beforeEach(async () => {
            const startDay = await now()
            const fundDuration = duration.minutes(2)
            const goal = toWei(10) // 100 dollars

            const launchTx = await crowdfund.launch(startDay, fundDuration, goal)
            await launchTx.wait(1)

          })
          it("", async function() {
            // Pledge to the project

            // Wait for the duration to elapse (Make sure that the goal is reached)

            // Check if the owner is going to clam successfully
          })

          it("", async function() {
            // Pledge to the project

            // Wait for the duration to elapse (Make sure that the goal is not reached)

            // Check if the owner is going to be refunded
          })

        })


        describe("Pledging to a project", function() {
          
          beforeEach(async function() {
            const startDay = (await now()) + duration.days(1)
            const fundDuration = duration.days(10)
            const goal = toWei(100) // 100 dollars

            const launchTx = await crowdfund.launch(startDay, fundDuration, goal)
            await launchTx.wait(1)
          })

          it("can only pledge with a supported token", async function() {

            const [owner, id, startDay, endDay, goal] = await crowdfund.projects(0)

            const unsupportedTokenAddress = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"

            await expect(crowdfund.pledge(id, unsupportedTokenAddress, toWei(20))).to.be.revertedWithCustomError(crowdfund, "TokenNotSupported")
          })

          it("user should be included as a backer after pledging", async function() {
            await fastForwardTheTime(duration.days(1) + 10)

            const [owner, id, startDay, endDay, goal] = await crowdfund.projects(0)

            await test1.transfer(user1.address, toWei(500))
            await test1.transfer(user2.address, toWei(500))

            const user1BalanceBefore = await test1.balanceOf(user1.address)
            
            await test1.connect(user1).approve(crowdfund.address, toWei(40))
            await test1.connect(user2).approve(crowdfund.address, toWei(40))

            const pledgeTx1 = await crowdfund.connect(user1).pledge(id, test1.address, toWei(20))
            await pledgeTx1.wait(1)

            const user1BalanceAfter = await test1.balanceOf(user1.address)

            expect(user1BalanceAfter).to.equal(user1BalanceBefore.sub(toWei(20)))
            expect(await test1.balanceOf(crowdfund.address)).to.equal(toWei(20))


            const pledgeTx2 = await crowdfund.connect(user1).pledge(id, test1.address, toWei(20))
            await pledgeTx2.wait(1)

            const pledgeTx3 = await crowdfund.connect(user2).pledge(id, test1.address, toWei(40))
            await pledgeTx3.wait(1)            


            const backers = await crowdfund.getBackers(id)

            const [backer1, backer2] = backers

            assert.equal(backer1[2].toString(), (toWei(40)).toString())
            assert.equal(backer2[2].toString(), (toWei(40)).toString())

          })
        })

        describe("Unpledging to a project", function() {
          
          beforeEach(async function() {
            const startDay = (await now()) + duration.days(1)
            const fundDuration = duration.days(10)
            const goal = toWei(100) // 100 dollars

            const launchTx = await crowdfund.launch(startDay, fundDuration, goal)
            await launchTx.wait(1)
          })

          it("user should be able to unpledge to a project", async function() {
            await fastForwardTheTime(duration.days(1) + 10)

            const [owner, id, startDay, endDay, goal] = await crowdfund.projects(0)

            await test1.transfer(user1.address, toWei(500))

            const user1BalanceBefore = await test1.balanceOf(user1.address)
            
            await test1.connect(user1).approve(crowdfund.address, toWei(40))

            const pledgeTx = await crowdfund.connect(user1).pledge(id, test1.address, toWei(20))
            await pledgeTx.wait(1)

            const user1BalanceAfter = await test1.balanceOf(user1.address)

            expect(user1BalanceAfter).to.equal(user1BalanceBefore.sub(toWei(20)))

            // Unpledging

            const unpledgeTx = await crowdfund.connect(user1).unpledge(id, test1.address, toWei(5))
            await unpledgeTx.wait(1)

            const user1BalanceAfterUnpledging = await test1.balanceOf(user1.address)

            const backers = await crowdfund.getBackers(id)

            const [backer1] = backers

            assert.equal(backer1[2].toString(), (toWei(15)).toString())
            assert.equal(user1BalanceAfterUnpledging.toString(), user1BalanceAfter.add(toWei(5)).toString())

          })
        })

        describe("Claiming a project", function() {
          
          beforeEach(async function() {
            const startDay = (await now()) + duration.days(1)
            const fundDuration = duration.days(10)
            const goal = toWei(100) // 100 dollars

            const launchTx = await crowdfund.launch(startDay, fundDuration, goal)
            await launchTx.wait(1)
          })


          it("user should not be able to claim a project when the goal is reached", async function() {
            await fastForwardTheTime(duration.days(1) + 10)

            const [owner, id, startDay, endDay, goal] = await crowdfund.projects(0)

            await test1.transfer(user1.address, toWei(500))
            await test2.transfer(user2.address, toWei(500))
            await test1.transfer(user3.address, toWei(500))

            await test1.connect(user1).approve(crowdfund.address, toWei(500))
            await test2.connect(user2).approve(crowdfund.address, toWei(500))
            await test1.connect(user3).approve(crowdfund.address, toWei(500))

            const pledgeTx1 = await crowdfund.connect(user1).pledge(id, test1.address, toWei(50))
            await pledgeTx1.wait(1)

            await expect(crowdfund.claim(id)).to.be.revertedWithCustomError(crowdfund, "ProjectStillOpen")
            
            const pledgeTx2 = await crowdfund.connect(user2).pledge(id, test2.address, toWei(50))
            await pledgeTx2.wait(1)
            
            const pledgeTx3 = await crowdfund.connect(user3).pledge(id, test1.address, toWei(20))
            await pledgeTx3.wait(1)

            const ownerTest1BalanceBefore = await test1.balanceOf(deployer)
            const ownerTest2BalanceBefore = await test2.balanceOf(deployer)

            const totalRaisedInDollars = fromWei(await crowdfund.getTotalAmountRaisedInDollars(id))

            const claimTx2 = await crowdfund.claim(id)
            await claimTx2.wait(1)

            const ownerTest1BalanceAfter = await test1.balanceOf(deployer)
            const ownerTest2BalanceAfter = await test2.balanceOf(deployer)

            expect(ownerTest1BalanceAfter).to.equal(ownerTest1BalanceBefore.add(toWei(70)))
            expect(ownerTest2BalanceAfter).to.equal(ownerTest2BalanceBefore.add(toWei(50)))

          })
        })

        describe("Refunding a project", function() {
          
          beforeEach(async function() {
            const startDay = (await now()) + duration.days(1)
            const fundDuration = duration.days(10)
            const goal = toWei(100) // 100 dollars

            const launchTx = await crowdfund.launch(startDay, fundDuration, goal)
            await launchTx.wait(1)
          })


          it("user should be able to able to refund", async function() {
            await fastForwardTheTime(duration.days(1) + 10)

            const [owner, id, startDay, endDay, goal] = await crowdfund.projects(0)

            await test1.transfer(user1.address, toWei(500))
            await test1.connect(user1).approve(crowdfund.address, toWei(500))

            await test2.transfer(user2.address, toWei(500))
            await test2.connect(user2).approve(crowdfund.address, toWei(500))

            const pledgeTx = await crowdfund.connect(user1).pledge(id, test1.address, toWei(50))
            await pledgeTx.wait(1)

            await expect(crowdfund.claim(id)).to.be.revertedWithCustomError(crowdfund, "ProjectStillOpen")

            const pledgeTx2 = await crowdfund.connect(user2).pledge(id, test2.address, toWei(30))
            await pledgeTx2.wait(1)

            await fastForwardTheTime(duration.days(10) + 40);

            const backerTest1BalanceBefore = await test1.balanceOf(user1.address)

            const refundTx = await crowdfund.refund(id)
            await refundTx.wait(1)

            const backerTest1BalanceAfter = await test1.balanceOf(user1.address)

            assert.equal(backerTest1BalanceAfter.toString(), backerTest1BalanceBefore.add(toWei(50)).toString())
          })
        })

    });