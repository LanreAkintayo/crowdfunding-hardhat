const developmentChains = ["localhost", "hardhat"]
const networkConfig = {
    31337:{
        name: "hardhat",
        wbnbAddress: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        bnbUsdPriceFeed: "0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE"
    },
    97: {
        name:"testnet",
        wbnbAddress: "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd",
        busdAddress: "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee",
        daiAddress: "0xEC5dCb5Dbf4B114C9d0F65BcCAb49EC54F6A0867",
        usdcAddress: "0x64544969ed7EBf5f083679233325356EbE738930",
        usdtAddress: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd",
        xrpAddress: "0xa83575490D7df4E2F47b7D38ef351a2722cA45b9",
        bnbUsdPriceFeed: "0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526",
        daiUsdPriceFeed: "0xE4eE17114774713d2De0eC0f035d4F7665fc025D",
        busdUsdPriceFeed: "0x9331b55D9830EF609A2aBCfAc0FBCE050A52fdEa",
        usdcUsdPriceFeed: "0x90c069C4538adAc136E051052E14c1cD799C41B7",
        usdtUsdPriceFeed: "0xEca2605f0BCF2BA5966372C99837b1F182d3D620",
        xrpUsdPriceFeed: "0x4046332373C24Aed1dC8bAd489A04E187833B28d"
    }
}
const frontEndContractsFile = "../crowdfund-frontend/constants/contractAddresses.json"
const frontEndAbiFile = "../crowdfund-frontend/constants/abi.json"

module.exports = {developmentChains, networkConfig, frontEndContractsFile, frontEndAbiFile}