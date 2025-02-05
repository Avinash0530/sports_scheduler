const express = require('express');
const pool = require('../database');
const { checkAuthenticated } = require('../middleware/auth');
const router = express.Router(); 

router.get('/player-dashboard', checkAuthenticated, async (req, res) => {
    try {
        const [eventsResult, joinedEventsResult, participantsResult] = await Promise.all([
            pool.query('SELECT * FROM events'),
            pool.query('SELECT event_id FROM event_participants WHERE user_id = $1', [req.session.user.id]),
            pool.query('SELECT event_id, COUNT(*) AS participant_count FROM event_participants GROUP BY event_id')
        ]);

        const events = eventsResult.rows;
        const joinedEventIds = joinedEventsResult.rows.map(row => row.event_id);
        
        const participantCounts = {};
        participantsResult.rows.forEach(row => {
            participantCounts[row.event_id] = row.participant_count;
        });

        res.render('player-dashboard', {
            events: events,
            joinedEventIds: joinedEventIds,
            participantCounts: participantCounts
        });
    } catch (err) {
        console.error(err);
        res.render('player-dashboard', { error: 'An error occurred. Please try again.' });
    }
});

router.post('/join-event', checkAuthenticated, async (req, res) => {
    try {
        const result = await pool.query('SELECT team_limit FROM events WHERE id = $1', [req.body.eventId]);
        const event = result.rows[0];
        
        if (!event) {
            return res.render('player-dashboard', { error: 'Event not found.' });
        }

        const participants = await pool.query('SELECT COUNT(*) FROM event_participants WHERE event_id = $1', [req.body.eventId]);
        const currentParticipants = parseInt(participants.rows[0].count);

        if (currentParticipants >= event.team_limit) {
            return res.render('player-dashboard', { error: 'Event is full. You cannot join at this time.' });
        }

        await pool.query('INSERT INTO event_participants (event_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', 
            [req.body.eventId, req.session.user.id]);

        res.redirect('/player-dashboard');
    } catch (err) {
        console.error(err);
        res.render('player-dashboard', { error: 'An error occurred. Please try again.' });
    }
});

router.post('/unjoin-event', checkAuthenticated, async (req, res) => {
    console.log("Unjoin event POST route hit");
    try {
        const { eventId } = req.body;
        
        await pool.query('DELETE FROM event_participants WHERE event_id = $1 AND user_id = $2', [eventId, req.session.user.id]);

        res.redirect('/player-dashboard');
    } catch (err) {
        console.error(err);
        res.render('player-dashboard', { error: 'An error occurred while leaving the event. Please try again.' });
    }
});

module.exports = router;
