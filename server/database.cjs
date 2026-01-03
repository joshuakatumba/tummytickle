const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../bakery.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        category TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error('Error creating table', err.message);
        } else {
            // Check if empty and seed initial data
            db.get("SELECT count(*) as count FROM transactions", [], (err, row) => {
                if (err) return;
                if (row.count === 0) {
                    const insert = db.prepare("INSERT INTO transactions (date, description, amount, type, category) VALUES (?, ?, ?, ?, ?)");
                    const today = new Date().toISOString().split('T')[0];
                    insert.run(today, 'Morning Sourdough Sales', 450.00, 'income', 'Counter Sales');
                    insert.run(today, 'Flour (50kg)', 120.00, 'expense', 'Ingredients');
                    insert.run(today, 'Butter & Eggs', 85.50, 'expense', 'Ingredients');
                    insert.finalize();
                    console.log('Seeded initial data.');
                }
            });
        }
    });
}

module.exports = db;
