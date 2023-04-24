import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atmAbi from "./../artifacts/contracts/Atm.sol/Atm.json";

export default function Home() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setAtm] = useState(undefined);
  const [balance, setBalance] = useState("0");

  const atmABI = atmAbi.abi;
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // Listen for account changes
  useEffect(() => {
    window.ethereum.on("accountsChanged", handleAccountChanged);
    getBalance();
  }, []);

  useEffect(() => {
    getWallet();
    getBalance();
    // eslint-disable-next-line
  }, [balance]);

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    getAtmContract();
  };

  const handleAccountChanged = (newAccount) => {
    if (newAccount) {
      console.log("Account changed: ", newAccount);
      setAccount(newAccount);
    }
  };

  const getAtmContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setAtm(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      const bal = await atm.getBalance(account[0]);
      setBalance(ethers.utils.formatUnits(bal, "ether").toString());
    }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit({ value: ethers.utils.parseEther("1") });
      await tx.wait(1);
      // checking ether sent to contract or not
      const provider = new ethers.providers.Web3Provider(ethWallet);
      const contractBal = await provider.getBalance(contractAddress);
      console.log(contractBal.toString());
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw();
      await tx.wait();
      // checking ether withdraw from contract or not
      const provider = new ethers.providers.Web3Provider(ethWallet);
      const contractBal = await provider.getBalance(contractAddress);
      console.log(contractBal.toString());
      getBalance();
    }
  };

  const initUser = () => {
    // Check MetaMask is present or not
    if (!ethWallet) {
      return <p>Please install MetaMask in order to use this ATM.</p>;
    }

    //Check account is connected or not
    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your Metamask wallet
        </button>
      );
    }

    if (balance === "0") {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button onClick={deposit}> Deposit 1 ETH </button>
        <button onClick={withdraw}> Withdraw 1 ETH </button>
      </div>
    );
  };

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx="true">{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
