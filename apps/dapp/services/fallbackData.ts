/**
 * Données de fallback pour mode offline
 * Utilisées quand l'API est indisponible
 */

export const FALLBACK_METRICS = {
  usersCount: {
    alumnis: 0,
    students: 0,
    total: 0,
  },
  interactionsCount: 0,
  tokensSupply: 0,
  tokensExchanged: 0,
  txsCount: 0,
};

export const FALLBACK_USER_METRICS = {
  tokensEarned: 0,
  tokensSpent: 0,
  servicesProvided: 0,
  servicesReceived: 0,
  balance: 0,
};

export const FALLBACK_NOTIFICATIONS = [];

export const FALLBACK_SERVICES = [];

export const FALLBACK_USER_ABOUT = '';

export const FALLBACK_DASHBOARD_ACCESS = {
  dashboardAccessCount: 2, // > 1 pour ne pas afficher la modal de première visite
};
