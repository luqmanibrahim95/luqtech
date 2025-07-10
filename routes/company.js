// routes/company.js
const express = require('express');
const pool = require('../db/db');
const { generateCompanyCode } = require('../utils/helpers');
const parseUser = require('../middleware/parseUser');

const router = express.Router();

router.use(parseUser);

// GET /api/search-company
router.get('/search-company', async (req, res) => {
  const q = req.query.q;

  if (!q || q.length < 2) {
    return res.json([]);
  }

  try {
    const [rows] = await pool.query(
      `SELECT company_name FROM companies WHERE company_name LIKE ? LIMIT 10`,
      [`%${q}%`]
    );
    const results = rows.map(row => ({ name: row.company_name }));
    res.json(results);
  } catch (error) {
    console.error('Error search company:', error);
    res.status(500).json({ message: 'Ralat server 😢' });
  }
});

// POST /api/register-company
router.post('/register-company', async (req, res) => {
  const { company_name, address = '', phone = '', email = '' } = req.body;
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  const userId = user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Pengguna tidak sah.' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM companies WHERE company_name = ?', [company_name]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Nama syarikat sudah wujud.' });
    }

    const [insertResult] = await pool.query(
      `INSERT INTO companies (company_name, address, phone, email, company_code, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        company_name,
        address,
        phone,
        email,
        generateCompanyCode(company_name),
        userId
      ]
    );

    const newCompanyId = insertResult.insertId;

    await pool.query(
      `UPDATE users SET company_id = ?, is_admin = 1 WHERE id = ?`,
      [newCompanyId, userId]
    );

    const updatedUser = {
      id: userId,
      fullname: user.fullname,
      email: user.email,
      company_id: newCompanyId,
      company_name: company_name,
      is_admin: 1
    };

    res.clearCookie('user');
    res.cookie('user', JSON.stringify(updatedUser), {
      httpOnly: false,
      sameSite: 'lax'
    });

    res.json({ success: true, message: 'Syarikat berjaya didaftarkan dan anda kini admin!' });
  } catch (err) {
    console.error('Error register company:', err);
    res.status(500).json({ success: false, message: 'Ralat server.' });
  }
});

// POST /api/join-request
router.post('/join-request', async (req, res) => {
  const { company_name } = req.body;
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;

  if (!user || !user.id) {
    return res.status(401).json({ success: false, message: 'Sesi tidak sah.' });
  }

  try {
    // Cari ID syarikat berdasarkan nama
    const [company] = await pool.query('SELECT id FROM companies WHERE company_name = ?', [company_name]);

    if (company.length === 0) {
      return res.status(404).json({ success: false, message: 'Syarikat tidak dijumpai.' });
    }

    const companyId = company[0].id;

    // Check kalau sudah pernah minta
    const [existing] = await pool.query(
      'SELECT id FROM join_requests WHERE user_id = ? AND company_id = ? AND status = "pending"',
      [user.id, companyId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Permintaan sudah dihantar.' });
    }

    // Masukkan permintaan baru
    await pool.query(
      'INSERT INTO join_requests (user_id, company_id) VALUES (?, ?)',
      [user.id, companyId]
    );

    res.json({ success: true, message: 'Permintaan telah dihantar untuk semakan.' });
  } catch (err) {
    console.error('Error join-request:', err);
    res.status(500).json({ success: false, message: 'Ralat server.' });
  }
});

// GET /api/join-requests → untuk admin tengok semua permintaan syarikat dia
router.get('/join-requests', async (req, res) => {
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;

  if (!user || !user.is_admin || !user.company_id) {
    return res.status(403).json({ success: false, message: 'Tidak dibenarkan.' });
  }

  try {
    const [rows] = await pool.query(
    `SELECT jr.id AS request_id, CONCAT(u.first_name, ' ', u.last_name) AS fullname, u.email
    FROM join_requests jr
    JOIN users u ON jr.user_id = u.id
    WHERE jr.company_id = ? AND jr.status = 'pending'`,
    [user.company_id]
    );

    res.json({ success: true, requests: rows });
  } catch (err) {
    console.error('Error fetch join-requests:', err);
    res.status(500).json({ success: false, message: 'Ralat server.' });
  }
});

// POST /api/approve-request → untuk admin lulus / tolak permintaan
router.post('/approve-request', async (req, res) => {
  const { request_id, approve } = req.body;
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;

  if (!user || !user.is_admin || !user.company_id) {
    return res.status(403).json({ success: false, message: 'Tidak dibenarkan.' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT * FROM join_requests WHERE id = ? AND company_id = ?`,
      [request_id, user.company_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Permintaan tidak dijumpai.' });
    }

    const request = rows[0];

    if (approve) {
      await pool.query(`UPDATE users SET company_id = ? WHERE id = ?`, [user.company_id, request.user_id]);
      await pool.query(`UPDATE join_requests SET status = 'approved' WHERE id = ?`, [request_id]);
    } else {
      await pool.query(`UPDATE join_requests SET status = 'rejected' WHERE id = ?`, [request_id]);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error approve-request:', err);
    res.status(500).json({ success: false, message: 'Ralat server.' });
  }
});


// POST /api/leave-company
router.post('/leave-company', async (req, res) => {
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  if (!user || !user.email) {
    return res.status(401).json({ success: false, message: 'Sesi tidak sah.' });
  }

  try {
    await pool.query(`UPDATE users SET company_id = NULL WHERE email = ?`, [user.email]);
    res.clearCookie('user');
    res.json({ success: true });
  } catch (err) {
    console.error('Error leave company:', err);
    res.status(500).json({ success: false, message: 'Ralat server.' });
  }
});

// GET /api/company-members → senarai pengguna dalam syarikat
router.get('/company-members', async (req, res) => {
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;

  if (!user || !user.is_admin || !user.company_id) {
    return res.status(403).json({ success: false, message: 'Tidak dibenarkan.' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT id, CONCAT(first_name, ' ', last_name) AS fullname, email, is_admin
       FROM users
       WHERE company_id = ?`,
      [user.company_id]
    );

    res.json({ success: true, members: rows });
  } catch (err) {
    console.error('Error fetch company members:', err);
    res.status(500).json({ success: false, message: 'Ralat server.' });
  }
});

// POST /api/remove-member → hanya admin boleh keluarkan staf dari syarikat
router.post('/remove-member', async (req, res) => {
  const { user_id } = req.body;
  const admin = req.cookies.user ? JSON.parse(req.cookies.user) : null;

  if (!admin || !admin.is_admin || !admin.company_id) {
    return res.status(403).json({ success: false, message: 'Akses ditolak.' });
  }

  try {
    // Pastikan user tu bukan admin lain, dan dari syarikat yang sama
    const [rows] = await pool.query(
      `SELECT id FROM users WHERE id = ? AND company_id = ? AND is_admin = 0`,
      [user_id, admin.company_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak sah atau tidak boleh dikeluarkan.' });
    }

    await pool.query(`UPDATE users SET company_id = NULL WHERE id = ?`, [user_id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error remove-member:', err);
    res.status(500).json({ success: false, message: 'Ralat server.' });
  }
});

// POST /api/promote-admin → naik taraf pengguna kepada admin (oleh admin)
router.post('/promote-admin', async (req, res) => {
  const { user_id } = req.body;
  const admin = req.cookies.user ? JSON.parse(req.cookies.user) : null;

  if (!admin || !admin.is_admin || !admin.company_id) {
    return res.status(403).json({ success: false, message: 'Akses ditolak.' });
  }

  try {
    // Pastikan user tersebut dari syarikat yang sama dan bukan admin
    const [rows] = await pool.query(
        `SELECT id FROM users WHERE id = ? AND company_id = ? AND (is_admin = 0 OR is_admin IS NULL)`,
        [user_id, admin.company_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak sah atau sudah admin.' });
    }

    await pool.query(`UPDATE users SET is_admin = 1 WHERE id = ?`, [user_id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error promote-admin:', err);
    res.status(500).json({ success: false, message: 'Ralat server.' });
  }
});

// Ambil maklumat syarikat + info tambahan
router.get('/company-info', async (req, res) => {
  const user = req.user;
  if (!user || !user.company_id) {
    return res.json({ success: false, message: 'Tiada syarikat untuk user ini' });
  }

  try {
    const [companyResult] = await pool.query('SELECT * FROM companies WHERE id = ?', [user.company_id]);
    const [extraInfos] = await pool.query('SELECT * FROM company_infos WHERE company_id = ?', [user.company_id]);

    if (companyResult.length === 0) {
      return res.json({ success: false, message: 'Syarikat tidak dijumpai' });
    }

    return res.json({ success: true, company: companyResult[0], extraInfos });
  } catch (err) {
    console.error('Error get company info:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Tambahan route update-company
router.post('/update-company', async (req, res) => {
  const user = req.user;
  const { address, phone, email, about } = req.body;

  if (!user || !user.company_id || !user.is_admin) {
    return res.status(403).json({ success: false, message: 'Akses ditolak.' });
  }

  try {
    await pool.query(
      `UPDATE companies SET address = ?, phone = ?, email = ?, about = ? WHERE id = ?`,
      [address || '', phone || '', email || '', about || '', user.company_id]
    );

    res.json({ success: true, message: 'Maklumat syarikat dikemaskini.' });
  } catch (err) {
    console.error('Error update company:', err);
    res.status(500).json({ success: false, message: 'Ralat server.' });
  }
});

module.exports = router;
