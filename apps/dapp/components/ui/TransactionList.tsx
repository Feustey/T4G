import React from "react";

export interface TransactionListProps {
  transactions?: any[];
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions = [] }) => {
  return (
    <div className="TransactionList">
      <h3 className="text-lg font-semibold mb-2">Transactions</h3>
      {transactions.length === 0 ? (
        <p className="text-gray-500">No transactions</p>
      ) : (
        <ul>
          {transactions.map((tx, i) => (
            <li key={i} className="border-b py-2">
              Transaction #{i + 1}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
