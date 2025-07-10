const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// Ambil semua task syarikat
router.get('/planning-tasks', async (req, res) => {
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  if (!user || !user.company_id) return res.status(403).json({ success: false });

  try {
    const [rows] = await pool.query(
        'SELECT id, title, start, end, color FROM planning_tasks WHERE company_id = ?',
        [user.company_id]
    );


    res.json({ success: true, tasks: rows });
  } catch (err) {
    console.error('Error get planning tasks:', err);
    res.status(500).json({ success: false });
  }
});

// Tambah task baru
router.post('/planning-tasks', async (req, res) => {
  const user = req.cookies.user ? JSON.parse(req.cookies.user) : null;
  const { title, start, end, color } = req.body;

  console.log('📥 POST /planning-tasks');
  console.log('User:', user);
  console.log('Body:', { title, start, end, color });

  if (!user || !user.company_id || !title || !start || !end) {
    return res.status(400).json({ success: false, message: 'Input tidak lengkap' });
  }

  try {
    await pool.query(
        'INSERT INTO planning_tasks (company_id, title, start, end, color, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        [user.company_id, title, start, end, color || '#007bff', user.id]
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
  const { title, start, end, color } = req.body;

  try {
    await pool.query(
      'UPDATE planning_tasks SET title = ?, start = ?, end = ?, color = ? WHERE id = ?',
      [title, start, end, color, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error update task:', err);
    res.status(500).json({ success: false, error: 'Gagal kemaskini data' });
  }
});


module.exports = router;
