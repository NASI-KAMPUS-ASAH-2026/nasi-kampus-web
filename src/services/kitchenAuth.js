// Pengelolaan sesi portal Tim Dapur Nasi Kampus Samarinda.
const KEY = 'nk_kitchen_session';

export const kitchenAuth = {
  isAuthenticated: () => {
    try {
      return sessionStorage.getItem(KEY) === '1';
    } catch {
      return false;
    }
  },
  login: () => {
    try {
      sessionStorage.setItem(KEY, '1');
    } catch {
      /* abaikan */
    }
  },
  logout: () => {
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* abaikan */
    }
  },
};
