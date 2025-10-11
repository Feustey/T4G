// Composant Wallet Dazno intégré avec Token4Good
// Affiche les soldes T4G et Lightning, permet les opérations

import React, { useState, useCallback } from 'react';
import { useDazno, useLightningTransactions } from '../../hooks/useDazno';
import { LangType } from 'apps/dapp/types'; // Assurez-vous que LangType est importé

// --- Props ---
interface DaznoWalletProps {
  userId: string;
  userRole?: string;
  lang: LangType; // Ajout de la prop lang pour l'i18n
}

// --- Composant Principal ---
export const DaznoWallet: React.FC<DaznoWalletProps> = ({ userId, userRole, lang }) => {
  const {
    isAuthenticated,
    userProfile,
    t4gBalance,
    lightningBalance,
    loading,
    error,
    createInvoice,
    payInvoice,
    addPoints,
    refreshData,
    clearError,
    setError, // Supposant que useDazno expose setError
  } = useDazno(userId);

  const { transactions, loading: txLoading } = useLightningTransactions(userId);

  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [showPayInvoice, setShowPayInvoice] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDescription, setInvoiceDescription] = useState('');
  const [paymentRequest, setPaymentRequest] = useState('');

  const handleNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000); // Disparaît après 5s
  };

  const formatMsat = useCallback((msat: number) => {
    const sats = msat / 1000;
    return `${sats.toLocaleString()} ${lang.utils.sats}`; // i18n
  }, [lang]);

  const handleCreateInvoice = async () => {
    const amount = parseInt(invoiceAmount);
    if (isNaN(amount) || amount <= 0) {
      handleNotification('Invalid amount', 'error');
      return;
    }
    try {
      await createInvoice(amount, invoiceDescription);
      handleNotification('Invoice created successfully');
      setShowCreateInvoice(false);
      setInvoiceAmount('');
      setInvoiceDescription('');
    } catch (error) {
      handleNotification('Failed to create invoice', 'error');
    }
  };

  const handlePayInvoice = async () => {
    if (!paymentRequest.trim()) {
      handleNotification('Payment request is required', 'error');
      return;
    }
    try {
      await payInvoice(paymentRequest);
      handleNotification('Payment sent successfully');
      setShowPayInvoice(false);
      setPaymentRequest('');
    } catch (error) {
      handleNotification('Failed to send payment', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="dazno-wallet bg-gray-100 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Dazno Wallet</h3>
        <p className="text-gray-600">Not connected</p>
      </div>
    );
  }

  return (
    <div className="dazno-wallet bg-white shadow-lg rounded-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">
          ⚡ Dazno Wallet
        </h3>
        <button
          onClick={refreshData}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          disabled={Object.values(loading).some(Boolean)}
        >
          🔄 {loading.auth ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`p-3 rounded mb-4 text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {notification.message}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex justify-between">
            <span>{error}</span>
            <button onClick={clearError} className="font-bold">×</button>
          </div>
        </div>
      )}

      {/* Profil utilisateur */}
      {userProfile && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-semibold text-gray-700 mb-2">Profil Dazno</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Nom:</strong> {userProfile.name}
            </div>
            <div>
              <strong>Email:</strong> {userProfile.email}
            </div>
            <div>
              <strong>Réputation:</strong> {userProfile.reputation_score}
            </div>
            <div>
              <strong>Niveau:</strong> {userProfile.gamification_level}
            </div>
          </div>
        </div>
      )}

      {/* Soldes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Solde T4G */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">🪙 Tokens T4G</h4>
          {loading.t4gBalance ? (
            <div className="animate-pulse">Chargement...</div>
          ) : t4gBalance ? (
            <div>
              <div className="text-2xl font-bold text-green-600">
                {t4gBalance.t4g_balance.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                Mis à jour: {new Date(t4gBalance.last_updated).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Non disponible</div>
          )}
        </div>

        {/* Solde Lightning */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">⚡ Lightning</h4>
          {loading.lightningBalance ? (
            <div className="animate-pulse">Chargement...</div>
          ) : lightningBalance ? (
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {formatMsat(lightningBalance.balance_msat)}
              </div>
              <div className="text-sm">
                <div>En attente: {formatMsat(lightningBalance.pending_msat)}</div>
                <div>Réservé: {formatMsat(lightningBalance.reserved_msat)}</div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Non disponible</div>
          )}
        </div>
      </div>

      {/* Actions Lightning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={() => setShowCreateInvoice(true)}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium"
        >
          📄 Create Invoice
        </button>
        <button
          onClick={() => setShowPayInvoice(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-medium"
        >
          💸 Pay Invoice
        </button>
      </div>
      
      {/* Gamification (pour les mentors) */}
      {userRole === 'mentor' && (
        <div className="bg-purple-50 p-4 rounded-lg mb-6">
          <h4 className="font-semibold text-purple-800 mb-2">🎮 Gamification</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => addPoints(10, 'session_completed')}
              className="bg-purple-500 hover:bg-purple-600 text-white py-1 px-3 rounded text-sm"
            >
              +10 pts (Session)
            </button>
            <button
              onClick={() => addPoints(5, 'help_provided')}
              className="bg-purple-500 hover:bg-purple-600 text-white py-1 px-3 rounded text-sm"
            >
              +5 pts (Aide)
            </button>
          </div>
        </div>
      )}

      {/* Transactions récentes */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-3">📊 Transactions récentes</h4>
        {txLoading ? (
          <div className="animate-pulse">Chargement des transactions...</div>
        ) : transactions.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex justify-between items-center p-2 bg-white rounded">
                <div>
                  <div className="font-medium text-sm">
                    {tx.transaction_type === 'invoice' ? '📥' : '📤'} {tx.description}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(tx.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${tx.transaction_type === 'invoice' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.transaction_type === 'invoice' ? '+' : '-'}{formatMsat(tx.amount_msat)}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    tx.status === 'settled' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {tx.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-4">Aucune transaction</div>
        )}
      </div>

      {/* Modal Créer Invoice */}
      {showCreateInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Create Lightning Invoice</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant (sats)
                </label>
                <input
                  type="number"
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="ex: 1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={invoiceDescription}
                  onChange={(e) => setInvoiceDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="ex: Paiement mentoring"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateInvoice}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
                >
                  Créer
                </button>
                <button
                  onClick={() => setShowCreateInvoice(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Payer Invoice */}
      {showPayInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Payer une Invoice Lightning</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Request
                </label>
                <textarea
                  value={paymentRequest}
                  onChange={(e) => setPaymentRequest(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg h-20"
                  placeholder="lnbc..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePayInvoice}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
                >
                  Payer
                </button>
                <button
                  onClick={() => setShowPayInvoice(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// --- Composant Modal: CreateInvoiceModal ---
interface CreateInvoiceModalProps {
  lang: LangType;
  createInvoice: (amount: number, description: string) => Promise<any>;
  onClose: () => void;
  onSuccess: (invoice: any) => void;
  onError: (error: any) => void;
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({ lang, createInvoice, onClose, onSuccess, onError }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      onError(new Error('Invalid amount'));
      return;
    }

    setIsSubmitting(true);
    try {
      const invoice = await createInvoice(numAmount, description);
      onSuccess(invoice);
      onClose();
    } catch (err) {
      onError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h3 className="text-lg font-semibold mb-4">Create Lightning Invoice</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant (sats)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="ex: 1000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="ex: Paiement mentoring"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex-1 py-2 rounded-lg font-medium ${isSubmitting ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600 text-white'}`}
            >
              {isSubmitting ? 'Loading...' : 'Create'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Composant Modal: PayInvoiceModal ---
// (Structure similaire à CreateInvoiceModal)
interface PayInvoiceModalProps {
    lang: LangType;
    payInvoice: (paymentRequest: string) => Promise<any>;
    onClose: () => void;
    onSuccess: (payment: any) => void;
    onError: (error: any) => void;
}

const PayInvoiceModal: React.FC<PayInvoiceModalProps> = ({ lang, payInvoice, onClose, onSuccess, onError }) => {
    const [paymentRequest, setPaymentRequest] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!paymentRequest.trim()) {
            onError(new Error('Payment request is required'));
            return;
        }

        setIsSubmitting(true);
        try {
            const payment = await payInvoice(paymentRequest);
            onSuccess(payment);
            onClose();
        } catch (err) {
            onError(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
                <h3 className="text-lg font-semibold mb-4">Pay Lightning Invoice</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Payment Request
                        </label>
                        <textarea
                            value={paymentRequest}
                            onChange={(e) => setPaymentRequest(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg h-20"
                            placeholder="lnbc..."
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`flex-1 py-2 rounded-lg font-medium ${isSubmitting ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                        >
                            {isSubmitting ? 'Loading...' : 'Pay'}
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};