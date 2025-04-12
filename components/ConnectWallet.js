import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useWalletSelector } from '@near-wallet-selector/react-hook';
import { useSubscription } from '../hooks/useSubscription';
import { useWalletStatus } from '../hooks/useWalletStatus';

// Contract address - can be changed as needed
const SUBSCRIPTION_CONTRACT = 'smartcontract6.testnet';

// Subscription popup component
const SubscriptionPopup = ({ onClose, onSubscribe, isSubscribed, subscriptionPrice, loading, error }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">{isSubscribed ? 'Extend Subscription' : 'Subscription Required'}</h2>
        
        {isSubscribed ? (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
            <p className="text-green-700 font-medium">✅ You have an active subscription</p>
            <p className="text-green-600 mt-1">Extend your subscription by another month.</p>
            <p className="font-medium mt-2">Price: {subscriptionPrice} NEAR / month</p>
          </div>
        ) : (
          <div className="mb-4">
            <p className="mb-2">To access premium features, a subscription is required.</p>
            <p className="font-medium">Price: {subscriptionPrice} NEAR / month</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
            <p className="text-red-700">⚠️ {error}</p>
          </div>
        )}
        
        <div className="flex justify-end space-x-3 mt-6">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
          
          <button 
            onClick={onSubscribe}
            disabled={loading}
            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : isSubscribed ? 'Extend Subscription' : 'Subscribe Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ConnectWallet = () => {
  const [action, setAction] = useState(() => { });
  const [label, setLabel] = useState('Loading...');
  const { signedAccountId, signIn, signOut } = useWalletSelector();
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [previousLoginStatus, setPreviousLoginStatus] = useState(false);
  
  // Use our custom hooks
  const { isLoggedIn, isMetaMaskConnected } = useWalletStatus();
  const { 
    isSubscribed, 
    subscriptionPrice, 
    subscriptionExpiry, 
    loading, 
    error, 
    subscribe, 
    checkSubscriptionStatus 
  } = useSubscription(SUBSCRIPTION_CONTRACT);
  
  // Handle subscription
  const handleSubscribe = async () => {
    try {
      await subscribe();
      alert("Successfully subscribed!");
      setShowSubscriptionPopup(false);
    } catch (error) {
      // Error is already handled in the hook
      console.error("Subscription error:", error);
    }
  };
  
  // Show subscription popup after login
  useEffect(() => {
    if (isLoggedIn && !previousLoginStatus) {
      // User just logged in, check subscription and show popup if needed
      checkSubscriptionStatus().then(isActive => {
        if (!isActive) {
          setShowSubscriptionPopup(true);
        }
      });
    }
    
    setPreviousLoginStatus(isLoggedIn);
  }, [isLoggedIn, previousLoginStatus]);

  useEffect(() => {
    if (signedAccountId) {
      setAction(() => signOut);
      setLabel(`Logout ${signedAccountId}`);
    } else {
      setAction(() => signIn);
      setLabel('Connect Wallet');
    }
  }, [signedAccountId]);

  return (
    <div>
      <div className="flex justify-between items-center space-x-8">
        {/* Subscription status */}
        {isLoggedIn && isSubscribed && (
          <div 
            className="text-sm mr-4 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setShowSubscriptionPopup(true)}
          >
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3" />
              </svg>
              Subscribed
            </span>
            {subscriptionExpiry !== 'N/A' && (
              <p className="mt-1.5 text-xs text-gray-600">
                Expires: {subscriptionExpiry} <span className="ml-1 text-blue-500">(Click to extend)</span>
              </p>
            )}
          </div>
        )}
        
        {/* For non-subscribed users, show a subscribe button */}
        {isLoggedIn && !isSubscribed && (
          <button 
            onClick={() => setShowSubscriptionPopup(true)}//sub button coloru
            className="text-sm px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors mr-4"
          >
            Subscribe
          </button>
        )}
        
        {/* If not logged in, show empty div for spacing */}
        {!isLoggedIn && <div></div>}
        
        <button //
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded transition-colors ml-auto"
          onClick={action}
        >
          {label}
        </button>
      </div>
      
      {/* Subscription popup */}
      {showSubscriptionPopup && (
        <SubscriptionPopup 
          onClose={() => setShowSubscriptionPopup(false)}
          onSubscribe={handleSubscribe}
          isSubscribed={isSubscribed}
          subscriptionPrice={subscriptionPrice}
          loading={loading}
          error={error}
        />
      )}
      
      {isLoggedIn && isMetaMaskConnected && (
        <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p className="text-yellow-700 text-sm">
            ⚠️ You're connected via MetaMask. For best results with NEAR contracts, we recommend using a NEAR native wallet.
          </p>
        </div>
      )}
    </div>
  );
};