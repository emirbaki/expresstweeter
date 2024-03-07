var express = require('express');
var router = express.Router();
const db = require('../database');

var helper = require('../public/javascripts/helper')


// Get all tweets
router.get('/', (req, res) => {
    const message = req.query.message || '';
    const query = `
    SELECT Tweet.id AS tweet_id, Tweet.text AS tweet_text, User.name AS
   user_name
    FROM Tweet
    INNER JOIN User ON Tweet.user_id = User.id
    `;
    db.all(query, (err, rows) => {
    if (err) {
    console.error('Error getting tweets:', err.message);
    return res.status(500).send('Error getting tweets');
    }
    
    // Map the tweets to a list format
    const tweetList = rows.map(row => ({
   id: row.tweet_id,
   text: helper.InjectLink(row.tweet_text),
   user: row.user_name
   }));
   
    // Send the list of tweets as the response
    //res.json(tweetList);
    res.render('index', { messageList: tweetList, message: message });
    });
});
router.get('/user/:username', (req, res) => {
    const username = req.params.username;

    // Fetch the user's ID based on their username
    const userIdQuery = 'SELECT id FROM User WHERE name = ?';
    db.get(userIdQuery, [username], (err, user) => {
        if (err) {
            console.error(err.stack);
            res.status(500).send('Internal Server Error');
            return;
        }
        if (!user) {
            res.status(404).send('User not found');
            return;
        }

        const userId = user.id;

        // Fetch tweets for the given user from the database
        const query = `
            SELECT Tweet.id AS tweet_id,
                   Tweet.text AS tweet_content,
                   User.name AS tweet_user
            FROM Tweet
            JOIN User ON Tweet.user_id = User.id
            WHERE User.id = ?;
        `;
        db.all(query, [userId], (err, tweets) => {
            if (err) {
                console.error(err.stack);
                res.status(500).send('Internal Server Error');
                return;
            }
            // Render the Pug template to display the tweets
            const tweetList = tweets.map(tweet => ({
                id: tweet.tweet_id,
                text: helper.InjectLink(tweet.tweet_content),
                user: tweet.tweet_user
                }));
            res.render('user_tweets', { tweets : tweetList , username: username});
        });
    });
});
// // Define a route to view a user's tweets
// router.get('/user/:userId/tweets', (req, res) => {
//     const userId = req.params.userId;

//     const query = `
//         SELECT Tweet.id AS tweet_id,
//                Tweet.text AS tweet_content,
//                User.name AS tweet_user
//         FROM Tweet
//         JOIN User ON Tweet.user_id = User.id
//         WHERE User.id = ?;
//     `;
//     db.all(query, [userId], (err, tweets) => {
//         if (err) {
//             console.error(err.stack);
//             res.status(500).send('Internal Server Error');
//             return;
//         }
//         const tweetList = tweets.map(tweet => ({
//             id: tweet.tweet_id,
//             text: helper.InjectLink(tweet.tweet_content),
//             user: tweet.tweet_user
//             }));
//         const username = tweetList[0].user;
//         res.render('user_tweets', { tweets : tweetList , username: username});
//     });
// });

// Create a new tweet
router.post('/add', (req, res) => {
    const { text } = req.body;
    if(req.session.user != undefined){
        userId = req.session.user.id;
        // Check if the user exists
        db.get('SELECT * FROM User WHERE id = ?', userId, (err, user) => {
            if (err) {
                console.error('Error checking user:', err.message);
                return res.status(500).send('Error checking user');
            }
            if (!user) {
                res.redirect(`/?message=The user is not correct`);
            }
            // If the user exists, insert the tweet
            db.run('INSERT INTO Tweet (text, user_id) VALUES (?, ?)', [text, userId], function(err) {
                if (err) {
                    console.error('Error inserting tweet:', err.message);
                    return res.status(500).send('Error inserting tweet');
                }
                console.log(`Tweet created with ID: ${this.lastID}`);

                var hashtags = helper.ExtractHashtags(text);

                hashtags.forEach(hashtag => {
                    if(hashtag){
                        db.run('INSERT or IGNORE INTO Hashtag (text) VALUES (?)', [hashtag], function(err) {
                            if (err){
                                console.error("Error with inserting new hashtag:", err.message)
                                return res.status(500).send('Error inserting new hashtag');
                            }
                            console.log(`Hashtag created with Text: ${hashtag}`);
                            // res.redirect('/');
                        })

                        db.run("INSERT INTO TweetsWithHashtags (hashtag_text, tweet_id) VALUES (?, ?)", [hashtag, this.lastID], function(err){
                            if(err){
                                console.error("Error with inserting new th:", err.message)
                                return res.status(500).send('Error inserting new th');
                            }
                        })
                    }
                });
                res.redirect('/');
                });

            // If the text includes some hashtag or mention add to hashtags

            

         

            });
    } else {
        res.redirect(`/?message=Please login to add a new tweet!`);
    }
});




// Get all tweets
router.get('/', (req, res) => {
 db.all('SELECT * FROM Tweet', (err, rows) => {
 if (err) {
 console.error('Error getting tweets:', err.message);
 return res.status(500).send('Error getting tweets');
 }
 res.json(rows);
 });
});
// Delete a tweet by its ID
router.post('/delete', (req, res) => {
    if (req.session.user !== undefined) {
        const tweetId = req.body.tweetId;
        if (!tweetId) {
            return res.redirect(`/?message=Tweet ID is required`);
        }
        db.get('SELECT user_id FROM Tweet WHERE id = ?', [tweetId], (err, row) => {

        if (err) {
            console.error('Error retrieving user ID:', err.message);
            return res.status(500).send('Error retrieving user ID');
        }

        if (!row) {
            return res.redirect(`/?message=Tweet not found`);
        }

        const userId = row.user_id;
        if (userId !== req.session.user.id) {
            return res.redirect(`/?message=You cannot delete a tweet that is not yours!`);
        }
        // Proceed with tweet deletion
        db.run('DELETE FROM Tweet WHERE id = ?', tweetId, function (err) {
            if (err) {
                console.error('Error deleting tweet:', err.message);
                return res.status(500).send('Error deleting tweet');
            }
        console.log(`Tweet with ID ${tweetId} deleted`);
        res.redirect('/');
            });

        });

    } else {
    res.redirect(`/?message=Please login to delete a tweet!`);
    }
});

module.exports = router;
