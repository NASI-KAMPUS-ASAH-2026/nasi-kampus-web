// Pengelolaan sesi portal pemilik Nasi Kampus Samarinda.
const KEY = 'nk_owner_session';

export const ownerAuth = {
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
