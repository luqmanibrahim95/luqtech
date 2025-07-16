const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// GET: Dapatkan senarai jabatan (warna sekali)
router.get('/', async (req, res) => {
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  if (!user || !user.company_id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const [rows] = await pool.query(`
      SELECT id, name, color_top, color_bottom
      FROM departments
      WHERE company_id = ?
      ORDER BY name ASC
    `, [user.company_id]);

    res.json({ departments: rows });
  } catch (err) {
    console.error('Error get departments:', err);
    res.status(500).json({ message: 'Ralat server' });
  }
});

// POST: Tambah jabatan baru dengan warna
router.post('/', async (req, res) => {
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  const { name, color_top, color_bottom } = req.body;

  if (!user || !user.is_admin || !user.company_id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Nama jabatan diperlukan' });
  }

  try {
    await pool.query(`
      INSERT INTO departments (company_id, name, color_top, color_bottom)
      VALUES (?, ?, ?, ?)
    `, [
      user.company_id,
      name.trim(),
      color_top || '#ffffff',
      color_bottom || '#f0f0f0'
    ]);

    res.json({ message: 'Jabatan berjaya ditambah' });
  } catch (err) {
    console.error('Error tambah jabatan:', err);
    res.status(500).json({ message: 'Ralat pelayan' });
  }
});

// PUT: Kemaskini jabatan
router.put('/:id', async (req, res) => {
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  const { name, color_top, color_bottom } = req.body;

  if (!user || !user.is_admin || !user.company_id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await pool.query(`
      UPDATE departments
      SET name = ?, color_top = ?, color_bottom = ?
      WHERE id = ? AND company_id = ?
    `, [name, color_top, color_bottom, req.params.id, user.company_id]);

    res.json({ message: 'Jabatan dikemaskini' });
  } catch (err) {
    console.error('Error kemaskini jabatan:', err);
    res.status(500).json({ message: 'Ralat pelayan' });
  }
});

module.exports = router;
