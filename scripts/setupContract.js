const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");


async function setupContract(){
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

      const deployer = (await getNamedAccounts()).deployer;

      const crowdfund = await ethers.getContract("Crowdfund", deployer);
    //   Crowdfund = await ethers.getContractFactory("Crowdfund");
    //   crowdfund = await Crowdfund.attach("0x32727661e770a43Cb44f1c81Cd37807F5C3c6Cf9")

      // crowdfund = await Crowdfund.deploy()

      // await crowdfund.deployed()
 


      const wbnb = await ethers.getContractAt("IWBNB", wbnbAddress);
      const dai = await ethers.getContractAt("IERC20", daiAddress);
      const xrp = await ethers.getContractAt("IERC20", xrpAddress);
      const busd = await ethers.getContractAt("IERC20", busdAddress);

      const supportedTokensAddress = [
        wbnbAddress, daiAddress, xrpAddress, busdAddress
      ];
      const correspondingPriceFeeds = [
        bnbUsdPriceFeed, daiUsdPriceFeed, xrpUsdPriceFeed, busdUsdPriceFeed
      ];

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
}


setupContract()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })