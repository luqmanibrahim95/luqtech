const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// Get org chart
router.get('/', async (req, res) => {
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  if (!user || !user.company_id) return res.json({ success: false });

  try {
    const [rows] = await pool.query('SELECT * FROM org_chart WHERE company_id = ?', [user.company_id]);

    // Convert flat data to tree
    const map = {};
    rows.forEach(r => map[r.id] = { ...r, children: [] });
    let root = null;

    rows.forEach(r => {
      if (r.parent_id) {
        map[r.parent_id].children.push(map[r.id]);
      } else {
        root = map[r.id];
      }
    });

    res.json({ success: true, chart: root });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'DB error' });
  }
});

// Add org chart member
router.post('/add', async (req, res) => {
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  if (!user || !user.company_id) return res.json({ success: false });

  const { name, position, parent_id } = req.body;
  try {
    await pool.query(
      'INSERT INTO org_chart (company_id, name, position, parent_id) VALUES (?, ?, ?, ?)',
      [user.company_id, name, position, parent_id || null]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

module.exports = router;
