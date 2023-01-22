const router = require('express').Router();
const User = require('../models/userModel');
const authAdmin = require('../middlewares/authAdmin');
const isUserExists = require('../middlewares/isUserExists')

// get all users
router.get("/users", authAdmin, async (req,res) => {
    try {
        const users = await User.find().select("-password -__v");
	    res.status(200).send({ Users: users });
    } catch (e) {
        return res.status(500).json({Error: e.message});
    }
})

// get user by id
router.get("/users/:id", [isUserExists, authAdmin], async (req, res) => {
	const user = await User.findById(req.params.id).select("-password -__v");
	res.status(200).send({ User: user });
});

module.exports = router;