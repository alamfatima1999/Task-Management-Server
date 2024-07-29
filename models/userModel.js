const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String},
    email: { type: String, required: true, unique: true },
    password: { type: String },
    googleId: { type: String },
});

module.exports = mongoose.model('User', userSchema);
