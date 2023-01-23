const router = require('express').Router();
const User = require('../models/userModel');
const Meal = require('../models/mealModel')
const {validateMeal} = require('../utils/validators');
const auth = require('../middlewares/auth');
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


module.exports = router;