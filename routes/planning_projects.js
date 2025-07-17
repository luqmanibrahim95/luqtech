const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// Ambil semua projek untuk syarikat user
router.get('/', async (req, res) => {
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  if (!user || !user.company_id) {
    return res.status(401).json({ success: false, message: 'User not in a company' });
  }

  try {
    // planning.js (line 10)
    const [tasks] = await pool.query(`
        SELECT t.*, p.name AS project_name 
        FROM planning_tasks t 
        LEFT JOIN planning_projects p ON t.project_id = p.id 
        WHERE t.company_id = ?
    `, [company_id]);

    res.json({ success: true, projects: result.rows });
  } catch (err) {
    console.error('GET /api/projects error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Tambah projek baru
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
      'INSERT INTO planning_projects (project_name, company_id, created_by) VALUES (?, ?, ?) RETURNING id, project_name',
      [project_name.trim(), user.company_id, user.id]
    );
    res.json({ success: true, project: result.rows[0] });
  } catch (err) {
    console.error('POST /api/projects/create error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
