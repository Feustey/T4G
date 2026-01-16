import React from "react";

export interface WalletProps {
  user?: any;
}

export const Wallet: React.FC<WalletProps> = ({ user }) => {
  return (
    <div className="Wallet p-4 border rounded">
      <h3 className="text-lg font-semibold mb-2">Wallet</h3>
      <p>Balance: {user?.balance || 0} tokens</p>
    </div>
  );
};
