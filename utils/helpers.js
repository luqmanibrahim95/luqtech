// utils/helpers.js
function generateCompanyCode(name) {
  const prefix = 'CMP';
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${rand}`;
}

function getCurrentUserId(req) {
  try {
    const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
    return user ? user.id : null;
  } catch {
    return null;
  }
}

module.exports = {
  generateCompanyCode,
  getCurrentUserId
};
