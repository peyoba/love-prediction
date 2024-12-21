const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const auth = require('../middleware/auth');

// 获取文章归档数据
async function getArchives() {
    return await Article.aggregate([
        { $match: { status: 'published' } },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" }
                },
                count: { $sum: 1 },
                articles: { $push: { id: "$_id", title: "$title" } }
            }
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } }
    ]);
}

// 获取热门文章
async function getPopularArticles() {
    return await Article.find({ status: 'published' })
        .sort({ views: -1 })
        .limit(5)
        .select('title views likes comments');
}

// 获取博客首页（添加搜索和分类功能）
router.get('/', async (req, res) => {
    try {
        const { keyword, category, tag, sort = 'newest' } = req.query;
        
        // 构建查询条件
        const query = { status: 'published' };
        if (keyword) {
            query.$or = [
                { title: new RegExp(keyword, 'i') },
                { content: new RegExp(keyword, 'i') },
                { tags: new RegExp(keyword, 'i') }
            ];
        }
        if (category) {
            query.category = category;
        }
        if (tag) {
            query.tags = tag;
        }

        // 构建排序条件
        let sortOption = {};
        switch (sort) {
            case 'popular':
                sortOption = { views: -1 };
                break;
            case 'comments':
                sortOption = { 'comments.length': -1 };
                break;
            case 'newest':
            default:
                sortOption = { createdAt: -1 };
        }

        // 获取文章列表
        const articles = await Article.find(query)
            .populate('author', 'username')
            .sort(sortOption)
            .limit(10);

        // 获取分类统计
        const categories = await Article.aggregate([
            { $match: { status: 'published' } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // 获取标签统计
        const tags = await Article.aggregate([
            { $match: { status: 'published' } },
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);

        // 获取归档数据
        const archives = await getArchives();
        
        // 获取热门文章
        const popularArticles = await getPopularArticles();

        res.render('blog', {
            title: '博客',
            user: req.user,
            articles,
            categories,
            tags,
            archives,
            popularArticles,
            filters: { keyword, category, tag, sort }
        });
    } catch (error) {
        console.error('获取博客文章错误:', error);
        res.status(500).send('服务器内部错误');
    }
});

// 获取文章详情
router.get('/articles/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
            .populate('author', 'username')
            .populate('comments.user', 'username');

        if (!article) {
            return res.status(404).render('error', {
                title: '文章未找到',
                message: '您访问的文章不存在'
            });
        }

        // 增加浏览
        article.views += 1;
        await article.save();

        // 获取相关文章
        const relatedArticles = await Article.find({
            _id: { $ne: article._id },
            category: article.category,
            status: 'published'
        })
        .limit(3)
        .select('title summary coverImage');

        res.render('article', {
            title: article.title,
            user: req.user,
            article,
            relatedArticles
        });
    } catch (error) {
        console.error('获取文章详情错误:', error);
        res.status(500).send('服务器内部错误');
    }
});

// 创建文章
router.post('/articles', auth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '请先登录' });
        }

        const { title, content, summary, category, tags } = req.body;
        
        const article = new Article({
            title,
            content,
            summary,
            category,
            tags: tags.split(',').map(tag => tag.trim()),
            author: req.user._id
        });

        await article.save();

        res.json({
            success: true,
            article: await article.populate('author', 'username')
        });
    } catch (error) {
        console.error('创建文章错误:', error);
        res.status(500).json({ error: '创建失败，请稍后重试' });
    }
});

// 点赞文章
router.post('/articles/:id/like', auth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '请先登录' });
        }

        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ error: '文章不存在' });
        }

        const likeIndex = article.likes.indexOf(req.user._id);
        if (likeIndex === -1) {
            article.likes.push(req.user._id);
        } else {
            article.likes.splice(likeIndex, 1);
        }

        await article.save();

        res.json({
            success: true,
            likes: article.likes.length,
            isLiked: likeIndex === -1
        });
    } catch (error) {
        console.error('点赞操作错误:', error);
        res.status(500).json({ error: '操作失败，请稍后重试' });
    }
});

// 评论文章
router.post('/articles/:id/comments', auth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '请先登录' });
        }

        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ error: '文章不存在' });
        }

        const { content } = req.body;
        article.comments.push({
            user: req.user._id,
            content
        });

        await article.save();

        const updatedArticle = await Article.findById(article._id)
            .populate('comments.user', 'username');

        res.json({
            success: true,
            comments: updatedArticle.comments
        });
    } catch (error) {
        console.error('评论错误:', error);
        res.status(500).json({ error: '评论失败，请稍后重试' });
    }
});

// 获取文章编辑页面
router.get('/articles/new', auth, (req, res) => {
    if (!req.user) {
        return res.redirect('/');
    }
    res.render('article-edit', {
        title: '写文章',
        user: req.user,
        article: null
    });
});

// 获取文章编辑页面（编辑已有文章）
router.get('/articles/:id/edit', auth, async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect('/');
        }

        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).render('error', {
                title: '文章未找到',
                message: '您要编辑的文章不存在'
            });
        }

        // 检查是否是文章作者
        if (article.author.toString() !== req.user._id.toString()) {
            return res.status(403).render('error', {
                title: '没有权限',
                message: '您没有权限编辑这篇文章'
            });
        }

        res.render('article-edit', {
            title: '编辑文章',
            user: req.user,
            article
        });
    } catch (error) {
        console.error('获取文章编辑页面错误:', error);
        res.status(500).send('服务器内部错误');
    }
});

// 删除文章
router.delete('/articles/:id', auth, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: '请先登录' });
        }

        const article = await Article.findById(req.params.id);
        if (!article) {
            return res.status(404).json({ error: '文章不存在' });
        }

        // 检查是否是文章作者
        if (article.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: '没有权限删除这篇文章' });
        }

        await article.deleteOne();
        res.json({ success: true });
    } catch (error) {
        console.error('删除文章错误:', error);
        res.status(500).json({ error: '删除失败，请稍后重试' });
    }
});

// 添加归档页面路由
router.get('/archives/:year/:month', async (req, res) => {
    try {
        const { year, month } = req.params;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const articles = await Article.find({
            status: 'published',
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        })
        .populate('author', 'username')
        .sort({ createdAt: -1 });

        res.render('archive', {
            title: `${year}年${month}月归档`,
            user: req.user,
            articles,
            year,
            month
        });
    } catch (error) {
        console.error('获取归档文章错误:', error);
        res.status(500).send('服务器内部错误');
    }
});

module.exports = router; 