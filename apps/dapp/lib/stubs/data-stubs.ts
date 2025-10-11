// Stubs pour remplacer les imports DAO en production
// =================================================

export const identitiesDAO = {
  getAllUsers: async () => [],
  getUserById: async (id: string) => null,
  getUserByEmail: async (email: string) => ({
    id: '1',
    email,
    isOnboarded: true,
    role: 'STUDENT',
  }),
  getById: async (id: string) => ({
    id,
    isOnboarded: true,
    role: 'STUDENT',
  }),
};

export const dbConnect = async () => {
  // Stub pour la connexion DB
  return Promise.resolve();
};

export const categoriesDAO = {
  getByName: async (name: string) => null,
};
