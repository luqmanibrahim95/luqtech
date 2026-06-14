const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// ===============================
// Create Form
// ===============================
router.post('/create', async (req, res) => {

    const user = req.cookies.user
        ? JSON.parse(req.cookies.user)
        : null;

    const {
        form_code,
        form_name
    } = req.body;

    if (!user || !user.company_id) {

        return res.status(401).json({
            success: false
        });

    }

    if (!form_code || !form_name) {

        return res.status(400).json({
            success: false
        });

    }

    try {

        const [lastRow] = await pool.query(
            `SELECT MAX(display_order) as max_order
             FROM forms
             WHERE company_id = ?`,
            [user.company_id]
        );

        const nextOrder =
            (lastRow[0].max_order || 0) + 1;

        await pool.query(
            `INSERT INTO forms
            (
                company_id,
                form_code,
                form_name,
                display_order,
                created_by
            )
            VALUES (?, ?, ?, ?, ?)`,
            [
                user.company_id,
                form_code,
                form_name,
                nextOrder,
                user.id
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
// List Forms
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
             FROM forms
             WHERE company_id = ?
             ORDER BY display_order ASC`,
            [user.company_id]
        );

        res.json({
            success: true,
            forms: rows
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false
        });

    }

});

// ===============================
// Form Detail
// ===============================
router.get('/detail/:id', async (req, res) => {

    try {

        const [formRows] = await pool.query(
            `SELECT *
             FROM forms
             WHERE id = ?`,
            [req.params.id]
        );

        if (formRows.length === 0) {

            return res.status(404).json({
                success: false
            });

        }

        const [fieldRows] = await pool.query(
            `SELECT *
             FROM form_fields
             WHERE form_id = ?
             ORDER BY field_order ASC, id ASC`,
            [req.params.id]
        );

        res.json({
            success: true,
            form: formRows[0],
            fields: fieldRows
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false
        });

    }

});

// ===============================
// Add Field
// ===============================
router.post('/field/create', async (req, res) => {

    const {
        form_id,
        field_label,
        field_type
    } = req.body;

    try {

        const [lastRow] = await pool.query(
            `SELECT MAX(field_order) as max_order
             FROM form_fields
             WHERE form_id = ?`,
            [form_id]
        );

        const nextOrder =
            (lastRow[0].max_order || 0) + 1;

        await pool.query(
            `INSERT INTO form_fields
            (
                form_id,
                field_label,
                field_type,
                field_order
            )
            VALUES (?, ?, ?, ?)`,
            [
                form_id,
                field_label,
                field_type,
                nextOrder
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