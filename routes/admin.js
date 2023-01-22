const router = require('express').Router();
const User = require('../models/userModel');
const authAdmin = require('../middlewares/authAdmin');
const isUserExists = require('../middlewares/isUserExists');
const {validateUpdateUser} = require('../utils/validators')

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

// update user by id
router.put("/users/:id", [isUserExists, authAdmin], async (req, res) => {
    const {error} = validateUpdateUser(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
  
	const user = await User.findByIdAndUpdate(
		req.params.id,
		{ $set: req.body },
		{ new: true }
	).select("-password -__v");
	res.status(200).send({ data: user, message: "Profile updated successfully" });
});

module.exports = router;