const router = require('express').Router();
const { db } = require("../database/db");
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const upload = require('../middleware/upload');



var run_query = function (db, sql) {
    return new Promise(function (fulfill, reject) {
        db.query(sql, (err, rows) => {
            if (!err) {
                fulfill(rows);
            } else {
                reject(err);
            }
        })
    })
}

router.get('/users/search', (req, res) => {
    const search = req.query.q
    console.log(search)
    var searchUser = `SELECT * FROM user_profile WHERE (username LIKE '%${search}%')`

    db.query(searchUser, function (errQuery, resQuery) {
        if (errQuery) {
            res.status(500).json(errQuery)
        } else {
            res.status(200).json(resQuery)
        }
    })
});


router.post('/user/create_profile/', async (req, res) => {
    // const file = req.file;
    const body = { ...req.body }

    const profile_id = uuidv4();
    const sql = `INSERT INTO user_profile (profile_id, user_id, username, gender, age, picture, phone_number) 
    VALUES ("${profile_id}", "${body.user_id}", '${body.username}', '${body.gender}', '${body.age}', '', '${body.phone_number}')`

    run_query(db, sql).then(result => {
        const get_user_profile_sql = `SELECT * FROM user_profile WHERE profile_id = '${profile_id}'`;
        run_query(db, get_user_profile_sql).then(result => {
            res.status(200).json(result[0]);
        }).catch(err => {
            console.log(err);
            res.status(500).json(err);
        })
    }).catch(err => {
        console.log(err);
        res.status(500).json(err);
    })

});


router.post('/signup', async (req, res) => {
    const body = req.body;

    const user_id = uuidv4();
    console.log("String pass", body.password);

    bcrypt.hash(body.password, 10).then(
        result => {
            const token = jwt.sign({ user_id: user_id }, process.env.JWT_KEY, { expiresIn: "1h" });

            const refreshToken = jwt.sign({ user_id: user_id }, process.env.JWT_KEY, { expiresIn: "300d" });

            const sql = `INSERT INTO userAuth (user_id, email, password) VALUES ('${user_id}', '${body.email}', '${result}')`
            db.query(sql, (err, rows) => {
                if (!err) {
                    res.status(200).json({
                        message: "Authentication Succesful",
                        user: {
                            user_id: user_id,
                        },
                        accessToken: token,
                        refreshToken: refreshToken,
                    });
                } else {
                    console.log(err);
                    res.status(500).json({
                        err: err.sqlMessage
                    });
                }
            })
        }
    ).catch(err => {
        res.status(400).json({
            err: err
        });
    });
});

router.get('/refreshtoken', async (req, res) => {
    try {
        const refreshtoken = req.headers.authorization.split(" ")[1];

        const decoded = jwt.verify(refreshtoken, process.env.JWT_KEY);
        const sql = `SELECT * FROM userAuth WHERE name = '${decoded.username}'`
        db.query(sql, (err, rows) => {
            if (!err) {
                if (rows.length >= 1) {

                    const token = jwt.sign({ username: body.username, user_id: body.username }, process.env.JWT_KEY, { expiresIn: "1h" });


                    res.status(200).json({
                        message: "Authentication Succesful",
                        user: {
                            username: rows[0].username,
                            user_id: rows[0].user_id,

                        },
                        token: token,
                    });
                }


            } else {
                console.log(err);
                res.status(401).json({
                    err: "Invalid Details"
                });
            }
        })
    } catch (err) {
        return res.status(401).json({ message: 'Refresh Token Expired' })
    }
})


router.post('/login', async (req, res) => {
    const body = req.body;

    const user_id = uuidv4();

    const token = jwt.sign({ username: body.identity, user_id: body.identity }, process.env.JWT_KEY, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ username: body.username, user_id: body.username }, process.env.JWT_KEY, { expiresIn: "300d" });

    const sql = `SELECT * FROM userAuth WHERE email = '${body.identity}'`
    db.query(sql, (err, rows) => {
        if (!err) {
            if (rows.length >= 1) {
                console.log(rows[0].password);
                bcrypt.compare(body.password, rows[0].password, (err, result) => {

                    if (err) {
                        console.log(err);
                        res.status(400).json({
                            err: err
                        })
                    }
                    if (result) {
                        res.status(200).json({
                            message: "Authentication Succesful",
                            user: {
                                username: rows[0].username,
                                user_id: rows[0].user_id,
                            },
                            access_token: token,
                            refresh_token: refreshToken,
                        });
                    } else {
                        res.status(401).json({
                            message: "Unauthorized credentials"
                        })
                    }
                })
            }
        } else {
            console.log(err);
            res.status(401).json({
                err: "Unauthorized Credentials"
            });
        }
    })



});

module.exports = router;