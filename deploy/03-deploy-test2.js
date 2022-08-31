const {  network, ethers} = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
// const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {

    const {deployer } = await getNamedAccounts()

    const { deploy, log } = deployments

    log("----------------------------------------------------")
    log("Deploying Test 1 token and waiting for confirmations...")
    const test2 = await deploy("TEST2", {
        from: deployer,
        args: [],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    
    console.log(`Test 2 deployed at ${test2.address}`)
}

module.exports.tags = ["all", "test2"]