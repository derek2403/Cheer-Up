import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useWalletSelector } from '@near-wallet-selector/react-hook';

export const ConnectWallet = () => {
  const [action, setAction] = useState(() => { });
  const [label, setLabel] = useState('Loading...');
  const { signedAccountId, signIn, signOut } = useWalletSelector();

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
      <button 
        className=" text-white font-medium py-2 px-4 rounded"
        onClick={action}
      >
        {label}
      </button>
    </div>
  );
}; 