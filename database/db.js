const { createPool } = require('mysql');

const db = createPool({
    connectionLimit: 15,
    host: 'mysql-54609-0.cloudclusters.net',
    port: 16484,
    user: 'admin',
    password: 'adminadmin',
    database: 'dateX_database'
});

module.exports = { db };