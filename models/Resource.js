const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['电子书', '视频', '音频', '文档', '工具'],
        required: true
    },
    category: {
        type: String,
        enum: ['恋爱指南', '婚姻辅导', '心理咨询', '个人提升', '其他'],
        required: true
    },
    url: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        default: '/images/default-resource.jpg'
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    size: {
        type: Number, // 文件大小（字节）
        required: true
    },
    format: {
        type: String, // 文件格式
        required: true
    },
    isFree: {
        type: Boolean,
        default: true
    },
    price: {
        type: Number,
        default: 0
    },
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// 更新时间中间件
resourceSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

module.exports = mongoose.model('Resource', resourceSchema); 