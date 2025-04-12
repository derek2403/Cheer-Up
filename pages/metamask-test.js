import { useEffect, useState } from 'react';
import { useWalletSelector } from '@near-wallet-selector/react-hook';
import { ConnectWallet } from '../components/ConnectWallet';
import { NetworkId } from '../config';

// Update contract address to the deployed contract
const SUBSCRIPTION_CONTRACT = 'smartcontract3.testnet';

export default function MetaMaskTest() {
  const { signedAccountId, viewFunction, callFunction, activeWalletId } = useWalletSelector();
  
  const [loggedIn, setLoggedIn] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [contractChecked, setContractChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);

  useEffect(() => {
    // Set login status based on NEAR wallet
    setLoggedIn(!!signedAccountId);
    
    if (signedAccountId) {
      // Only check contract once when wallet connects
      if (!contractChecked) {
        setContractChecked(true);
      }
      
      // Check if connected via MetaMask
      setIsMetaMaskConnected(activeWalletId?.includes('ethereum'));
    }
  }, [signedAccountId, contractChecked, activeWalletId]);
  
  // Function to subscribe by paying NEAR
  const subscribe = async () => {
    if (!signedAccountId) {
      alert("Please connect your wallet first");
      return;
    }
    
    // Check if using MetaMask and show warning
    if (isMetaMaskConnected) {
      alert("MetaMask is connected, but direct contract calls may not work correctly. For best results, use a NEAR native wallet like MyNearWallet.");
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
      } else if (error.message && error.message.includes("External transactions to internal accounts cannot include data")) {
        errorMsg = "MetaMask cannot directly call NEAR contracts. Please use a NEAR native wallet instead.";
      }
      
      setErrorMessage(errorMsg);
      alert(errorMsg);
    } finally {
      setShowSpinner(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Subscription Demo</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <ConnectWallet />
        
        {isMetaMaskConnected && (
          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <p className="text-yellow-700">
              ⚠️ You're connected via MetaMask. For best results with NEAR contracts, we recommend using a NEAR native wallet like MyNearWallet.
            </p>
          </div>
        )}
      </div>
      
      {loggedIn && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Subscription Details</h2>
          
          <div className="mb-6">
            <p className="text-lg mb-2">Subscription Price: 1 NEAR</p>
            
            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
                <p className="text-red-700">⚠️ {errorMessage}</p>
              </div>
            )}
            
            <button 
              onClick={subscribe} 
              className={`bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors ${showSpinner ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={showSpinner}
            >
              {showSpinner ? 'Processing...' : 'Subscribe Now'}
            </button>
            
            <div className="mt-4 bg-gray-50 p-3 rounded text-gray-600 text-sm">
              <p>Note: This will send 1 NEAR to the subscription contract.</p>
            </div>
          </div>
        </div>
      )}
      
      {loggedIn && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-3">Technical Information</h3>
          <p className="mb-2"><span className="font-medium">Contract Address:</span> {SUBSCRIPTION_CONTRACT}</p>
          <p className="mb-2"><span className="font-medium">Network:</span> {NetworkId}</p>
          <p className="mb-2"><span className="font-medium">Connected Account:</span> {signedAccountId}</p>
          <p className="mb-2"><span className="font-medium">Wallet Type:</span> {isMetaMaskConnected ? 'MetaMask (Ethereum)' : 'NEAR Native Wallet'}</p>
        </div>
      )}
    </div>
  );
} 