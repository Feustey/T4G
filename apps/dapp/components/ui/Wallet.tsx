import React from "react";

export interface WalletProps {
  user?: any;
  balance?: number;
  address?: string;
  userRole?: string;
  variant?: string;
}

export const Wallet: React.FC<WalletProps> = ({ user, balance }) => {
  return (
    <div className="Wallet p-4 border rounded">
      <h3 className="text-lg font-semibold mb-2">Wallet</h3>
      <p>Balance: {balance ?? user?.balance ?? 0} tokens</p>
    </div>
  );
};
