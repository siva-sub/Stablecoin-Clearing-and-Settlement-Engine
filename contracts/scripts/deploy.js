const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // 1. Deploy Mock USDC
    const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();
    console.log("MockUSDC deployed to:", await usdc.getAddress());

    // 2. Deploy Settlement
    const Settlement = await hre.ethers.getContractFactory("Settlement");
    const settlement = await Settlement.deploy(await usdc.getAddress());
    await settlement.waitForDeployment();
    console.log("Settlement deployed to:", await settlement.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
