const shortid = require('shortid');
const Url = require('../models/url.model');

async function getallUrls(req, res) {
    try {
        const urls = await Url.find();
        res.status(200).json(urls);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}


async function generateNewShortID(req, res) {

   const body = req.body;
   const hostname = req.protocol + '://' + req.get('host');
   if (!body || !body.url) {
     return res.status(400).json({ error: 'URL is required' });
   }
   const newShortID = shortid.generate();
   const newUrl = await Url.create({
        shortID: newShortID,
        redirectUrl: body.url,
        visitHistory: [],
        createdby: req.user._id,
   });
   res.status(201).json({ shortID: newShortID ,
    url: hostname + '/urls/' + newShortID
   });
}

async function getRedirectUrl(req, res) {
    const shortID = req.params.shortID;
    const urlEntry = await Url.findOne({ shortID: shortID });
    if (!urlEntry) {
        return res.status(404).json({ error: 'Short ID not found' });
    }
    const redirectUrl = urlEntry.redirectUrl;
    urlEntry.visitHistory.push({ timestamp: Date.now() });
    await urlEntry.save();
    res.redirect(redirectUrl);
}


async function getAnalytics(req, res) {
    const shortID = req.params.shortID;
    const urlEntry = await Url.findOne({ shortID: shortID });
    if (!urlEntry) {
        return res.status(404).json({ error: 'Short ID not found' });
    }
    const visitHistory = urlEntry.visitHistory;
    res.status(200).json({ 
        totalVisits: visitHistory.length,
        visitHistory: visitHistory });
}




module.exports = {
    generateNewShortID,
    getRedirectUrl,
    getAnalytics,
    getallUrls
};