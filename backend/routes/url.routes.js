const express = require('express');
const {generateNewShortID,getRedirectUrl,getAnalytics,getallUrls} = require('../controllers/url.controller');
const router = express.Router();

const Url = require('../models/url.model');
router.get('/',getallUrls);
router.post('/', generateNewShortID);
router.get('/:shortID', getRedirectUrl);
router.get('/:shortID/analytics', getAnalytics);


module.exports = router;