// routes/planning_projects.js
const express = require('express');
const router = express.Router();
const pool = require('../db/db');

router.post('/create', async (req, res) => {
  try {
    const user = JSON.parse(req.cookies.user || '{}');
    const { project_name } = req.body;
    if (!user.id || !user.company_id || !project_name) return res.json({ success: false });

    await pool.query(
      `INSERT INTO planning_projects (company_id, project_name, created_by)
       VALUES ($1, $2, $3)`,
      [user.company_id, project_name, user.id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Projek gagal disimpan:', err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
