const router = require('express').Router();
const User = require('../models/userModel');
const {validateUser} = require('../utils/validators');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

// Signup user
router.post("/signup", async (req,res) => {
    try{
        const {error} = validateUser(req.body);
        if(error){
            return res.status(400).json({message: error.details[0].message});
        }

        const user = await User.findOne({email: req.body.email});
        if(user) {
            return res.status(403).json({ message: "User with given email already Exist!" });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, (saltOrRounds = 10));
        let newUser = await new User({
            ...req.body,
            password: hashedPassword,
        }).save();

        newUser.password = undefined;
        newUser.__v = undefined;

        res.status(200).json({ message: "Account created successfully", data: newUser });
    
    } catch (e) {
        return res.status(500).json({Error: e.message});
    }
});


module.exports = router;