// routes/planning_projects.js
const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// Ambil semua projek untuk syarikat
router.get('/', async (req, res) => {
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  if (!user || !user.company_id) return res.json({ success: false });

  try {
    const result = await pool.query(
      'SELECT id, project_name FROM planning_projects WHERE company_id = $1 ORDER BY project_name ASC',
      [user.company_id]
    );
    res.json({ success: true, projects: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;

