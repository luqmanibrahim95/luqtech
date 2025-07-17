const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// ✅ GET /api/planning-projects — Ambil semua projek untuk syarikat user
router.get('/', async (req, res) => {
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  if (!user || !user.company_id) {
    return res.status(401).json({ success: false, message: 'User not in a company' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, project_name FROM planning_projects WHERE company_id = ? ORDER BY created_at DESC',
      [user.company_id]
    );
    res.json({ success: true, projects: rows });
  } catch (err) {
    console.error('GET /api/planning-projects error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ POST /api/planning-projects — Tambah projek baru
router.post('/', async (req, res) => {
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  const { project_name } = req.body;

  if (!user || !user.company_id) {
    return res.status(401).json({ success: false, message: 'User not in a company' });
  }

  if (!project_name || project_name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Project name is required' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO planning_projects (project_name, company_id, created_by) VALUES (?, ?, ?)',
      [project_name.trim(), user.company_id, user.id]
    );

    res.json({
      success: true,
      project: {
        id: result.insertId,
        project_name: project_name.trim()
      }
    });
  } catch (err) {
    console.error('POST /api/planning-projects error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
