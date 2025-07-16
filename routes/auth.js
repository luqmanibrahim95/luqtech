// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db/db');
const router = express.Router();

// POST /api/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query(`
      SELECT users.*, companies.company_name AS company_name
      FROM users
      LEFT JOIN companies ON users.company_id = companies.id
      WHERE users.email = ?`, [email]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Email tidak dijumpai 😢' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Password salah 🥲' });
    }

    const userInfo = {
      id: user.id,
      fullname: `${user.first_name} ${user.last_name}`,
      email: user.email,
      company_id: user.company_id,
      company_name: user.company_name || 'Syarikat tidak dikenalpasti',
      is_admin: user.is_admin
    };

    res.clearCookie('user');
    res.cookie('user', JSON.stringify(userInfo), {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict'
    });
    res.json({ success: true, message: 'Login berjaya!', ...userInfo });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Ralat server 😢' });
  }
});

// POST /api/logout
router.post('/logout', (req, res) => {
  res.clearCookie('user');
  res.json({ success: true });
});

// GET /api/check-user
router.get('/check-user', async (req, res) => {
  try {
    const cookie = req.cookies.user;
    if (!cookie) return res.status(401).json({ message: 'Tiada sesi login.' });

    const sessionUser = JSON.parse(cookie);

    const [userRows] = await pool.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.is_admin, u.company_id,
             d.name AS department_name,
             c.name AS company_name
      FROM users u
      LEFT JOIN org_chart o ON u.id = o.user_id AND u.company_id = o.company_id
      LEFT JOIN departments d ON o.department_id = d.id
      LEFT JOIN companies c ON u.company_id = c.id
      WHERE u.id = ?
    `, [sessionUser.id]);

    if (!userRows || userRows.length === 0) {
      return res.status(404).json({ message: "Pengguna tidak dijumpai." });
    }

    const user = userRows[0];

    res.json({
      user: {
        id: user.id,
        fullname: `${user.first_name} ${user.last_name}`,
        email: user.email,
        is_admin: user.is_admin === 1 || user.is_admin === '1',
        company_id: user.company_id,
        company_name: user.company_name || 'Tiada',
        department_name: user.department_name || null
      }
    });

  } catch (err) {
    console.error("Ralat semak sesi user:", err);
    res.status(400).json({ message: 'Sesi rosak.' });
  }
});

// POST /api/signup
router.post('/signup', async (req, res) => {
  const { first_name, last_name, gender, email, password, repassword } = req.body;

  if (!first_name || !last_name || !gender || !email || !password || !repassword) {
    return res.status(400).json({ success: false, message: 'Sila lengkapkan semua maklumat.' });
  }

  if (password !== repassword) {
    return res.status(400).json({ success: false, message: 'Password tidak sepadan 🥲' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email telah digunakan 🥲' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (first_name, last_name, gender, email, password) VALUES (?, ?, ?, ?, ?)',
      [first_name, last_name, gender, email, hashedPassword]
    );

    res.json({ success: true, message: 'Akaun berjaya didaftar! Anda boleh login sekarang.' });

  } catch (error) {
    console.error('Error signup:', error);
    res.status(500).json({ success: false, message: 'Ralat server 😢' });
  }
});

// POST /api/update-profile
router.post('/update-profile', async (req, res) => {
  const cookie = req.cookies.user;
  if (!cookie) return res.status(401).json({ success: false, message: 'Tidak login' });

  const currentUser = JSON.parse(cookie);
  const { phone, birthdate, address, position } = req.body;

  try {
    await pool.query(`
      UPDATE users SET
        phone = ?,
        birthdate = ?,
        address = ?,
        position = ?
      WHERE id = ?
    `, [phone || null, birthdate || null, address || null, position || null, currentUser.id]);

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Gagal update profile:', err);
    res.status(500).json({ success: false, message: 'Gagal simpan maklumat' });
  }
});

// GET /api/profile
router.get('/profile', async (req, res) => {
  const cookie = req.cookies.user;
  if (!cookie) return res.status(401).json({ success: false, message: 'Tidak login' });

  const currentUser = JSON.parse(cookie);

  try {
    const [rows] = await pool.query(`
      SELECT phone, birthdate, address, position
      FROM users
      WHERE id = ?
    `, [currentUser.id]);

    res.json({ success: true, profile: rows[0] || {} });
  } catch (err) {
    console.error('❌ Gagal ambil data profile:', err);
    res.status(500).json({ success: false, message: 'Gagal ambil maklumat' });
  }
});

router.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1');
    res.send('✅ DB connection OK!');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ DB connection FAILED!');
  }
});


module.exports = router;
