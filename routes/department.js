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

// Tambah jabatan baru
router.post('/', async (req, res) => {
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  const { name } = req.body;

  if (!user || !user.is_admin || !user.company_id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Nama jabatan diperlukan' });
  }

  try {
    await pool.query(
      'INSERT INTO departments (company_id, name) VALUES (?, ?)',
      [user.company_id, name.trim()]
    );
    res.json({ message: 'Jabatan berjaya ditambah' });
  } catch (err) {
    console.error('Error tambah jabatan:', err);
    res.status(500).json({ error: 'Ralat pelayan' });
  }
});

module.exports = router;