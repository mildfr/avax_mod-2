import {useState, useEffect} from "react";
import {ethers} from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  
  // Integration
  const [selectedAccount, setSelectedAccount] = useState(undefined);
  const [accounts, setAccounts] = useState([]); 
  const [transactionHistory, setTransacionHistory] = useState([]);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async() => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({method: "eth_accounts"});
      handleAccounts(accounts);
    }
  }

  const handleAccounts = (accounts) => {
    if (accounts && accounts.length>0) {
      console.log ("Account connected: ", accounts);
      setAccounts(accounts);
      setSelectedAccount(accounts[0]);
    }
    else {
      console.log("No account found");
      setAccounts([]);
      setSelectedAccount(undefined);
    }
  }

  const connectAccount = async() => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }
  
    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccounts(accounts);
    
    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  }

  const handleAccountSelection = (account) => {
    setSelectedAccount(account);
  }

  
  const getBalance = async() => {
    if (atm) {
      console.log(atm);
      setBalance((await atm.getBalance()).toNumber());
    }
  }


// Integration!

  const getTransactionHistory = async () => {
    if (atm) {
      const historyLength = await atm.getEventHistoryLength();
      const history = [];
      for (let i = 0; i < historyLength; i++) {
        const transaction = await atm.getTransaction(i);

        const timestamp = transaction[2].toString();
        const date = new Date(timestamp * 1000); 
        const formattedDate = date.toLocaleString(); 

        history.push({
          sender: transaction[0],
          amount: transaction[1].toString(),
          timestamp: formattedDate
        });
      }
      setTransacionHistory(history);
    }
  };

  

  const deposit = async() => {
    if (atm && setSelectedAccount) {
      let tx = await atm.deposit(1);
      await tx.wait()
      getBalance();
      getTransactionHistory();
    }
  }

  const withdraw = async() => {
    if (atm && setSelectedAccount) {
      let tx = await atm.withdraw(1);
      await tx.wait()
      getTransactionHistory();
    }
  }




  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p> install Metamask in order to use this Wallet.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!selectedAccount) {
      return <button onClick={connectAccount} style={{height: "5vh", width: "20%", backgroundColor: "#A9A9A9", color: "white", borderRadius: "10px", cursor: "pointer", border: "0px",fontSize:"1rem"}}> connect your Metamask wallet</button>
    }

    if (balance == undefined) {
      getBalance();
    }
    
    return (
      <div style={{height: "auto"}}>
        <h2 style={{ color: "black", fontFamily: "sans-serif" }}>
          Your Account details!
        </h2>
        <div
          style={{
            width: "50%", height: "auto", border: "4px solid blue", borderRadius: "10px", display: "block", padding:"2vh", margin: "auto", position: "relative", backgroundColor: "#A9A9A9", }}
        >
          <h3
            style={{
              fontFamily: "sans-serif", textAlign: "left", margin: "1vh", color: "red", }}
          >
            
            Accounts Connected By You Are:
          </h3>
          {accounts.map((account, id) => (
            <span
              key={account}
              onClick={() => handleAccountSelection(account)}
              style={{
                display: "flex",
                alignItems: "start", margin: "10px", marginLeft: "20px", fontFamily: "system-ui", }}
            >
              {id + 1}. {account} <br />
            </span>
          ))}
        </div>

      <div style={{marginTop: "1vh"}}>
      <button
          style={{
            height: "6vh", width: "20%", margin: "5px 10px", backgroundColor: "#F0E68C", color: "white", borderRadius: "5px", cursor: "pointer", border: "0px", fontSize: "1rem", }}
          onClick={deposit}
        >
          Deposit 1 ETH
        </button>
        <button
          style={{
            height: "6vh", width: "20%", margin: "5px 10px", backgroundColor: "#3CB371", color: "white", borderRadius: "5px", cursor: "pointer", border: "0px", fontSize: "1rem", }}
          onClick={withdraw}
        >
          Withdraw 1 ETH
        </button>
      </div>




        <div style={{padding: "10px"}}>        
        <button
          style={{
            height: "6vh",
            width: "15%", margin: "5px 10px", backgroundColor: "#AFEEEE", color: "white", borderRadius: "5px", cursor: "pointer", border: "0px", fontSize: "1rem",
          }}
          onClick={() => {
            const content = document.getElementById("content");
            const history = document.getElementById("history");
            content.style.display = "block";
            history.style.display = "none";
          }}
        >
          Owner Address
        </button>
        <button
          style={{
            height: "6vh", width: "15%", margin: "10px 20px", backgroundColor: "#	EE82EE", color: "white", borderRadius: "5px", cursor: "pointer", border: "0px", fontSize: "1rem",
          }}
          onClick={() => {
            {
              const content = document.getElementById("content");
              const history = document.getElementById("history");
              content.style.display = "none";
              history.style.display = "block";
            }
          }}
        >
          History
        </button>
        </div>
        <div style={{width: "50%", height: "auto", border: "1px solid black", backgroundColor:"#9ACD32", display: "block", margin: "auto", borderRadius:"10px", border: "dotted"}}>


          <p id="content" style={{padding:"1vh", fontSize: "1.2rem", fontFamily:"monospace"}}> Details ... </p>
          <div id="history" style={{padding:"1vh", fontSize: "1.0rem", fontFamily:"sans-serif", display: "none", textAlign: "left"}}>
          <h3 style={{paddingLeft:"1vh"}}>Transaction History:</h3>
          {transactionHistory.map((transaction, index) => (
            <div key={index} style={{paddingLeft:"1vh"}}>
              <p>Sender: {transaction.sender}</p>
              <p>Amount: {transaction.amount}</p>
              <p>Time: {transaction.timestamp}</p>
            <hr />

            </div>
          ))}
          </div>
        </div>


      </div>
    );
  }

  useEffect(() => {getWallet(); getTransactionHistory()}, []);

  return (
    <main className="container">
      <header><h1 style={{color: "#00FFFF", fontFamily:"Poppins"}}>Welcome to the crafter's wallet!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center
        }
      `}
      </style>
    </main>
  )
}
