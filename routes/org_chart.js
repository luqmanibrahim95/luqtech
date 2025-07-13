const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// Ambil carta organisasi
router.get('/', async (req, res) => {
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  if (!user || !user.company_id) return res.json([]);

  const [rows] = await pool.query('SELECT * FROM org_chart WHERE company_id = ?', [user.company_id]);
  res.json(rows);
});

// Simpan ahli baru
router.post('/', async (req, res) => {
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  if (!user || !user.company_id) return res.json({ success: false });

  const { name, position, parent_id } = req.body;
  await pool.query(
    'INSERT INTO org_chart (company_id, name, position, parent_id) VALUES (?, ?, ?, ?)',
    [user.company_id, name, position, parent_id || null]
  );

  res.json({ success: true });
});

module.exports = router;
