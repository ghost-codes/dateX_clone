const router = require('express').Router();
const Conversation = require("../models/Conversation");
const { db } = require("../database/db");
const { v4: uuidv4 } = require('uuid');


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
var getuser_Id = function (rows, userId) {
    return new Promise(function (fulfill, reject) {
        let index = 0;
        let userIdTuple = "";
        fulfill(rows.map(element => {
            if (index > 0) {
                userIdTuple = userIdTuple + ",";
                if (element.User_1 !== userId) {
                    userIdTuple = userIdTuple + `"${element.User_1}"`
                } else {
                    userIdTuple = userIdTuple + `"${element.User_2}"`

                }
                index = index + 1;
            } else {
                console.log("hello")
                if (element.User_1 !== userId) {
                    userIdTuple = userIdTuple + `"${element.User_1}"`
                } else {
                    userIdTuple = userIdTuple + `"${element.User_2}"`

                }
            }
            return userIdTuple;
        }))
    })
}

var get_user = function (db, rows, userId) {
    return new Promise(function (fulfill, reject) {
        const convos = []
        rows.forEach(element => {
            if (element.User_1 !== userId) {
                run_query(db, `SELECT * FROM user_profile WHERE user_id = "${element.User_1}"`).then((result) => {
                    console.log(result);
                    element.user = result[0];
                    convos.push({
                        conversation_id: element.user,
                        user: result[0]
                    })
                }).catch(err => {
                    console.log(err);
                })
            } else {
                run_query(db, `SELECT * FROM user_profile WHERE user_id = "${element.User_2}"`).then((result) => {
                    element.user = result[0];
                    convos.push({
                        conversation_id: element.user,
                        user: result[0]
                    })
                }).catch(err => {
                    console.log(err);
                });
            }
        });
        fulfill(convos)
    });
}


//new Conv
router.post('/', async (req, res) => {
    const body = req.body;

    const conversation_id = uuidv4();
    const sql = `INSERT INTO conversation ( conversation_id, User_1,User_2,conversation_type) VALUES(
        "${conversation_id}", "${body.user_one}","${body.user_two}","${body.conversation_type}"
    ) `
    db.query(sql, (err, rows) => {
        if (!err) {
            res.status(200).json({ meesage: "Conversation Created Successfully" });
        } else {
            console.log(err);
            res.status(500).json(err);
        }
    })
});

// get convo of a user
router.get('/:userId', async (req, res) => {
    const userId = req.params.userId;
    const sql = `SELECT * FROM conversation WHERE User_1 = "${userId}" OR User_2 = "${userId}"`;

    run_query(db, sql).then((convos) => {

        let userIdTuple = "";
        getuser_Id(convos, userId).then(result => {
            console.log(result);
            if (result.length !== 0) {
                userIdTuple = result.pop();
                const query = `SELECT * FROM user_profile WHERE user_id IN (${userIdTuple})`
                console.log(userIdTuple);
                run_query(db, query).then(result => {
                    console.log(result);
                    res.status(200).json({
                        conversations: convos,
                        user_profiles: result,
                    });
                }).catch(err => {
                    console.log(err);
                })
            }
        }).catch(err => {
            console.log(err);
        })
        // get_user(db, result, userId).then(result => {

        // })

    }).catch(err => {
        console.log(err);
    })

    // try {
    //     db.query(sql, (err, rows) => {
    //         if (!err) {
    //             const convo = [];
    //             rows.forEach((element) => {
    //                 if (element.User_1 !== userId) {
    //                     try {
    //                         let conversationObj;
    //                         const user_query = `SELECT * FROM user_profile WHERE user_id = "${element.User_1}"`;
    //                         db.query(user_query, (err, result) => {
    //                             if (!err) {
    //                                 delete (element.User_1);
    //                                 delete (element.User_2);
    //                                 console.log(result);
    //                                 element.user = result;
    //                                 return { conversation_id: element.conversation_id, type: element.conversation_type, user: result }

    //                             } else {
    //                                 res.status(500).json(err);
    //                             }
    //                         });

    //                     } catch (error) {
    //                         console.log(err);
    //                     }

    //                 } else {
    //                     try {
    //                         console.log("hey")
    //                         const user_query = `SELECT * FROM user_profile WHERE user_id = "${element.User_2}"`;
    //                         db.query(user_query, (err, result) => {
    //                             if (!err) {
    //                                 delete (element.User_1);
    //                                 delete (element.User_2);
    //                                 console.log(result);
    //                                 element.user = result[0];
    //                                 convo.push({ conversation_id: element.conversation_id, type: element.conversation_type, user: result })

    //                             } else {
    //                                 res.status(500).json(err);
    //                             }
    //                         })

    //                     } catch (error) {
    //                         console.log(err);
    //                     }
    //                 }


    //             });
    //             console.log(convo);
    //             res.status(200).json(convo);
    //         } else {
    //             res.status(500).json(err);
    //         }
    //     });

    // } catch (err) {

    //     res.status(500).json(err);
    // }
})

// router.get('/:userId', async (req, res) => {
//     const userId = req.params.userId;
//     const sql = `SELECT conversation.conversation_id,conversation_type,user_profile.all,user_profile.all
//      FROM conversation 
//      INNER JOIN user_profile ON conversation.User_1=user_profile.user_id

//      WHERE conversation.User_1 = "${userId}" OR conversation.User_2 = "${userId}"`;

//     run_query(db, sql).then((convos) => {
//         console.log(convos);
//     }).catch(err => {
//         console.log(err)
//     })


// })


module.exports = router;