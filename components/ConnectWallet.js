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
      setLabel('Login');
    }
  }, [signedAccountId]);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <div className="navbar-nav ml-auto">
          <button className="btn btn-outline-primary ms-2" onClick={action}>
            {label}
          </button>
        </div>
      </div>
    </nav>
  );
}; 