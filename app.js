// app.js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const pool = require('./database');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const playerRoutes = require('./routes/playerRoutes'); 
const { checkAdmin, checkAuthenticated } = require('./middleware/auth');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: 'avi@2005',
    resave: false,
    saveUninitialized: true
}));

app.route('/edit-event/:id')
    .get(checkAuthenticated, checkAdmin, async (req, res) => {
        try {
            const event = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);

            if (event.rows.length === 0) {
                return res.status(404).send('Event not found');
            }

            res.render('edit-event', { event: event.rows[0] });
        } catch (err) {
            console.error(err);
            res.redirect('/admin-dashboard');
        }
    })
    .post(checkAuthenticated, checkAdmin, async (req, res) => {
        const { name, date, time, venue, team_limit, description } = req.body;
        try {
            await pool.query(
                'UPDATE events SET name = $1, date = $2, time = $3, venue = $4, team_limit = $5, description = $6 WHERE id = $7',
                [name, date, time, venue, team_limit, description, req.params.id]
            );
            res.redirect('/admin-dashboard');
        } catch (err) {
            console.error(err);
            res.redirect('/admin-dashboard');
        }
    });

app.get('/', (req, res) => res.render('index'));
app.get('/add-event', checkAuthenticated, checkAdmin, (req, res) => res.render('add-event'));

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/admin-dashboard');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

app.use(authRoutes);
app.use(adminRoutes);
app.use(playerRoutes);

app.listen(3000, () => console.log('Server is running on port 3000'));
