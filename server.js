const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const authRoutes = require('./routes/auth');
const auth = require('./middleware/auth');
const profileRoutes = require('./routes/profile');
const predictionRoutes = require('./routes/prediction');
const feedbackRoutes = require('./routes/feedback');
const communityRoutes = require('./routes/community');
const blogRoutes = require('./routes/blog');
const resourceRoutes = require('./routes/resources');
const uploadRoutes = require('./routes/upload');
const Article = require('./models/Article');
const Post = require('./models/Post');
const User = require('./models/User');
const Prediction = require('./models/Prediction');

const app = express();
const PORT = 3000;

// 连接MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/love-prediction')
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// 配置session
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb://127.0.0.1:27017/love-prediction'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 24小时
    }
}));

// 解析JSON请求体
app.use(express.json());

// 设置模板引擎
app.set('view engine', 'ejs');

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// 添加认证路由
app.use('/auth', authRoutes);

// 添加认证中间件
app.use(auth);

// 添加个人资料路由
app.use('/profile', profileRoutes);

// 添加预测路由
app.use('/prediction', predictionRoutes);

// 添加反馈路由
app.use('/feedback', feedbackRoutes);

// 添加社区路由
app.use('/community', communityRoutes);

// 添加博客路由
app.use('/blog', blogRoutes);

// 添加资源路由
app.use('/resources', resourceRoutes);

// 添加上传路由
app.use('/upload', uploadRoutes);

// 首页路由
app.get('/', async (req, res) => {
    try {
        // 获取最新文章
        const articles = await Article.find({ status: 'published' })
            .sort({ createdAt: -1 })
            .limit(3);

        // 获取热门社区帖子
        const posts = await Post.find()
            .populate('user', 'username')
            .sort({ views: -1 })
            .limit(4);

        // 获取统计数据
        const stats = {
            users: await User.countDocuments(),
            predictions: await Prediction.countDocuments(),
            matches: Math.floor(await Prediction.countDocuments() * 0.8), // 示例：80%的预测成功
            articles: await Article.countDocuments({ status: 'published' })
        };

        // 示例用户评价
        const testimonials = [
            {
                name: '张先生',
                title: '成功配对用户',
                content: '通过AI预测找到了我的另一半，现在我们已经在一起一年了！',
                avatar: '/images/avatars/user1.jpg'
            },
            {
                name: '李女士',
                title: '注册用户',
                content: '预测结果非常准确，帮助我更好地了解自己和伴侣的关系。',
                avatar: '/images/avatars/user2.jpg'
            },
            {
                name: '王先生',
                title: '资深用户',
                content: '这个平台不仅提供预测，还有很多有价值的文章和建议。',
                avatar: '/images/avatars/user3.jpg'
            }
        ];

        res.render('index', {
            title: 'AI 恋爱/婚姻契合度预测网站',
            description: '使用AI技术预测恋爱和婚姻的契合度',
            user: req.user,
            articles,
            posts,
            stats,
            testimonials
        });
    } catch (error) {
        console.error('渲染首页时发生错误:', error);
        res.status(500).send('服务器内部错误');
    }
});

// 404错误处理
app.use((req, res) => {
    res.status(404).render('index', {
        title: '页面未找到',
        description: '您访问的页面不存在'
    });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err.stack);
    
    // 修改数据库错误检查逻辑
    if (err.name === 'MongooseError' || err.name === 'MongoServerError') {
        return res.status(500).render('error', {
            title: '数据库错误',
            message: '数据库操作失败，请稍后再试',
            error: process.env.NODE_ENV === 'development' ? err : {}
        });
    }
    
    res.status(500).render('error', {
        title: '服务器错误',
        message: '服务器发生了一些问题',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 添加一个简单的健康检查路由
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// 添加未捕获的异常处理
process.on('uncaughtException', (err) => {
    console.error('未捕获的异常:', err);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('未处理的Promise拒绝:', err);
    process.exit(1);
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

