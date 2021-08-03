const router = require('express').Router();
const { db } = require("../database/db");
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


router.get('/users', (req, res) => { res.json(users) });
router.post('/users', async (req, res) => {
    try {
        //const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        //console.log(salt)
        //console.log(hashedPassword)


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
            console.log("bcrypt ", result);
            const sql = `INSERT INTO userAuth (user_id, username, email, passw) VALUES ('${user_id}','${body.username}', '${body.email}', '${result}')`
            db.query(sql, (err, rows) => {
                if (!err) {
                    res.status(200).json({
                        message: "Authentication Succesful",
                        token: token
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



router.post('/login', async (req, res) => {
    const body = req.body;

    const user_id = uuidv4();

    const token = jwt.sign({ username: body.username, user_id: body.username }, process.env.JWT_KEY, { expiresIn: "1h" });
    const sql = `SELECT * FROM userAuth WHERE username = '${body.username}' OR email = '${body.email}'`
    db.query(sql, (err, rows) => {
        if (!err) {
            if (rows.length >= 1) {
                bcrypt.compare(body.password, rows[0].passw, (err, result) => {

                    if (err) {
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