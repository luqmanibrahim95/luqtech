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

        // Cari susunan terakhir

    const [lastRow] = await pool.query(
        `SELECT MAX(display_order) as max_order
        FROM procedures
        WHERE company_id = ?`,
        [user.company_id]
    );

    const nextOrder =
        (lastRow[0].max_order || 0) + 1;

    await pool.query(
        `INSERT INTO procedures
        (
            company_id,
            procedure_code,
            procedure_name,
            created_by,
            display_order
        )
        VALUES (?, ?, ?, ?, ?)`,
        [
            user.company_id,
            procedure_code,
            procedure_name,
            user.id,
            nextOrder
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
            ORDER BY display_order ASC, id ASC`,
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

// ===============================
// Get Single Procedure
// ===============================
router.get('/:id', async (req, res) => {

    try {

        const [rows] = await pool.query(
            `SELECT *
             FROM procedures
             WHERE id = ?`,
            [req.params.id]
        );

        const [forms] = await pool.query(
            `SELECT *
            FROM forms
            WHERE linked_procedure_id = ?
            ORDER BY form_code`,
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                success: false
            });
        }

        res.json({
            success: true,
            procedure: rows[0],
            forms
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false
        });

    }

});

// ===============================
// Update Procedure
// ===============================
router.put('/update/:id', async (req, res) => {

    const {
        procedure_name,
        procedure_code
    } = req.body;

    try {

        await pool.query(
            `UPDATE procedures
             SET procedure_name = ?,
                 procedure_code = ?
             WHERE id = ?`,
            [
                procedure_name,
                procedure_code,
                req.params.id
            ]
        );

        res.json({
            success: true
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false
        });

    }

});

// ===============================
// Delete Procedure
// ===============================
router.delete('/delete/:id', async (req, res) => {

    try {

        await pool.query(
            `DELETE FROM procedures
             WHERE id = ?`,
            [req.params.id]
        );

        res.json({
            success: true
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false
        });

    }

});

// ===============================
// Procedure Detail
// ===============================
router.get('/detail/:id', async (req, res) => {

    try {

        const [rows] = await pool.query(
            `SELECT *
             FROM procedures
             WHERE id = ?`,
            [req.params.id]
        );

        if (rows.length === 0) {

            return res.status(404).json({
                success: false
            });

        }

        const [forms] = await pool.query(
            `SELECT *
             FROM forms
             WHERE linked_procedure_id = ?
             ORDER BY form_code`,
            [req.params.id]
        );

        res.json({
            success: true,
            procedure: rows[0],
            forms
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false
        });

    }

});

// ===============================
// Save Procedure Content
// ===============================
router.put('/content/:id', async (req, res) => {

    const { content } = req.body;

    try {

        await pool.query(
            `UPDATE procedures
             SET content = ?
             WHERE id = ?`,
            [
                content,
                req.params.id
            ]
        );

        res.json({
            success: true
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false
        });

    }

});

module.exports = router;