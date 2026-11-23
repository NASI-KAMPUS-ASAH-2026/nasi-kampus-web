// Pengelolaan sesi portal admin Nasi Kampus Samarinda.
const KEY = 'nk_admin_session';

export const adminAuth = {
  isAuthenticated: () => {
    try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; }
  },
  login: () => {
    try { sessionStorage.setItem(KEY, '1'); } catch { /* abaikan */ }
  },
  logout: () => {
    try { sessionStorage.removeItem(KEY); } catch { /* abaikan */ }
  },
};
