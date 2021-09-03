const { createPool } = require('mysql');

const db = createPool({
    connectionLimit: 15,
    host: 'mysql-46376-0.cloudclusters.net',
    port: 19837,
    user: 'admin',
    password: 'YvgLsyIp',
    database: 'datex'
});

module.exports = { db };