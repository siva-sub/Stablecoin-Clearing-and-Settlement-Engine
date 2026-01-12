// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Settlement {
    IERC20 public usdc;
    address public owner;

    event BatchSettled(uint256 totalVolume, uint256 timestamp);

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
        owner = msg.sender;
    }

    function settleBatch(
        address[] calldata debtors,
        uint256[] calldata debitAmounts,
        address[] calldata creditors,
        uint256[] calldata creditAmounts
    ) external {
        require(msg.sender == owner, "Only owner can settle");
        require(debtors.length == debitAmounts.length, "Debtors mismatch");
        require(creditors.length == creditAmounts.length, "Creditors mismatch");

        uint256 totalIn = 0;
        uint256 totalOut = 0;

        for (uint256 i = 0; i < debtors.length; i++) {
            uint256 amount = debitAmounts[i];
            if (amount > 0) {
                bool success = usdc.transferFrom(debtors[i], address(this), amount);
                require(success, "Transfer from debtor failed");
                totalIn += amount;
            }
        }

        for (uint256 i = 0; i < creditors.length; i++) {
            uint256 amount = creditAmounts[i];
            if (amount > 0) {
                bool success = usdc.transfer(creditors[i], amount);
                require(success, "Transfer to creditor failed");
                totalOut += amount;
            }
        }

        require(totalIn >= totalOut, "Insolvent cycle: Debits < Credits");
        emit BatchSettled(totalOut, block.timestamp);
    }
}
