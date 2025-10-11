/**
 * DAO Index - Switch between MongoDB and PostgreSQL
 * Set USE_POSTGRES=true to use PostgreSQL backend
 */

const USE_POSTGRES = process.env.NEXT_PUBLIC_USE_POSTGRES === 'true' || true;

// Categories DAO
export const categoriesDAO = USE_POSTGRES
  ? require('./categoriesDAO-pg').categoriesDAO
  : require('./categoriesDAO').categoriesDAO;

// Services DAO
export const servicesDAO = USE_POSTGRES
  ? require('./servicesDAO-pg').servicesDAO
  : require('./servicesDAO').servicesDAO;

// Transactions DAO
export const transactionsDAO = USE_POSTGRES
  ? require('./transactionsDAO-pg').transactionsDAO
  : require('./transactionsDAO').transactionsDAO;

// Re-export other DAOs (unchanged)
export { identitiesDAO } from './identitiesDAO';
export { experiencesDAO } from './experiencesDAO';
export { notificationsDAO } from './notificationsDAO';

// Export constants
export const MENTORING_CATEGORY_NAME = "Mentoring";
