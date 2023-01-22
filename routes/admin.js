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
    } catch(e) {
        return res.status(500).json({Error: e.message});
    }
})

// get user by id
router.get("/users/:id", [isUserExists, authAdmin], async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password -__v");
        res.status(200).json({ User: user });
    } catch(e) {
        return res.status(500).json({Error: e.message});
    }
});

// update user by id
router.put("/users/:id", [isUserExists, authAdmin], async (req, res) => {
    try {
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
    } catch(e) {
        return res.status(500).json({Error: e.message});
    }
});

// delete user by id
router.delete("/users/:id", [isUserExists, authAdmin], async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("Successfully deleted user...");
    } catch(e) {
        return res.status(500).json({Error: e.message});
    }
});

module.exports = router;