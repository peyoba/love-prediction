const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    partnerInfo: {
        age: Number,
        gender: String,
        personality: String,
        interests: [String],
        values: [String]
    },
    compatibility: {
        score: Number,
        aspects: {
            personality: Number,
            lifestyle: Number,
            values: Number
        },
        analysis: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Prediction', predictionSchema); 