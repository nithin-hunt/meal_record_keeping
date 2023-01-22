const mongoose = require('mongoose');

const connectDB = (url) => {
    try {
        mongoose.set('strictQuery', true);
        mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }, () =>  console.log("DB connection successfull..."))
    } catch (e) {
        console.log("DB connection failed...", e.message)
    }
};

module.exports = connectDB;