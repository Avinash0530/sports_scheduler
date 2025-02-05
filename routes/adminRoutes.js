const express = require('express');
const pool = require('../database');
const { checkAuthenticated, checkAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/admin-dashboard', checkAuthenticated, checkAdmin, async (req, res) => {
    try {
        const events = await pool.query('SELECT * FROM events');
        res.render('admin-dashboard', { events: events.rows });
    } catch (err) {
        console.error(err);
        res.render('admin-dashboard', { error: 'An error occurred. Please try again.' });
    }
});

router.post('/admin-dashboard', checkAuthenticated, checkAdmin, async (req, res) => {
    const { name, date, time, venue, team_limit, description } = req.body;
    try {
        await pool.query(
            'INSERT INTO events (name, date, time, venue, team_limit, description, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [name, date, time, venue, team_limit, description, req.session.user.id]
        );
        res.redirect('/admin-dashboard');
    } catch (err) {
        console.error(err);
        res.render('admin-dashboard', { error: 'An error occurred. Please try again.' });
    }
});


router.get('/admin-reports', checkAuthenticated, checkAdmin, async (req, res) => {
    try {
        const sessionsQuery = `
            SELECT COUNT(*) as total_sessions
            FROM sessions
            WHERE session_date >= NOW() - INTERVAL '1 week'
        `;
        const sessionResults = await pool.query(sessionsQuery);
        const totalSessions = sessionResults.rows[0].total_sessions;

        const sportsQuery = `
            SELECT sport, COUNT(*) as participation_count
            FROM sessions
            WHERE session_date >= NOW() - INTERVAL '1 week'
            GROUP BY sport
            ORDER BY participation_count DESC
        `;
        const sportsResults = await pool.query(sportsQuery);
        const sportPopularity = sportsResults.rows;

        res.render('admin-reports', {
            totalSessions, 
            sportPopularity
        });
    } catch (err) {
        console.error(err);
        res.render('admin-reports', { error: 'An error occurred while fetching the reports.' });
    }
});


router.post('/delete-event', checkAuthenticated, checkAdmin, async (req, res) => {
    try {
        await pool.query('DELETE FROM events WHERE id = $1', [req.body.eventId]);
        res.redirect('/admin-dashboard');
    } catch (err) {
        console.error(err);
        res.render('admin-dashboard', { error: 'An error occurred. Please try again.' });
    }
});



module.exports = router;
