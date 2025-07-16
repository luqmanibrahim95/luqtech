const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// ✅ Simpan atau update maklumat carta organisasi
router.post('/save-org-info', async (req, res) => {
  let { user_id, position, department_id, parent_user_id } = req.body;
  const currentUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;

  if (!currentUser || !currentUser.company_id) {
    return res.status(403).json({ success: false, message: "Tidak dibenarkan." });
  }

  try {
    if (parent_user_id === "NONE") {
      await pool.query(
        'DELETE FROM org_chart WHERE user_id = ? AND company_id = ?',
        [user_id, currentUser.company_id]
      );
      return res.json({ success: true });
    }

    if (!parent_user_id || parent_user_id === "ROOT") {
      parent_user_id = null;
    }

    const [existing] = await pool.query(
      'SELECT id FROM org_chart WHERE user_id = ? AND company_id = ?',
      [user_id, currentUser.company_id]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE org_chart SET position = ?, department_id = ?, parent_user_id = ? WHERE user_id = ? AND company_id = ?',
        [position, department_id || null, parent_user_id, user_id, currentUser.company_id]
      );
    } else {
      await pool.query(
        'INSERT INTO org_chart (user_id, company_id, position, department_id, parent_user_id) VALUES (?, ?, ?, ?, ?)',
        [user_id, currentUser.company_id, position, department_id || null, parent_user_id]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Ralat simpan org_chart:', err);
    res.status(500).json({ success: false, message: "Ralat server." });
  }
});

// ✅ Ambil carta organisasi syarikat
router.get('/get', async (req, res) => {
  const currentUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;

  if (!currentUser || !currentUser.company_id) {
    return res.status(403).json({ success: false, message: "Tidak dibenarkan." });
  }

  try {
    const [rows] = await pool.query(
      `SELECT oc.*, CONCAT(u.first_name, ' ', u.last_name) AS fullname
       FROM org_chart oc
       JOIN users u ON u.id = oc.user_id
       WHERE oc.company_id = ?`,
      [currentUser.company_id]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Ralat ambil carta organisasi:', err);
    res.status(500).json({ success: false, message: "Ralat server." });
  }
});

// ✅ Ambil senarai ahli syarikat + info carta + nama jabatan
router.get('/company-members', async (req, res) => {
  const currentUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;

  if (!currentUser || !currentUser.company_id) {
    return res.json({ success: false, message: "Tidak dibenarkan." });
  }

  try {
    const [rows] = await pool.query(`
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.is_admin,
        o.position, o.parent_user_id, o.department_id,
        d.name AS department_name
      FROM users u
      LEFT JOIN org_chart o ON o.user_id = u.id AND o.company_id = ?
      LEFT JOIN departments d ON d.id = o.department_id
      WHERE u.company_id = ?
    `, [currentUser.company_id, currentUser.company_id]);

    const members = rows.map(user => {
      const inOrgChart =
        user.position !== null ||
        user.department_id !== null ||
        user.parent_user_id !== null;

      return {
        id: user.id,
        email: user.email,
        fullname: `${user.first_name} ${user.last_name}`,
        is_admin: user.is_admin === '1',
        position: user.position || '',
        department_id: user.department_id || '', // 🆕
        department_name: user.department_name || '', // 🆕
        parent_user_id: !inOrgChart
          ? 'NONE'
          : (user.parent_user_id === null ? 'ROOT' : user.parent_user_id)
      };
    });

    res.json({ success: true, members });
  } catch (err) {
    console.error("Gagal ambil ahli syarikat:", err);
    res.json({ success: false, message: "Ralat server." });
  }
});

// ✅ Padam dari carta organisasi (fallback jika perlu)
router.post('/delete', async (req, res) => {
  const { user_id } = req.body;
  const currentUser = req.cookies.user ? JSON.parse(req.cookies.user) : null;

  if (!currentUser || !currentUser.company_id) {
    return res.status(403).json({ success: false, message: "Tidak dibenarkan." });
  }

  try {
    await pool.query(
      'DELETE FROM org_chart WHERE user_id = ? AND company_id = ?',
      [user_id, currentUser.company_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Ralat padam org_chart:', err);
    res.status(500).json({ success: false, message: "Ralat server." });
  }
});

module.exports = router;
