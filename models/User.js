const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    profile: {
        age: Number,
        gender: String,
        personality: String,
        interests: [String],
        values: [String],
        education: String,
        occupation: String,
        income: {
            type: String,
            enum: ['0-5k', '5k-10k', '10k-20k', '20k-50k', '50k+']
        },
        location: String,
        marriageGoal: {
            type: String,
            enum: ['恋爱', '结婚', '未定']
        },
        lifestyle: {
            workStyle: String,
            livingHabits: [String],
            socialStyle: String
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// 验证密码的方法
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 