const router = require('express').Router();
const Conversation = require("../models/Conversation");
const { db } = require("../database/db");
const { v4: uuidv4 } = require('uuid');

//new Conv
router.post('/', async (req, res) => {
    const body = req.body;

    const conversation_id = uuidv4();
    const sql = `INSERT INTO conversations ( conversation_id, user_one,user_two,conversation_type) VALUES(
        "${conversation_id}", "${body.user_one}","${body.user_two}","message"
    ) `
    db.query(sql, (err, rows) => {
        if (!err) {
            res.status(200).send(rows);
        } else {
            console.log(err);
            res.status(500).send(err);
        }
    })
});

//get convo of a user
router.get('/:userId', async (req, res) => {
    const userId = req.params.userId;
    const sql = `SELECT * FROM conversations WHERE user_one = "${userId}" OR user_two = "${userId}"`;
    console.log(userId);
    try {
        db.query(sql, (err, rows) => {
            if (!err) {
                res.send(rows);
            } else {
                res.status(500).send(err);
            }
        });

    } catch (err) {

        res.status(500).send(err);
    }
})


module.exports = router;