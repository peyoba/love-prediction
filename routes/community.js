const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// 获取社区首页
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'username')
            .sort({ createdAt: -1 })
            .limit(20);

        res.render('community', {
            title: '社区',
            user: req.user,
            posts
        });
    } catch (error) {
        console.error('获取社区帖子错误:', error);
        res.status(500).send('服务器内部错误');
    }
});

// 创建帖子
router.post('/posts', auth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '请先登录' });
        }

        const { title, content, category, tags } = req.body;
        
        const post = new Post({
            user: req.user._id,
            title,
            content,
            category,
            tags: tags.split(',').map(tag => tag.trim())
        });

        await post.save();

        res.json({
            success: true,
            post: await post.populate('user', 'username')
        });
    } catch (error) {
        console.error('创建帖子错误:', error);
        res.status(500).json({ error: '创建失败，请稍后重试' });
    }
});

// 获取帖子详情
router.get('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('user', 'username')
            .populate('comments.user', 'username');

        if (!post) {
            return res.status(404).render('error', {
                title: '帖子未找到',
                message: '您访问的帖子不存在'
            });
        }

        // 增加浏览量
        post.views += 1;
        await post.save();

        res.render('post', {
            title: post.title,
            user: req.user,
            post
        });
    } catch (error) {
        console.error('获取帖子详情错误:', error);
        res.status(500).send('服务器内部错误');
    }
});

// 添加评论
router.post('/posts/:id/comments', auth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '请先登录' });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: '帖子不存在' });
        }

        const { content } = req.body;
        post.comments.push({
            user: req.user._id,
            content
        });

        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate('comments.user', 'username');

        res.json({
            success: true,
            comments: updatedPost.comments
        });
    } catch (error) {
        console.error('添加评论错误:', error);
        res.status(500).json({ error: '评论失败，请稍后重试' });
    }
});

// 点赞/取消点赞
router.post('/posts/:id/like', auth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '请先登录' });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: '帖子不存在' });
        }

        const likeIndex = post.likes.indexOf(req.user._id);
        if (likeIndex === -1) {
            post.likes.push(req.user._id);
        } else {
            post.likes.splice(likeIndex, 1);
        }

        await post.save();

        res.json({
            success: true,
            likes: post.likes.length,
            isLiked: likeIndex === -1
        });
    } catch (error) {
        console.error('点赞操作错误:', error);
        res.status(500).json({ error: '操作失败，请稍后重试' });
    }
});

module.exports = router; 