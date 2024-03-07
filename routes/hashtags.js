var express = require('express');
var router = express.Router();
const db = require('../database');

var helper = require('../public/javascripts/helper')

router.get('/', (req, res) => {
    const query = `
        SELECT
            T.id AS tweet_id,
            T.text AS tweet_content,
            GROUP_CONCAT(H.text) AS hashtags
        FROM
            Tweet AS T
        JOIN
            TweetsWithHashtags AS TH ON T.id = TH.tweet_id
        JOIN
            Hashtag AS H ON TH.hashtag_text = H.text
        GROUP BY
            T.id;
    `;

    db.all(query, (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else {
            res.render('hashtags', { tweets: rows });
        }
    });
});


// router.get('/', (req, res) => {
//     db.all(`SELECT t.text AS tweet, h.text
//             FROM Tweet t
//             JOIN TweetsWithHashtags th ON t.id = th.tweet_id
//             JOIN Hashtag h ON th.hashtag_text = h.text`, (err, rows) => {
//         if (err) {
//             console.error(err.message);
//             res.status(500).send('Internal Server Error');
//         } else {
//             const tweets = {};
//             rows.forEach(row => {
//                 if (!tweets[row.tweet]) {
//                     tweets[row.tweet] = [];
//                 }
//                 tweets[row.tweet].push(row.hashtag);
//             });
//             console.log(tweets.length);
//             if(tweets.length > 0){
//                 console.log(tweets[0])
//             }
//             res.render('hashtags', { tweets });
//         }
//     });
// });

router.get('/:hashtag', (req, res) => {
    const hashtag = "#"+req.params.hashtag;
    console.log(hashtag);
    const query = `
        SELECT
            T.id AS tweet_id,
            T.text AS tweet_content,
            U.name AS tweet_user
        FROM
            Tweet AS T
        JOIN
            TweetsWithHashtags AS TH ON T.id = TH.tweet_id
        JOIN
            Hashtag AS H ON TH.hashtag_text = H.text
        JOIN
            User AS U ON T.user_id = U.id
        WHERE
            H.text = ?;
    `
        
    // WHERE
    //      H.text = ?;
    db.all(query, [hashtag], (err, rows) => {
        if (err) {
            console.error(err.stack);
            res.status(500).send('Internal Server Error');
        } else {
            const tweetList = rows.map(row => ({
                id: row.tweet_id,
                text: helper.InjectLink(row.tweet_content),
                user: row.tweet_user
                }));

            res.render('spesific_hashtag', { hashtag, tweets: tweetList });
        }
    });

    
});

module.exports = router;