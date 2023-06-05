const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")


module.exports = async ({ getNamedAccounts, deployments }) => {

    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    const args = []

    if (developmentChains.includes(network.name)) {

        await deploy("DummyContract", {
            from: deployer,
            args: args,
            log: true,
            waitConfirmations: 1
        })
    }


    log('---------------------')

}

module.exports.tags = ["all", "dummy"]