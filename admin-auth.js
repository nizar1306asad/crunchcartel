// Admin Authentication & Password Management for Crunch Cartel
(function() {
  const STORAGE_KEY = 'crunch_cartel_admin_hash';
  const SESSION_KEY = 'crunch_cartel_admin_session';
  const DEFAULT_HASH = '99748c302874730aa073e29c29c6f00d99c24a86e91fbb307d6e61808f3f4ea3'; // Cartel@2026

  async function sha256(text) {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  function getStoredHash() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_HASH;
  }

  function setStoredHash(hash) {
    localStorage.setItem(STORAGE_KEY, hash);
  }

  function isAuthenticated() {
    return sessionStorage.getItem(SESSION_KEY) === 'authenticated';
  }

  function setAuthenticated(val) {
    if (val) {
      sessionStorage.setItem(SESSION_KEY, 'authenticated');
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }

  window.AdminAuth = {
    sha256,
    isAuthenticated,
    setAuthenticated,
    getStoredHash,
    setStoredHash,
    async verifyPassword(pwd) {
      const h = await sha256(pwd);
      return h === getStoredHash();
    },
    async updatePassword(oldPwd, newPwd) {
      const ok = await this.verifyPassword(oldPwd);
      if (!ok) return { success: false, message: 'Current password is incorrect.' };
      if (!newPwd || newPwd.length < 6) {
        return { success: false, message: 'New password must be at least 6 characters.' };
      }
      const newHash = await sha256(newPwd);
      setStoredHash(newHash);
      return { success: true, message: 'Password updated successfully!' };
    },
    logout() {
      setAuthenticated(false);
      window.location.reload();
    }
  };
})();
