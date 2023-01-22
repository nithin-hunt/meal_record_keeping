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
    role: {
        type: String,
        default: 'user',
    }
});

const User = mongoose.model("user", userSchema);

module.exports = User;