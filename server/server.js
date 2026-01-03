import { createRequire } from "module";
const require = createRequire(import.meta.url);
const express = require('express');
const cors = require('cors');
import db from './database.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Get all transactions
app.get('/api/transactions', (req, res) => {
    const sql = "SELECT * FROM transactions ORDER BY date DESC, id DESC";
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Create a new transaction
app.post('/api/transactions', (req, res) => {
    const { date, description, amount, type, category } = req.body;
    const sql = "INSERT INTO transactions (date, description, amount, type, category) VALUES (?,?,?,?,?)";
    const params = [date, description, amount, type, category];

    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": {
                id: this.lastID,
                date,
                description,
                amount,
                type,
                category
            }
        });
    });
});

// Update a transaction
app.put('/api/transactions/:id', (req, res) => {
    const { date, description, amount, type, category } = req.body;
    const sql = "UPDATE transactions SET date = ?, description = ?, amount = ?, type = ?, category = ? WHERE id = ?";
    const params = [date, description, amount, type, category, req.params.id];

    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": {
                id: Number(req.params.id),
                date,
                description,
                amount,
                type,
                category
            },
            changes: this.changes
        });
    });
});

// Delete a transaction
app.delete('/api/transactions/:id', (req, res) => {
    const sql = 'DELETE FROM transactions WHERE id = ?';
    db.run(sql, req.params.id, function (err, result) {
        if (err) {
            res.status(400).json({ "error": res.message });
            return;
        }
        res.json({ "message": "deleted", changes: this.changes });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
