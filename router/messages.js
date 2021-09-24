const router = require('express').Router();
const Message = require("../models/Message");
const { v4: uuidv4 } = require('uuid');
const { db } = require("../database/db");

//new Conv
router.post('/', async (req, res) => {
    const body = req.body;
    const messageId = uuidv4();

    const sql = `INSERT INTO messages ( message_id, conversation_id,sender_id,message,created_at) VALUES(
        "${messageId}", "${body.conversationId}","${body.senderId}","${body.message},"${Date.now()}"
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
router.get("/:conversationId", async (req, res) => {
    const conversationId = req.params.conversationId;
    const sql = `SELECT * FROM message WHERE conversation_id = "${conversationId}"`;
    console.log(conversationId);
    try {
        db.query(sql, (err, rows) => {
            if (!err) {
                res.status(200).send(rows);
            } else {
                res.status(500).send(err);
            }
        });

    } catch (err) {

        res.status(500).send(err);
    }
})


module.exports = router;