import { useEffect, useState } from 'react';
import { useWalletSelector } from '@near-wallet-selector/react-hook';
import styles from '../styles/app.module.css';
import { ConnectWallet } from '../components/ConnectWallet';
import { NetworkId } from '../config';

// Update contract address to the deployed contract
const SUBSCRIPTION_CONTRACT = 'smartcontract3.testnet';

export default function MetaMaskTest() {
  const { signedAccountId, viewFunction, callFunction } = useWalletSelector();
  
  const [nearWallet, setNearWallet] = useState(null);
  const [ethWallet, setEthWallet] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [contractChecked, setContractChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Set login status based on NEAR wallet
    setLoggedIn(!!signedAccountId);
    
    if (signedAccountId) {
      setNearWallet(signedAccountId);
      
      // Only check contract once when wallet connects
      if (!contractChecked) {
        setContractChecked(true);
      }
    }
  }, [signedAccountId, contractChecked]);
  
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
  
  // Function to subscribe by paying NEAR
  const subscribe = async () => {
    if (!signedAccountId) {
      alert("Please connect to NEAR wallet first");
      return;
    }
    
    setShowSpinner(true);
    setErrorMessage('');
    
    try {
      // Use a fixed amount of NEAR (1 NEAR) for subscription to avoid conversion issues
      const depositAmount = "1000000000000000000000000"; // 1 NEAR in yoctoNEAR
      
      // Call the subscribe method with attached deposit
      await callFunction({ 
        contractId: SUBSCRIPTION_CONTRACT, 
        method: 'subscribe',
        args: {},
        deposit: depositAmount
      });
      
      alert("Successfully subscribed!");
    } catch (error) {
      console.error("Error subscribing:", error);
      // Extract the error message from the error object
      let errorMsg = "Failed to subscribe. See console for details.";
      
      if (error.message && error.message.includes("cannot read property 'keyPrefix'")) {
        errorMsg = "The subscription contract has not been initialized properly. Please contact the administrator.";
      }
      
      setErrorMessage(errorMsg);
      alert(errorMsg);
    } finally {
      setShowSpinner(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Subscription Demo</h1>
      
      <div className={styles.walletSection}>
        <ConnectWallet />
        
        {/* Connect to MetaMask section */}
        <div className={styles.metaMaskSection}>
          <h2>Connect to MetaMask (Optional)</h2>
          {!ethWallet ? (
            <button onClick={connectMetaMask} className={styles.button}>
              Connect MetaMask
            </button>
          ) : (
            <div>
              <p>Connected: {ethWallet.substring(0, 6)}...{ethWallet.substring(ethWallet.length - 4)}</p>
              <button onClick={disconnectMetaMask} className={styles.button}>
                Disconnect MetaMask
              </button>
            </div>
          )}
        </div>
      </div>
      
      {loggedIn && (
        <div className={styles.subscriptionSection}>
          <h2>Subscription Details</h2>
          
          <div className={styles.subscriptionInfo}>
            <p>Subscription Price: 1 NEAR</p>
            
            {errorMessage && (
              <div className={styles.errorMessage}>
                <p>⚠️ {errorMessage}</p>
              </div>
            )}
            
            <button 
              onClick={subscribe} 
              className={styles.button}
              disabled={showSpinner}
            >
              {showSpinner ? 'Processing...' : 'Subscribe Now'}
            </button>
            
            <div className={styles.note}>
              <p><small>Note: This will send 1 NEAR to the subscription contract.</small></p>
            </div>
          </div>
        </div>
      )}
      
      {loggedIn && (
        <div className={styles.contractInfo}>
          <h3>Technical Information</h3>
          <p>Contract Address: {SUBSCRIPTION_CONTRACT}</p>
          <p>Network: {NetworkId}</p>
          <p>Connected Account: {signedAccountId}</p>
        </div>
      )}
    </div>
  );
} 