const express = require('express');
const router = express.Router();
const User = require('../models/User');

// 注册路由
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // 检查用户是否已存在
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                error: '用户名或邮箱已被注册' 
            });
        }
        
        // 创建新用户
        const user = new User({
            username,
            email,
            password
        });
        
        await user.save();
        
        // 保存session
        req.session.userId = user._id;
        
        res.status(201).json({ 
            message: '注册成功' 
        });
    } catch (error) {
        console.error('注册错误:', error);
        res.status(500).json({ 
            error: '注册失败，请稍后重试' 
        });
    }
});

// 登录路由
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 查找用户
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                error: '邮箱或密码错误' 
            });
        }
        
        // 验证密码
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                error: '邮箱或密码错误' 
            });
        }
        
        // 保存session
        req.session.userId = user._id;
        
        res.json({ 
            message: '登录成功' 
        });
    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({ 
            error: '登录失败，请稍后重试' 
        });
    }
});

// 登出路由
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ 
                error: '登出失败，请稍后重试' 
            });
        }
        res.json({ 
            message: '登出成功' 
        });
    });
});

module.exports = router; 