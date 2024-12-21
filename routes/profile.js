const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 获取个人资料页面
router.get('/', async (req, res) => {
    if (!req.user) {
        return res.redirect('/');
    }
    
    res.render('profile', {
        title: '个人资料',
        user: req.user
    });
});

// 更新个人资料
router.post('/update', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '请先登录' });
        }

        const { age, gender } = req.body;
        
        // 更新用户资料
        await User.findByIdAndUpdate(req.user._id, {
            'profile.age': age,
            'profile.gender': gender
        });

        res.json({ message: '个人资料更新成功' });
    } catch (error) {
        console.error('更新个人资料错误:', error);
        res.status(500).json({ error: '更新失败，请稍后重试' });
    }
});

module.exports = router; 