// middleware/parseUser.js
const parseUser = (req, res, next) => {
  try {
    const raw = req.cookies.user;
    if (raw) {
      req.user = JSON.parse(raw);
    }
  } catch (err) {
    console.error('❌ Error parsing cookie user:', err);
    req.user = null;
  }
  next();
};

module.exports = parseUser;
