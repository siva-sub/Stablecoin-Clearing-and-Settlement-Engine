const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Settlement Logic", function () {
    let usdc, settlement;
    let owner, bankA, bankB, bankC;

    beforeEach(async function () {
        [owner, bankA, bankB, bankC] = await ethers.getSigners();

        // Deploy
        const MockUSDC = await ethers.getContractFactory("MockUSDC");
        usdc = await MockUSDC.deploy();
        await usdc.waitForDeployment();

        const Settlement = await ethers.getContractFactory("Settlement");
        settlement = await Settlement.deploy(await usdc.getAddress());
        await settlement.waitForDeployment();

        // Mint initial balances (1000 each)
        await usdc.mint(bankA.address, 1000 * 10 ** 6);
        await usdc.mint(bankB.address, 1000 * 10 ** 6);
        await usdc.mint(bankC.address, 1000 * 10 ** 6);
    });

    it("Should settle a batch transfer correctly", async function () {
        // Scenario: Bank A pays Bank B 100 USDC via Settlement
        const amount = 100 * 10 ** 6;

        // 1. Bank A must approve the Settlement Contract
        await usdc.connect(bankA).approve(await settlement.getAddress(), amount);

        // 2. Owner executes settlement
        // settleBatch([BankA], [100], [BankB], [100])
        await expect(
            settlement.settleBatch(
                [bankA.address],
                [amount],
                [bankB.address],
                [amount]
            )
        ).to.emit(settlement, 'BatchSettled');

        // 3. Verify Balances
        expect(await usdc.balanceOf(bankA.address)).to.equal((1000 - 100) * 10 ** 6);
        expect(await usdc.balanceOf(bankB.address)).to.equal((1000 + 100) * 10 ** 6);
    });

    it("Should fail if Debtor has not approved", async function () {
        const amount = 100 * 10 ** 6;
        // Bank A does NOT approve

        await expect(
            settlement.settleBatch(
                [bankA.address],
                [amount],
                [bankB.address],
                [amount]
            )
        ).to.be.reverted;
    });

    it("Should fail if Insolvent (Debits < Credits)", async function () {
        const amountIn = 100 * 10 ** 6;
        const amountOut = 200 * 10 ** 6; // Trying to pay out more than collected

        await usdc.connect(bankA).approve(await settlement.getAddress(), amountIn);

        await expect(
            settlement.settleBatch(
                [bankA.address],
                [amountIn],
                [bankB.address],
                [amountOut]
            )
        ).to.be.reverted;
    });
});
