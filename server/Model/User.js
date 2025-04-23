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
    },
    dueAmount: {
        type: Number,
        required: true,
        default: 0, // Default due amount is 0
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
