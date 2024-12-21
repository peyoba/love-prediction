const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const auth = require('../middleware/auth');

// 获取资源列表页
router.get('/', async (req, res) => {
    try {
        const { category, type, sort = 'newest' } = req.query;
        
        // 构建查询条件
        const query = { status: 'approved' };
        if (category) query.category = category;
        if (type) query.type = type;

        // 构建排序条件
        let sortOption = {};
        switch (sort) {
            case 'popular':
                sortOption = { downloadCount: -1 };
                break;
            case 'newest':
                sortOption = { createdAt: -1 };
                break;
            default:
                sortOption = { createdAt: -1 };
        }

        const resources = await Resource.find(query)
            .populate('uploader', 'username')
            .sort(sortOption);

        res.render('resources', {
            title: '资源中心',
            user: req.user,
            resources,
            category,
            type,
            sort
        });
    } catch (error) {
        console.error('获取资源列表错误:', error);
        res.status(500).send('服务器内部错误');
    }
});

// 获取资源详情
router.get('/:id', async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id)
            .populate('uploader', 'username');

        if (!resource) {
            return res.status(404).render('error', {
                title: '资源未找到',
                message: '您访问的资源不存在'
            });
        }

        res.render('resource-detail', {
            title: resource.title,
            user: req.user,
            resource
        });
    } catch (error) {
        console.error('获取资源详情错误:', error);
        res.status(500).send('服务器内部错误');
    }
});

// 上传资源
router.post('/', auth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '请先登录' });
        }

        const {
            title,
            description,
            type,
            category,
            url,
            size,
            format,
            isFree,
            price
        } = req.body;

        const resource = new Resource({
            title,
            description,
            type,
            category,
            url,
            size,
            format,
            isFree: Boolean(isFree),
            price: Number(price) || 0,
            uploader: req.user._id
        });

        await resource.save();

        res.json({
            success: true,
            resource: await resource.populate('uploader', 'username')
        });
    } catch (error) {
        console.error('上传资源错误:', error);
        res.status(500).json({ error: '上传失败，请稍后重试' });
    }
});

// 下载资源
router.get('/:id/download', auth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '请先登录' });
        }

        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ error: '资源不存在' });
        }

        // 增加下载次数
        resource.downloadCount += 1;
        await resource.save();

        res.json({
            success: true,
            downloadUrl: resource.url
        });
    } catch (error) {
        console.error('下载资源错误:', error);
        res.status(500).json({ error: '下载失败，请稍后重试' });
    }
});

module.exports = router; 