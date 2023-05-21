const { ethers } = require("hardhat")

const networkConfig = {
    11155111: {
        name: 'sepolia',
        vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
        EnterenceFee: ethers.utils.parseEther("0.01"),
        gasLane: '0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c',
        subscriptionId : '1646',
        gasLimit: '500000',
        interval : '30',
        mintFee : '10000000000000000', //0.01 ETH
        ethUsdPriceFeed : '0x694AA1769357215DE4FAC081bf1f309aDC325306'
    },
    31337: {
        name: 'hardhat',
        EnterenceFee: ethers.utils.parseEther("0.01"),
        gasLane: '0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c',
        gasLimit: '500000',
        interval : '30',
        subscriptionId : '1',
        mintFee : '10000000000000000' //0.01 ETH

    }

}

const developmentChains = ['hardhat', 'localhost']
const DECIMALS = 8
const INITIAL_PRICE = 200000000

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_PRICE
}