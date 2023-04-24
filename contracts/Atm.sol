// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

error ValueMustBeOneEther();
error InsufficientBalance();
error WithdrawFailed();

import "hardhat/console.sol";

contract Atm {
    mapping(address => uint) private balances;

    function deposit() external payable {
        if (msg.value != 1 ether) {
            revert ValueMustBeOneEther();
        }
        balances[msg.sender] += 1 ether;
    }

    function getBalance(address _account) external view returns (uint) {
        return balances[_account];
    }

    function withdraw() external {
        if (balances[msg.sender] < 1 ether) {
            revert InsufficientBalance();
        }
        bool send = payable(msg.sender).send(1 ether);
        if (!send) {
            revert WithdrawFailed();
        }
        balances[msg.sender] -= 1 ether;
    }

    fallback() external payable {
        console.log("-----fallback:", msg.value);
    }

    receive() external payable {
        console.log("-----receive:", msg.value);
    }
}
