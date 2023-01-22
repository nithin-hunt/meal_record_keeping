const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Must provide email"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Must provide password"],
    },
    isAdmin: {
        type: Boolean,
        default: false,
        required: false
    }
});

const User = mongoose.model("user", userSchema);

module.exports = User;