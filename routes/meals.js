const router = require('express').Router();
const User = require('../models/userModel');
const authAdmin = require('../middlewares/authAdmin');
const auth = require('../middlewares/auth');

// Post meal
router.post("/", async(req,res) => {

});

module.exports = router;