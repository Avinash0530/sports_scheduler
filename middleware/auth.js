// middleware/auth.js
const checkAuthenticated = (req, res, next) => {
    if (req.session.user) return next();
    res.redirect('/login');
};

const checkAdmin = (req, res, next) => {
    if (req.session.user?.role === 'admin') return next();
    res.redirect('/login');
};

module.exports = { checkAuthenticated, checkAdmin };
