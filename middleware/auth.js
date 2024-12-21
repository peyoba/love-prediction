const User = require('../models/User');

// 用户认证中间件
const auth = async (req, res, next) => {
    try {
        // 检查session中是否有userId
        if (!req.session.userId) {
            return next();
        }

        // 根据userId查找用户
        const user = await User.findById(req.session.userId);
        if (!user) {
            return next();
        }

        // 将用户信息添加到请求对象中
        req.user = user;
        next();
    } catch (error) {
        console.error('认证错误:', error);
        next();
    }
};

module.exports = auth; 