// database.js
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sports',
    password: 'avi@2005',
    port: 5432,
});

module.exports = pool;
