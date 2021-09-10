const router = require('express').Router();
const { db } = require("../database/db");
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


router.get('/users', (req, res) => {
    search = req.query.search
    console.log(search)
    var searchUser = `SELECT * FROM userAuth WHERE (username LIKE '%${search}%') AND isDeleted='0' `

    db.query(searchUser, function (errQuery, resQuery) {
        if (errQuery) {
            res.send(errQuery)
        } else {
            res.send(resQuery[0])
        }
    })
});
router.post('/users', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
    } catch {
        res.status(500).send()
    }

    const user = { name: req.body.name, password: req.body.password }
    users.push(user)
    res.status(201).send()
    Hash(salt + 'password')
});

router.post('/signup', async (req, res) => {
    const body = req.body;

    const user_id = uuidv4();
    console.log("String pass", body.password);

    bcrypt.hash(body.password, 10).then(
        result => {
            const token = jwt.sign({ username: body.username, user_id: body.username }, process.env.JWT_KEY, { expiresIn: "1h" });

            const refreshToken = jwt.sign({ username: body.username, user_id: body.username }, process.env.JWT_KEY, { expiresIn: "300d" });

            const sql = `INSERT INTO userAuth (user_id, name, email, password) VALUES ('${user_id}','${body.username}', '${body.email}', '${result}')`
            db.query(sql, (err, rows) => {
                if (!err) {
                    res.status(200).json({
                        message: "Authentication Succesful",
                        accessToken: token,
                        refreshToken: refreshToken,
                    });
                } else {
                    console.log(err);
                    res.status(500).json({
                        err: err
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

    const token = jwt.sign({ username: body.username, user_id: body.username }, process.env.JWT_KEY, { expiresIn: "1h" });
    const sql = `SELECT * FROM userAuth WHERE name = '${body.identity}' OR email = '${body.identity}'`
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
                            token: token,
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