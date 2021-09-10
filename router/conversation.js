const router = require('express').Router();
const Conversation = require("../models/Conversation");
const { db } = require("../database/db");
const { v4: uuidv4 } = require('uuid');

//new Conv
router.post('/', async (req, res) => {
    const body = req.body;

    const conversation_id = uuidv4();
    const sql = `INSERT INTO conversation ( conversation_id, User_1,User_2,conversation_type) VALUES(
        "${conversation_id}", "${body.user_one}","${body.user_two}","${body.conversation_type}"
    ) `
    db.query(sql, (err, rows) => {
        if (!err) {
            res.status(200).json(rows);
        } else {
            console.log(err);
            res.status(500).json(err);
        }
    })
});

//get convo of a user
router.get('/:userId', async (req, res) => {
    const userId = req.params.userId;
    const sql = `SELECT * FROM conversation WHERE User_1 = "${userId}" OR User_2 = "${userId}"`;
    console.log(userId);
    try {
        db.query(sql, (err, rows) => {
            if (!err) {
                res.json(rows);
            } else {
                res.status(500).json(err);
            }
        });

    } catch (err) {

        res.status(500).json(err);
    }
})


module.exports = router;