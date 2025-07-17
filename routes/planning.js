const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// Ambil semua task syarikat
router.get('/planning-tasks', async (req, res) => {
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  if (!user || !user.company_id) {
    return res.json({ success: false, message: 'Syarikat tidak dikenalpasti.' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT t.id, t.title, t.start, t.end, t.color, t.project_id, p.project_name
       FROM planning_tasks t
       LEFT JOIN planning_projects p ON t.project_id = p.id
       WHERE t.company_id = ?`,
      [user.company_id]
    );

    res.json({ success: true, tasks: rows });
  } catch (error) {
    console.error('Ralat ambil task:', error);
    res.status(500).json({ success: false, message: 'Ralat ambil task.' });
  }
});

// Tambah task baru
router.post('/planning-tasks', async (req, res) => {
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  const { title, start, end, color, project_id } = req.body;

  if (!user || !user.company_id || !title || !start || !end) {
    return res.status(400).json({ success: false, message: 'Input tidak lengkap' });
  }

  try {
    await pool.query(
      `INSERT INTO planning_tasks (company_id, title, start, end, color, project_id, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user.company_id, title, start, end, color || '#007bff', project_id || null, user.id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error insert task:', err);
    res.status(500).json({ success: false, message: 'SQL gagal' });
  }
});

// Delete task
router.delete('/planning-tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM planning_tasks WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error delete task:', err);
    res.status(500).json({ success: false });
  }
});

// Update task
router.patch('/planning-tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, start, end, color, project_id } = req.body;

  try {
    await pool.query(
      `UPDATE planning_tasks
       SET title = ?, start = ?, end = ?, color = ?, project_id = ?
       WHERE id = ?`,
      [title, start, end, color || '#007bff', project_id || null, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error update task:', err);
    res.status(500).json({ success: false, error: 'Gagal kemaskini data' });
  }
});

module.exports = router;
