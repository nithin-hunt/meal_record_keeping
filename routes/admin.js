const router = require('express').Router();
const User = require('../models/userModel');
const Meal = require('../models/mealModel');
const authAdmin = require('../middlewares/authAdmin');
const isUserExists = require('../middlewares/isUserExists');
const {validateUpdateUser} = require('../utils/validators');
const mongoose = require('mongoose');

// get all users
router.get("/users", [authAdmin], async (req,res) => {
    try {
        // const users = await User.find().select("-password -__v");
        const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit);
        let role = req.query.role || "All";

        const roleOptions = [
            "user",
            "admin"
        ];

        role === "All" ? (role = [...roleOptions]) : (role = req.query.role.split(","));
    
        const users = await User.find()
        .where("role")
        .in([...role])
        .skip(page * limit)
        .limit(limit)
        .select("-password -__v");

        const total = await User.countDocuments({
            role: { $in: [...role] }
        });

        const results = {
            total,
            page: page + 1,
            limit,
            role: role,
            users,
        }
        
        const startIndex = page * limit
        const endIndex = (page+1) * limit
        
        if(endIndex < total) {
            results.next = {
                page: page+2
            }
        }
        
        if(startIndex > 0) {
            results.previous = {
                page: page                
            }
        }

	    res.status(200).json(results);
    } catch(e) {
        console.log(e);
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
router.delete("/users/:id", [authAdmin, isUserExists], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        await Meal.deleteMany({_id: user.meals});
        await User.findByIdAndDelete(req.params.id);

        res.status(200).json("Successfully deleted user...");
    } catch(e) {
        return res.status(500).json({Error: e.message});
    }
});

// Get all meals
router.get("/meals", authAdmin, async(req,res) => {
    try {
        
        const page = parseInt(req.query.page) - 1 || 0;
		const limit = parseInt(req.query.limit);
		const search = req.query.search || "";
        
        const meals = await Meal.find()
        .where({ name: { $regex: search, $options: "i" } })
        .skip(page * limit)
        .limit(limit);

        const total = await Meal.countDocuments({
            name: { $regex: search, $options: "i" },
        });

        const results = {
            total,
            page: page + 1,
            limit,
            meals,
        }
        
        const startIndex = page * limit
        const endIndex = (page+1) * limit
        
        if(endIndex < total) {
            results.next = {
                page: page+2
            }
        }
        
        if(startIndex > 0) {
            results.previous = {
                page: page                
            }
        }

	    res.status(200).json(results);
    } catch (e) {
        return res.status(500).json({Error: e.message})
    }
})

//Get meal by id
router.get("/meals/:id", authAdmin, async(req,res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json("Invalid Meal ID");
        }

        const meal = await Meal.findById(req.params.id);
        if(!meal) {
            return res.status(404).json("Meal not found");
        }

        res.status(200).json(meal);
    } catch (e) {
        return res.status(500).json({Error: e.message});
    }
})

//Delete meal by id
router.delete("/meals/:id", authAdmin, async(req,res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json("Invalid Meal ID");
        }

        const meal = await Meal.findById(req.params.id);
        if(!meal) {
            return res.status(404).json("Meal not found");
        }

        const user = await User.findById(meal.userId);
        const index= user.meals.indexOf(req.params.id);
        user.meals.splice(index, 1);
        await user.save();
        
        await meal.remove();

        return res.status(200).json("Meal removed successfully")
    } catch (e) {
        return res.status(500).json({Error: e.message});
    }
})

module.exports = router;