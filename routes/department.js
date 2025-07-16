const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// Dapatkan senarai jabatan untuk syarikat user
router.get('/', async (req, res) => {
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;

  if (!user || !user.company_id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, name FROM departments WHERE company_id = ? ORDER BY name ASC',
      [user.company_id]
    );
    res.json({ departments: rows });
  } catch (err) {
    console.error('Error get departments:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
