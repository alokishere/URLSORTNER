const express = require('express');
const {generateNewShortID,getRedirectUrl,getAnalytics,getallUrls} = require('../controllers/url.controller');
const authenticateUser = require('../middleware/auth');
const restrictToUser = require('../middleware/ristrictToUser');
const restrictToAdmin = require('../middleware/ristricttoadmin');
const router = express.Router();

const Url = require('../models/url.model');

// Apply authentication to all routes below this middleware
router.use(authenticateUser);
router.use(restrictToUser);

router.get('/', getallUrls);
router.post('/', generateNewShortID);
router.get('/:shortID/analytics', getAnalytics);

module.exports = router;