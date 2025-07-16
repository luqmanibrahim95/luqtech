// routes/department.js
const express = require('express');
const router = express.Router();

// Placeholder route
router.get('/', (req, res) => {
  res.json({ message: 'Department API ready.' });
});

module.exports = router;