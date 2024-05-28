const mongoose = require('mongoose');

const submitSchema = new mongoose.Schema({
    testid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test', 
        required: true
    },
    userid: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    },
    answer: [{
        type: String,
        required:true
    }],
    photo: [{
        type: String,
    }],
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected"],
        default: "Pending"
    },
    remainingtime:Number,
    warning:Number,
    fullscreenwarning:Number,
});

const Submit = mongoose.model('Submit', submitSchema);
module.exports = Submit;
