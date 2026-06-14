const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// ===============================
// Tambah Procedure
// ===============================
router.post('/create', async (req, res) => {

    const user = req.cookies.user
        ? JSON.parse(req.cookies.user)
        : null;

    const {
        procedure_name,
        procedure_code
    } = req.body;

    if (!user || !user.company_id) {
        return res.status(401).json({
            success: false,
            message: 'User tidak sah'
        });
    }

    if (!procedure_name || !procedure_code) {
        return res.status(400).json({
            success: false,
            message: 'Maklumat tidak lengkap'
        });
    }

    try {

        await pool.query(
            `INSERT INTO procedures
            (
                company_id,
                procedure_code,
                procedure_name,
                created_by
            )
            VALUES (?, ?, ?, ?)`,
            [
                user.company_id,
                procedure_code,
                procedure_name,
                user.id
            ]
        );

        res.json({
            success: true
        });

    } catch (err) {

        console.error('Error create procedure:', err);

        res.status(500).json({
            success: false,
            message: 'Gagal simpan prosedur'
        });
    }

});

// ===============================
// Senarai Procedure
// ===============================
router.get('/list', async (req, res) => {

    const user = req.cookies.user
        ? JSON.parse(req.cookies.user)
        : null;

    if (!user || !user.company_id) {
        return res.status(401).json({
            success: false
        });
    }

    try {

        const [rows] = await pool.query(
            `SELECT *
             FROM procedures
             WHERE company_id = ?
             ORDER BY procedure_code`,
            [user.company_id]
        );

        res.json({
            success: true,
            procedures: rows
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false
        });

    }

});

module.exports = router;