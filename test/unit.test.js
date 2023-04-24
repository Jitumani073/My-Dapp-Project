const { ethers } = require("hardhat");
const { expect, assert } = require("chai");

describe("Assessment", function () {
  let contractFactory;
  let contract;
  let deployer;
  const sendValue = ethers.utils.parseEther("1");
  beforeEach(async function () {
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    contractFactory = await ethers.getContractFactory("Atm");
    contract = await contractFactory.deploy();
  });

  describe("deposit", async function () {
    it("Value must be 1 ether", async function () {
      await expect(contract.deposit()).to.be.revertedWith(
        `ValueMustBeOneEther`
      );
    });

    it("Updated balance of sender", async function () {
      await contract.deposit({ value: sendValue });
      const bal = await contract.getBalance(deployer.address);
      assert.equal(bal.toString(), sendValue);
      const balContract = await ethers.provider.getBalance(contract.address);
      assert.equal(balContract.toString(), bal.toString());
    });
  });

  describe("withdraw", async function () {
    it("Insufficient balance", async function () {
      await expect(contract.withdraw()).to.be.revertedWith(
        `InsufficientBalance`
      );
    });

    it("Updating balance after withdrawing", async function () {
      await contract.deposit({ value: sendValue });
      await contract.withdraw();
      const bal = await contract.getBalance(deployer.address);
      const contractBal = await ethers.provider.getBalance(contract.address);
      assert.equal(bal.toString(), "0");
      assert.equal(contractBal.toString(), "0");
    });
  });
});
