const { ethers } = require("ethers");

async function main() {
    const wallet = ethers.Wallet.createRandom();
    console.log("==================================================");
    console.log("NEW TESTNET WALLET GENERATED");
    console.log("==================================================");
    console.log("Address:    ", wallet.address);
    console.log("Private Key:", wallet.privateKey);
    console.log("==================================================");
    console.log("WARNING: USE THIS FOR TESTNET ONLY. DO NOT SEND REAL FUNDS.");
    console.log("==================================================");
}

main();
