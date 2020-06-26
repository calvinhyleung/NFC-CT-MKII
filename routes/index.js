const express = require('express');
const router = express.Router();
const {ensureAuth, ensureGuest} = require('../middleware/auth');

const Logs = require('../models/Logs');

// @desc Login page
// @route GET /
router.get('/', ensureGuest, (req, res) => {
    res.render('login', {
        layout: "login"
    });
});

// @desc Dashboard page
// @route GET /dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
    try {
        const logs = await Logs.find({user: req.user.id}).lean().sort({scannedAt: 'desc'});
        res.render('dashboard', {
        name: req.user.firstName,
        logs
        });
    } catch (error) {
        console.error(err);
        res.render('error/500')
    }
    
});

module.exports = router;