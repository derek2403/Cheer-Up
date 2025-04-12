import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useWalletSelector } from '@near-wallet-selector/react-hook';
import { useSubscription } from '../hooks/useSubscription';
import { useWalletStatus } from '../hooks/useWalletStatus';
import Portal from './Portal';

// Contract address - can be changed as needed
const SUBSCRIPTION_CONTRACT = 'smartcontract6.testnet';

// Subscription popup component
const SubscriptionPopup = ({ onClose, onSubscribe, isSubscribed, subscriptionPrice, loading, error }) => {
  useEffect(() => {
    // Prevent background scrolling when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black bg-opacity-70 modal-backdrop modal-container subscription-modal" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 animate-fadeIn" style={{ position: 'relative', margin: 'auto', maxWidth: '500px' }}>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">{isSubscribed ? 'Extend Subscription' : 'Subscription Required'}</h2>
        
        {isSubscribed ? (
          <div className="bg-green-50 border-l-4 border-green-500 p-5 mb-6 rounded-r">
            <p className="text-green-700 font-medium">✅ You have an active subscription</p>
            <p className="text-green-600 mt-2">Extend your subscription by another month.</p>
            <p className="font-medium mt-3">Price: {subscriptionPrice} NEAR / month</p>
          </div>
        ) : (
          <div className="mb-6 p-5 bg-blue-50 rounded-lg border border-blue-100">
            <p className="mb-3 text-gray-700 text-lg">To access premium features, a subscription is required.</p>
            <p className="font-medium text-xl text-blue-800">Price: {subscriptionPrice} NEAR / month</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-5 my-6 rounded-r">
            <p className="text-red-700">⚠️ {error}</p>
          </div>
        )}
        
        <div className="flex justify-end space-x-4 mt-8">
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
          
          <button 
            onClick={onSubscribe}
            disabled={loading}
            className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 btn-hover-effect ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : isSubscribed ? 'Extend Subscription' : 'Subscribe Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ConnectWallet = () => {
  // Added to fix hydration issues
  const [isMounted, setIsMounted] = useState(false);
  
  const [action, setAction] = useState(() => { });
  const [label, setLabel] = useState('Connect Wallet'); // Default label for SSR
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [previousLoginStatus, setPreviousLoginStatus] = useState(false);
  
  // Use our custom hooks - only on client side
  const walletSelector = typeof window !== 'undefined' ? useWalletSelector() : { signedAccountId: null, signIn: () => {}, signOut: () => {} };
  const { signedAccountId, signIn, signOut } = walletSelector;
  
  // Use custom hooks with client-side detection
  const walletStatus = typeof window !== 'undefined' ? useWalletStatus() : { isLoggedIn: false, isMetaMaskConnected: false };
  const { isLoggedIn, isMetaMaskConnected } = walletStatus;
  
  const subscriptionData = typeof window !== 'undefined' ? useSubscription(SUBSCRIPTION_CONTRACT) : {
    isSubscribed: false,
    subscriptionPrice: '0',
    subscriptionExpiry: 'N/A',
    loading: false,
    error: null,
    subscribe: async () => {},
    checkSubscriptionStatus: async () => false
  };
  
  const { 
    isSubscribed, 
    subscriptionPrice, 
    subscriptionExpiry, 
    loading, 
    error, 
    subscribe, 
    checkSubscriptionStatus 
  } = subscriptionData;
  
  // Handle subscription
  const handleSubscribe = async () => {
    if (!isMounted) return;
    
    try {
      await subscribe();
      alert("Successfully subscribed!");
      setShowSubscriptionPopup(false);
    } catch (error) {
      // Error is already handled in the hook
      console.error("Subscription error:", error);
    }
  };
  
  // Close modal on escape key
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && showSubscriptionPopup) {
        setShowSubscriptionPopup(false);
      }
    };

    if (showSubscriptionPopup) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showSubscriptionPopup]);
  
  // Mark component as mounted for client-side only features
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Show subscription popup after login - client-side only
  useEffect(() => {
    if (!isMounted) return;
    
    if (isLoggedIn && !previousLoginStatus) {
      // User just logged in, check subscription and show popup if needed
      checkSubscriptionStatus().then(isActive => {
        if (!isActive) {
          setShowSubscriptionPopup(true);
        }
      });
    }
    
    setPreviousLoginStatus(isLoggedIn);
  }, [isLoggedIn, previousLoginStatus, isMounted]);

  // Update wallet connection info - client-side only
  useEffect(() => {
    if (!isMounted) return;
    
    if (signedAccountId) {
      setAction(() => signOut);
      setLabel(`Logout ${signedAccountId}`);
      
      // Show subscription popup immediately after login if not subscribed
      checkSubscriptionStatus().then(isActive => {
        if (!isActive) {
          setShowSubscriptionPopup(true);
        }
      });
    } else {
      setAction(() => signIn);
      setLabel('Connect Wallet');
    }
  }, [signedAccountId, isMounted]);

  // Simple static render for SSR
  if (!isMounted) {
    return (
      <div>
        <div className="flex justify-between items-center space-x-8">
          <div></div>
          <button
            className="text-white font-medium py-2 px-5 rounded-full transition-all duration-300 flex items-center gap-2"
          >
            Connect Wallet
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 8V6C14 5.46957 13.7893 4.96086 13.4142 4.58579C13.0391 4.21071 12.5304 4 12 4H5C4.46957 4 3.96086 4.21071 3.58579 4.58579C3.21071 4.96086 3 5.46957 3 6V18C3 18.5304 3.21071 19.0391 3.58579 19.4142C3.96086 19.7893 4.46957 20 5 20H12C12.5304 20 13.0391 19.7893 13.4142 19.4142C13.7893 19.0391 14 18.5304 14 18V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 12H21M21 12L18 9M21 12L18 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Client-side render
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
            onClick={() => setShowSubscriptionPopup(true)}
            className="text-sm px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded transition-colors mr-4"
          >
            Subscribe
          </button>
        )}
        
        {/* If not logged in, show empty div for spacing */}
        {!isLoggedIn && <div></div>}
        
        <button
          className="text-white font-medium py-2 px-5 rounded-full transition-all duration-300 flex items-center gap-2"
          onClick={action}
        >
          {label}
          {!isLoggedIn && (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 8V6C14 5.46957 13.7893 4.96086 13.4142 4.58579C13.0391 4.21071 12.5304 4 12 4H5C4.46957 4 3.96086 4.21071 3.58579 4.58579C3.21071 4.96086 3 5.46957 3 6V18C3 18.5304 3.21071 19.0391 3.58579 19.4142C3.96086 19.7893 4.46957 20 5 20H12C12.5304 20 13.0391 19.7893 13.4142 19.4142C13.7893 19.0391 14 18.5304 14 18V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 12H21M21 12L18 9M21 12L18 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
      
      {/* Subscription popup - use Portal component to ensure proper positioning */}
      {showSubscriptionPopup && (
        <Portal>
          <SubscriptionPopup 
            onClose={() => setShowSubscriptionPopup(false)}
            onSubscribe={handleSubscribe}
            isSubscribed={isSubscribed}
            subscriptionPrice={subscriptionPrice}
            loading={loading}
            error={error}
          />
        </Portal>
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