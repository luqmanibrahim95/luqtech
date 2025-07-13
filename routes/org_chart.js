const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// ✅ Simpan atau update maklumat carta organisasi
router.post('/save-org-info', async (req, res) => {
  const { user_id, position, department, parent_id } = req.body;
  const currentUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;

  if (!currentUser || !currentUser.company_id) {
    return res.status(403).json({ success: false, message: "Tidak dibenarkan." });
  }

  try {
    // Semak kalau user ini sudah wujud dalam carta syarikat
    const [existing] = await pool.query(
      'SELECT id FROM org_chart WHERE user_id = ? AND company_id = ?',
      [user_id, currentUser.company_id]
    );

    if (existing.length > 0) {
      // ✅ Update data
      await pool.query(
        'UPDATE org_chart SET position = ?, department = ?, parent_id = ? WHERE user_id = ? AND company_id = ?',
        [position, department, parent_id || null, user_id, currentUser.company_id]
      );
    } else {
      // ✅ Insert data baru
      await pool.query(
        'INSERT INTO org_chart (user_id, company_id, position, department, parent_id) VALUES (?, ?, ?, ?, ?)',
        [user_id, currentUser.company_id, position, department, parent_id || null]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Ralat simpan org_chart:', err);
    res.status(500).json({ success: false, message: "Ralat server." });
  }
});

module.exports = router;
