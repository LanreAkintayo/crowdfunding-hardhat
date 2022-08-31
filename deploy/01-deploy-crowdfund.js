const {  network, ethers} = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
// const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {

    const {deployer } = await getNamedAccounts()

    const { deploy, log } = deployments

    log("----------------------------------------------------")
    log("Deploying Crowdfund Contract and waiting for confirmations...")
    const crowdfund = await deploy("Crowdfund", {
        from: deployer,
        args: [],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    // const contract = await ethers.getContract("Crowdfund", deployer)
    
    console.log(`Crowdfund deployed at ${crowdfund.address}`)
}

module.exports.tags = ["all", "crowdfund"]