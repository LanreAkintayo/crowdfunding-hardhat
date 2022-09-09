const { frontEndContractsFile, frontEndAbiFile } = require("../helper-hardhat-config")
const fs = require("fs")
const { network } = require("hardhat")

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        await updateContractAddresses()
        await updateAbi()
        console.log("Front end written!")
    }
}

async function updateAbi() {
    const crowdfund = await ethers.getContract("Crowdfund")
    fs.writeFileSync(frontEndAbiFile, crowdfund.interface.format(ethers.utils.FormatTypes.json))
}

async function updateContractAddresses() {
    const crowdfund = await ethers.getContract("Crowdfund")
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))

    if (network.config.chainId.toString() in contractAddresses) {
        if (!contractAddresses[network.config.chainId.toString()].includes(crowdfund.address)) {
            contractAddresses[network.config.chainId.toString()].push(crowdfund.address)
        }
    } else {
        contractAddresses[network.config.chainId.toString()] = [crowdfund.address]
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}
module.exports.tags = ["all", "frontend", "production"]