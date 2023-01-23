const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Must provide Meal name"],
    },
    time: {
        type: String,
        required: [true, "Must provide Time"],
    },
    calorie: {
        type: String,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
});

const Meal = mongoose.model("meal", mealSchema);

module.exports = Meal;