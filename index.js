const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const mongoose = require('mongoose');
const mysql = require('mysql');
const morgan = require('morgan');
const bodyparser = require('body-parser');

const conversationsRoute = require("./router/conversation");
const authroute = require('./router/auth');



const messagesRoute = require("./router/messages");


// initializing server
const app = express();
dotenv.config();
const port = process.env.PORT || 3000;





// middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

app.use("/api/conversations", conversationsRoute);
app.use("/api/auth",authroute)


// MySql SetUp
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'mysql-39281-0.cloudclusters.net',
    port: 39296,
    user: 'admin',
    password: 'justdoitnow12',
    database: 'datex'
});



app.get('/', (req, res) => {
    try {
        pool.query('SELECT * FROM userAuth', (err, result) => {
            if (err) console.log(err);
            console.log(result);
        })
    } catch (err) {

        console.log(err);
    }
});

// connection.end();

// Get all rows


app.use("/api/conversations", conversationsRoute);
app.use("/api/messages", messagesRoute);

app.listen(port, () => {
    console.log(`Server running, on port ${port}...`)
});

module.exports = { pool };