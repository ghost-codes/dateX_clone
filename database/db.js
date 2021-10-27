const { createPool } = require('mysql');

const db = createPool({
    connectionLimit: 15,
    host: 'mysql-55867-0.cloudclusters.net',
    port: 19907,
    user: 'admin',
    password: 'adminadmin',
    database: 'dateX_database'
});

module.exports = { db };