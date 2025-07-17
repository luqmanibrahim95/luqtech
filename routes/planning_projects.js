const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// ✅ Ambil semua projek untuk syarikat user
router.get('/', async (req, res) => {
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  if (!user || !user.company_id) {
    return res.status(401).json({ success: false, message: 'User not in a company' });
  }

  try {
    const result = await pool.query(
      'SELECT id, title, start, end, color FROM planning_tasks WHERE company_id = $1 ORDER BY project_name ASC',
      [user.company_id]
    );
    res.json({ success: true, projects: result.rows });
  } catch (err) {
    console.error('GET /api/projects error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Tambah projek baru
router.post('/create', async (req, res) => {
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  const { project_name } = req.body;

  if (!user || !user.company_id) {
    return res.status(401).json({ success: false, message: 'User not in a company' });
  }

  if (!project_name || project_name.trim() === '') {
    return res.status(400).json({ success: false, message: 'Project name is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO planning_projects (project_name, company_id, created_by) VALUES ($1, $2, $3) RETURNING id, project_name',
      [project_name.trim(), user.company_id, user.id]
    );
    res.json({ success: true, project: result.rows[0] });
  } catch (err) {
    console.error('POST /api/projects/create error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
