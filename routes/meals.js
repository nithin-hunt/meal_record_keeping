const router = require('express').Router();
const User = require('../models/userModel');
const Meal = require('../models/mealModel')
const {validateMeal, validateUpdateMeal} = require('../utils/validators');
const auth = require('../middlewares/auth');
const isMealIdValid = require('../middlewares/isMealIdValid');
const fetch = require('node-fetch');

// Post meal
router.post("/", auth, async(req,res) => {
  try {
    const {error} = validateMeal(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }
    const {name, time} = req.body;
    let calorie = req.body.calorie || 0

    if(!calorie) {
        const  body = {query: name}
        const response = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
            method: 'post',
            body: JSON.stringify(body),
            headers: { 
            'x-app-id' : process.env.API_ID, 
            'x-app-key' : process.env.API_KEY, 
            'Content-Type': 'application/json'}
        });
        const data = await response.json();

        for (let item in data.foods) {
            calorie += data.foods[item].nf_calories
        }

        calorie = parseInt(calorie)

        if(calorie === 0) {
            calorie = 250
        }
    }
    
    const user = await User.findById(req.user._id);
    const meal = await Meal({
        name,
        time,
        calorie,
        userId: user._id
    }).save();

    user.meals.push(meal._id);
    await user.save();

    return res.status(201).json(meal);
  } catch(e) {
        return res.status(500).json({Error: e.message});
  }
});

// Get meals
router.get("/", auth, async(req,res) => {
    try {
        const user = await User.findById(req.user._id);
        const meals = await Meal.find({_id: user.meals});
        res.status(200).json(meals);
    } catch (e) {
        return res.status(500).json({Error: e.message})
    }
})

// Get meal by id
router.get("/:id", [auth, isMealIdValid], async(req,res) => {
    try {
        const meal = await Meal.findById(req.params.id);
        res.status(200).json(meal);
    } catch (e) {
        return res.status(500).json({Error: e.message});
    }
})

// Update meal by id
router.put("/:id", [auth, isMealIdValid], async(req,res) => {
    try {
        const {error} = validateUpdateMeal(req.body);
        if(error){
            return res.status(400).json({message: error.details[0].message});
        }

        const meal = await Meal.findByIdAndUpdate(
            req.params.id,
            { $set: req.body},
            { new: true}
        );

        res.status(200).json({Message: "Meal updated successfully", updatedMeal: meal});
    } catch (e) {
        return res.status(500).json({Error: e.message});
    }
})

//Delete meal by id
router.delete("/:id", [auth, isMealIdValid], async(req,res) => {
    try {
        const user = await User.findById(req.user._id);
        const index= user.meals.indexOf(req.params.id);
        user.meals.splice(index, 1);
        await user.save();

        const meal = await Meal.findById(req.params.id);
        await meal.remove();

        return res.status(200).json("Meal removed successfully")
    } catch (e) {
        return res.status(500).json({Error: e.message});
    }
})

module.exports = router;