const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    selectedRoute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VehicleRoute',  
    }
});

const User = mongoose.model('user', userSchema);
module.exports = User;