const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');

// 获取反馈页面
router.get('/', auth, (req, res) => {
    if (!req.user) {
        return res.redirect('/');
    }
    res.render('feedback', {
        title: '意见反馈',
        user: req.user
    });
});

// 提交反馈
router.post('/submit', auth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '请先登录' });
        }

        const { type, content } = req.body;
        
        const feedback = new Feedback({
            user: req.user._id,
            type,
            content
        });

        await feedback.save();

        res.json({
            success: true,
            message: '感谢您的反馈！'
        });
    } catch (error) {
        console.error('提交反馈错误:', error);
        res.status(500).json({ error: '提交失败，请稍后重试' });
    }
});

// 获取用户的反馈历史
router.get('/history', auth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '请先登录' });
        }

        const feedbacks = await Feedback.find({ user: req.user._id })
            .sort({ createdAt: -1 });

        res.json(feedbacks);
    } catch (error) {
        console.error('获取反馈历史错误:', error);
        res.status(500).json({ error: '获取历史记录失败' });
    }
});

module.exports = router; 