const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

// 配置multer存储
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads';
        // 确保上传目录存在
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // 生成唯一文件名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
    // 允许的文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('不支持的文件类型'), false);
    }
};

// 配置multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 限制5MB
    }
});

// 图片上传路由
router.post('/image', auth, upload.single('image'), (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '请先登录' });
        }

        if (!req.file) {
            return res.status(400).json({ error: '请选择要上传的图片' });
        }

        // 返回图片URL
        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({
            success: true,
            url: imageUrl
        });
    } catch (error) {
        console.error('上传图片错误:', error);
        res.status(500).json({ error: '上传失败，请稍后重试' });
    }
});

// 错误处理中间件
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: '文件大小不能超过5MB' });
        }
        return res.status(400).json({ error: '文件上传失败' });
    }
    
    if (error.message === '不支持的文件类型') {
        return res.status(400).json({ error: '只支持JPG、PNG和GIF格式的图片' });
    }
    
    console.error('文件上传错误:', error);
    res.status(500).json({ error: '服务器内部���误' });
});

module.exports = router; 