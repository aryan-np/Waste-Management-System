const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        
    },
    otp:{
        type: String,
        required: true,
    },
    valid:{
        type:Boolean,
        required:true,
    }


    }
)

const Otp = mongoose.model('Otp', otpSchema);
module.exports = Otp;