import React from "react";

export interface BlockchainReceiptProps {
  services?: any[];
  transaction?: any;
}

export const BlockchainReceipt: React.FC<BlockchainReceiptProps> = ({ transaction }) => {
  return (
    <div className="BlockchainReceipt p-4">
      <h3 className="text-lg font-semibold mb-2">Transaction Details</h3>
      <div className="text-sm">
        <p>Hash: {transaction?.hash || 'N/A'}</p>
        <p>Status: {transaction?.status || 'N/A'}</p>
      </div>
    </div>
  );
};
