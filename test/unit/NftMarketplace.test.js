
const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

//writing the test code from here..

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NFT Marketplace Unit Tests", function () {


        let basicNft, deployer, player, nftMarketplace, dummyContract

        const TOKEN_ID = 0
        const price = ethers.utils.parseEther('0.1')

        beforeEach(async () => {

            const accounts = await ethers.getSigners()
            deployer = accounts[0]
            player = accounts[1]
            await deployments.fixture(["all"])
            basicNft = await ethers.getContract("BasicNFT", deployer)
            nftMarketplace = await ethers.getContract("NftMarketplace", deployer)
            dummyContract = await ethers.getContract('DummyContract', player)
            await basicNft.mintNft()
            await basicNft.approve(nftMarketplace.address, TOKEN_ID)

        })

        describe('list Items', () => {
            it('emits an event after listing', async () => {
                await expect(nftMarketplace.listItem(basicNft.address, TOKEN_ID, price)).to.emit(nftMarketplace, 'ItemsListed')
            })
            it("emits an error if already listed", async function () {
                await nftMarketplace.listItem(basicNft.address, TOKEN_ID, price)
                await expect(
                    nftMarketplace.listItem(basicNft.address, TOKEN_ID, price)
                ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace__AlreadyListed")
            })
            it("emits an error if not owner", async function () {

                const playerConnectedNftMarkeplace = await nftMarketplace.connect(player)
                await expect(
                    playerConnectedNftMarkeplace.listItem(basicNft.address, TOKEN_ID, price)
                ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace__NotOwner")
            })
            it("needs approvals to list item", async function () {
                await basicNft.approve(ethers.constants.AddressZero, TOKEN_ID)
                await expect(
                    nftMarketplace.listItem(basicNft.address, TOKEN_ID, price)
                ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace__NotApprovedForMarketplace")
            })
            it("updates listing with seller and price", async function () {
                await nftMarketplace.listItem(basicNft.address, TOKEN_ID, price)
                const listings = await nftMarketplace.getListings(basicNft.address, TOKEN_ID)

                assert.equal(listings.price.toString(), price.toString())
                assert.equal(listings.seller.toString(), deployer.address.toString())
            })
            it("reverts if the price be 0", async () => {
                const ZERO_PRICE = ethers.utils.parseEther("0")
                await expect(
                    nftMarketplace.listItem(basicNft.address, TOKEN_ID, ZERO_PRICE)
                ).revertedWithCustomError(nftMarketplace, "NftMarketplace__PriceMustBeAboveZero")
            })

            describe('Cancel listing', () => {
                it("reverts if there is no listing", async function () {
                    await expect(
                        nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
                    ).to.be.revertedWithCustomError(nftMarketplace, 'NftMarketplace__NotListed')
                })
                it("reverts if anyone but the owner tries to call", async function () {
                    await nftMarketplace.listItem(basicNft.address, TOKEN_ID, price)
                    nftMarketplace = nftMarketplace.connect(player)
                    await expect(
                        nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
                    ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace__NotOwner")
                })
                it("emits event and removes listing", async function () {
                    await nftMarketplace.listItem(basicNft.address, TOKEN_ID, price)
                    expect(await nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)).to.emit(
                        "ItemCanceled"
                    )
                    const listing = await nftMarketplace.getListings(basicNft.address, TOKEN_ID)
                    assert(listing.price.toString() == "0")
                })
            })

            describe("buyItem", function () {

                it("reverts if the item isnt listed", async function () {
                    await expect(
                        nftMarketplace.buyItems(basicNft.address, TOKEN_ID)
                    ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace__NotListed")
                })

                it("reverts if the price isnt met", async function () {
                    await nftMarketplace.listItem(basicNft.address, TOKEN_ID, price)
                    await expect(
                        nftMarketplace.buyItems(basicNft.address, TOKEN_ID)
                    ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace__PriceNotMet")
                })

                it("transfers the nft to the buyer and updates internal proceeds record", async function () {
                    await nftMarketplace.listItem(basicNft.address, TOKEN_ID, price)
                    nftMarketplace = nftMarketplace.connect(player)
                    expect(
                        await nftMarketplace.buyItems(basicNft.address, TOKEN_ID, { value: price })
                    ).to.emit("ItemBought")
                    const newOwner = await basicNft.ownerOf(TOKEN_ID)
                    const deployerProceeds = await nftMarketplace.getProceeds(deployer.address)
                    assert(newOwner.toString() == player.address)
                    assert(deployerProceeds.toString() == price.toString())
                })

            })

            describe("updateListing", function () {

                it("must be owner and listed", async function () {
                    await expect(
                        nftMarketplace.updateListing(basicNft.address, TOKEN_ID, price)
                    ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace__NotListed")

                    await nftMarketplace.listItem(basicNft.address, TOKEN_ID, price)

                    nftMarketplace = nftMarketplace.connect(player)
                    await expect(
                        nftMarketplace.updateListing(basicNft.address, TOKEN_ID, price)
                    ).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace__NotOwner")
                })
                it("reverts if new price is equal to 0", async function () {
                    const newPrice = ethers.utils.parseEther('0')
                    await nftMarketplace.listItem(basicNft.address, TOKEN_ID, price)
                    expect(
                        nftMarketplace.updateListing(basicNft.address, TOKEN_ID, newPrice)
                    ).to.be.revertedWith('Price must be above 0')
                })
                it("updates the price of the item", async function () {
                    const newPrice = ethers.utils.parseEther('0.2')
                    await nftMarketplace.listItem(basicNft.address, TOKEN_ID, price)
                    await nftMarketplace.updateListing(basicNft.address, TOKEN_ID, newPrice)
                    const listings = await nftMarketplace.getListings(basicNft.address, TOKEN_ID)
                    assert.equal(listings.price.toString(), newPrice.toString())
                })
            })
            describe("withdraw", function () {

                it("don't allow 0 withdraw proceeds", async function () {
                    await expect(nftMarketplace.withdrawProceeds(deployer.address)).to.be.revertedWithCustomError(nftMarketplace, 'NftMarketplace__NoProceedsFound')
                })
                it("withdraws proceeds", async function () {
                    await nftMarketplace.listItem(basicNft.address, TOKEN_ID, price)
                    nftMarketplace = nftMarketplace.connect(player)
                    await nftMarketplace.buyItems(basicNft.address, TOKEN_ID, { value: price })
                    nftMarketplace = nftMarketplace.connect(deployer)

                    const deployerProceedsBefore = await nftMarketplace.getProceeds(deployer.address)
                    const deployerBalanceBefore = await deployer.getBalance()
                    const txResponse = await nftMarketplace.withdrawProceeds(deployer.address)
                    const transactionReceipt = await txResponse.wait(1)
                    const { gasUsed, effectiveGasPrice } = transactionReceipt
                    const gasCost = gasUsed.mul(effectiveGasPrice)
                    const deployerBalanceAfter = await deployer.getBalance()

                    assert(
                        deployerBalanceAfter.add(gasCost).toString() ==
                        deployerProceedsBefore.add(deployerBalanceBefore).toString()
                    )
                })

                // Test case for the withdrawProceeds function when the transaction fails
                it('should revert when the transaction fails', async function () {
                    await nftMarketplace.listItem(basicNft.address, TOKEN_ID, price);
                    nftMarketplace = nftMarketplace.connect(player);
                    await nftMarketplace.buyItems(basicNft.address, TOKEN_ID, { value: price });
                    nftMarketplace = nftMarketplace.connect(deployer);
                  
                    await expect(nftMarketplace.withdrawProceeds(dummyContract.address)).to.be.revertedWithCustomError(nftMarketplace, "NftMarketplace__TransactionFailed");
                  });
                  
            })
        })


    })