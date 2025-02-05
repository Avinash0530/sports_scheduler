const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../database');
const router = express.Router();

router.get('/login', (req, res) => res.render('login'));

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            if (await bcrypt.compare(password, user.password)) {
                req.session.user = { id: user.id, username: user.username, role: user.role };
                return res.redirect(user.role === 'admin' ? '/admin-dashboard' : '/player-dashboard');
            }
        }
        res.render('login', { error: 'Invalid username or password' });
    } catch (err) {
        console.error(err);
        res.render('login', { error: 'An error occurred. Please try again.' });
    }
});

router.get('/register', (req, res) => res.render('register'));

router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (username, password, role) VALUES ($1, $2, $3)', [username, hashedPassword, role]);
        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.render('register', { error: 'User already exists or invalid data' });
    }
});

module.exports = router;
