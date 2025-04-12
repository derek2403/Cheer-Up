import { useEffect, useState } from 'react';
import { useWalletSelector } from '@near-wallet-selector/react-hook';
import styles from '../styles/app.module.css';
import { HelloNearContract } from '../config';
import { Navigation } from '../components/navigation';

export default function MetaMaskTest() {
  const { signedAccountId, viewFunction, callFunction, signIn, signOut } = useWalletSelector();
  
  const [nearWallet, setNearWallet] = useState(null);
  const [ethWallet, setEthWallet] = useState(null);
  const [greeting, setGreeting] = useState('loading...');
  const [newGreeting, setNewGreeting] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    // Set login status based on NEAR wallet
    setLoggedIn(!!signedAccountId);
    
    if (signedAccountId) {
      setNearWallet(signedAccountId);
    }
    
    // Get greeting from contract
    viewFunction({ contractId: HelloNearContract, method: 'get_greeting' })
      .then((greeting) => setGreeting(greeting))
      .catch(err => console.error("Error fetching greeting:", err));
  }, [signedAccountId]);
  
  // Function to connect to MetaMask
  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setEthWallet(accounts[0]);
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          setEthWallet(accounts[0] || null);
        });
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      alert("MetaMask is not installed. Please install it to use this feature.");
    }
  };
  
  // Function to disconnect from MetaMask
  const disconnectMetaMask = async () => {
    setEthWallet(null);
  };
  
  // Function to save greeting to NEAR contract
  const saveGreeting = async () => {
    if (!signedAccountId) {
      alert("Please connect to NEAR wallet first");
      return;
    }
    
    setShowSpinner(true);
    
    try {
      // Call the contract
      await callFunction({ 
        contractId: HelloNearContract, 
        method: 'set_greeting', 
        args: { greeting: newGreeting } 
      });
      
      // Update the UI
      const updatedGreeting = await viewFunction({ 
        contractId: HelloNearContract, 
        method: 'get_greeting' 
      });
      
      setGreeting(updatedGreeting);
      setNewGreeting('');
    } catch (error) {
      console.error("Error saving greeting:", error);
      alert("Failed to save greeting. See console for details.");
    } finally {
      setShowSpinner(false);
    }
  };

  return (
    <>
      <Navigation />
      <main className={styles.main}>
        <div className={styles.description}>
          <h1>Wallet Integration Test Page</h1>
          <p>
            Interacting with the contract: &nbsp;
            <code className={styles.code}>{HelloNearContract}</code>
          </p>
        </div>

        <div className="container py-4">
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">NEAR Wallet</div>
                <div className="card-body">
                  {nearWallet ? (
                    <>
                      <p>Connected: <code>{nearWallet}</code></p>
                      <button className="btn btn-danger" onClick={signOut}>Disconnect</button>
                    </>
                  ) : (
                    <button className="btn btn-primary" onClick={signIn}>Connect NEAR Wallet</button>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">Ethereum Wallet (MetaMask)</div>
                <div className="card-body">
                  {ethWallet ? (
                    <>
                      <p>Connected: <code>{ethWallet}</code></p>
                      <button className="btn btn-danger" onClick={disconnectMetaMask}>Disconnect</button>
                    </>
                  ) : (
                    <button className="btn btn-primary" onClick={connectMetaMask}>Connect MetaMask</button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="card mb-4">
            <div className="card-header">Contract Interaction</div>
            <div className="card-body">
              <h3>The contract says: <code>{greeting}</code></h3>
              
              <div className="input-group mt-3" hidden={!loggedIn}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Store a new greeting"
                  value={newGreeting}
                  onChange={(e) => setNewGreeting(e.target.value)}
                />
                <div className="input-group-append">
                  <button className="btn btn-secondary" onClick={saveGreeting} disabled={showSpinner}>
                    {showSpinner ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      'Save'
                    )}
                  </button>
                </div>
              </div>
              
              {!loggedIn && (
                <div className="alert alert-warning mt-3">
                  Please connect to NEAR wallet to interact with the contract
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 