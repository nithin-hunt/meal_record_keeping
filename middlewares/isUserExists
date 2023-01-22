const mongoose = require('mongoose');
const User = require('../models/userModel')

const isUserExists = async (req,res,next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json("Invalid User ID");
        }

        const user = await User.findById(req.params.id);
        if(!user) {
            return res.status(404).json("User not found");
        }
        
        next();
    } catch (e) {
        return res.status(500).json({Error: e});
    }
}

module.exports = isUserExists;