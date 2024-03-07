var express = require('express');
const db = require('../database');



var router = express.Router();


// User login view
router.get('/login', function(req, res, next) {
  res.render('login');
});

// User login
router.post('/login', (req, res) => {
  const { name, password } = req.body;
  // Check if the user exists in the database with the provided username and
 password
  db.get('SELECT * FROM User WHERE name = ? AND password = ?', [name, password],
 (err, user) => {
  if (err) {
  console.error('Error checking user:', err);
  return res.status(500).send('Error checking user');
  }
  // If user is found, set session data
  if (user) {
  req.session.user = {
  id: user.id,
  name: user.name
  };
  // Redirect to the main page with a message including the user's name
  res.redirect(`/?message=Welcome back, ${user.name}!`);
} else {
// If user is not found or password is incorrect, redirect with an error message
      res.render('login', {message : "Invalid username or password, please try again."});
    }
  });
 });

// User logout
router.post('/logout', (req, res) => {
  if(req.session.user != undefined){
    res.render('logout');
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).send('Error destroying session');
      }
    });

  } else {
    res.redirect('/?message=You cannot logout if you are not logged in!');
  }
});

// Create a new user
router.post('/', (req, res) => {

  const { name, password } = req.body;
  db.run('INSERT INTO User (name, password) VALUES (?, ?)', [name, password],

  function(err) {
    if (err) {
      console.error('Error inserting user:', err.message);
      return res.status(500).send('Error inserting user');
    }
      console.log(`User created with ID: ${this.lastID}`);
      res.send('User created successfully');
    });
});
  // Get all users
router.get('/', (req, res) => {
  db.all('SELECT * FROM User', (err, rows) => {
    if (err) {
      console.error('Error getting users:', err.message);
      return res.status(500).send('Error getting users');
    }
      res.json(rows);
   });
});


  // Delete a user by their ID
  router.post('/delete', (req, res) => {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).send('User ID is required');
    }

    db.run('DELETE FROM User WHERE id = ?', userId, function(err) {
    
    if (err) {
      console.error('Error deleting user:', err.message);
      return res.status(500).send('Error deleting user');
    }

    console.log(`User with ID ${userId} deleted`);
    res.send('User deleted successfully');

    });
  });

  module.exports = router;
