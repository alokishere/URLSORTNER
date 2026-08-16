const express = require('express');
const { registerUser, loginUser, logoutUser } = require('../controllers/user.controller');

const router = express.Router();

// Define your routes here
router.get('/', (req, res) => {
  res.send('User route is working!');
});

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

module.exports = router;