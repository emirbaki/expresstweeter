const sqlite3 = require('sqlite3').verbose();
// SQLite database connection
const db = new sqlite3.Database('./database.db', (err) => {
 if (err) {
 console.error('Error in the connection with the database:',
err.message);
 } else {
 console.log('Successful connection to the SQLite database.');
 createTables();
 }
});
// Function to create the tables if they do not exist in the database
function createTables() {
 db.run(`CREATE TABLE IF NOT EXISTS User (
 id INTEGER PRIMARY KEY,
 name TEXT NOT NULL,
 password TEXT NOT NULL
 )`);
 db.run(`CREATE TABLE IF NOT EXISTS Tweet (
 id INTEGER PRIMARY KEY,
 text TEXT NOT NULL,
 user_id INTEGER,
 FOREIGN KEY (user_id) REFERENCES User(id)
 )`);
    db.run(`CREATE TABLE IF NOT EXISTS Hashtag (
    text TEXT PRIMARY KEY
)`);
    db.run(`CREATE TABLE IF NOT EXISTS TweetsWithHashtags (
    hashtag_text TEXT,
    tweet_id INTEGER,

    FOREIGN KEY (hashtag_text) REFERENCES Hashtag(text),
    FOREIGN KEY (tweet_id) REFERENCES Tweet(id) ON DELETE CASCADE,
    PRIMARY KEY (hashtag_text, tweet_id)
)`);
}
module.exports = db;