const mongoose = require('mongoose');
const Meal = require('../models/mealModel');
const User = require('../models/userModel')

const isMealExists = async (req,res,next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json("Invalid Meal ID");
        }

        const meal = await Meal.findById(req.params.id);
        if(!meal) {
            return res.status(404).json("Meal not found");
        }
        
        const user = await User.findById(req.user._id);
        if (!user._id.equals(meal.userId)) {
            return res.status(403).json("User don't have access to this meal");
        }

        next();
    } catch (e) {
        return res.status(500).json({Error: e});
    }
}

module.exports = isMealExists;