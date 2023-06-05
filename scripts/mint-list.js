const { ethers } = require("hardhat");

const PRICE = ethers.utils.parseEther('0.2')

async function mintList() {

    const nftMarketPlace = await ethers.getContract('NftMarketplace')
    const basicNft = await ethers.getContract('BasicNFT')

    console.log('minting...')
    const mntNft = await basicNft.mintNft()
    const txRes = await mntNft.wait(1)
    const tokenId = txRes.events[0].args.tokenId

    console.log('approving...')
    const approve = await basicNft.approve(nftMarketPlace.address, tokenId)
    await approve.wait(1)

    console.log('listing...')
    const tx = await nftMarketPlace.listItem(basicNft.address, tokenId, PRICE)
    await tx.wait(1)
    console.log('listed!!')
}


mintList().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
