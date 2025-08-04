// Set admin authentication flags
localStorage.setItem('weparlay-is-admin', 'true');
localStorage.setItem('weparlay-admin-role', 'admin');
console.log('Admin flags set - page should reload automatically');
window.location.reload();
