const mongoose = require('mongoose');

// how our document look like
const userSchema = mongoose.Schema({
    _id: {
        auto: true,
        type: Number,
        autoIncrement: true
    },
    name: {
        type: String,
        default: ''
    },
    phone: Number,
    msgNumber: {
        type: Number,
        default: 0
    }
}, {timestamps: true});

const postUser = mongoose.model('user', userSchema);

module.exports = postUser;