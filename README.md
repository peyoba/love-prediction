# AI恋爱预测系统
## 项目简介
I恋爱预测系统是一个基于人工智能的智能匹配系统，帮助用户找到最适合的伴侣。通过先进的算法分析用户的性格、兴趣和价值观，为用户提供科学的匹配建议。
## 在线访问
 生产环境：[https://love-prediction-5la8rskfr-peyobas-projects.vercel.app](https://love-prediction-5la8rskfr-peyobas-projects.vercel.app)
## 主要功能
 AI预测匹配
 * 性格匹配分析
 * 兴趣契合度评估
 * 价值观相似度计算
 * 匹配报告生成
 用户社区
 * 经验分享
 * 情感交流
 * 互动评论
 博客系统
 * 情感文章
 * 专家建议
 * 成功案例
 资源中心
 * 心理测试
 * 学习资料
 * 专业指导
 个人中心
 * 资料管理
 * 预测历史
 * 收藏管理
## 技术栈
 前端
 * HTML5, CSS3, JavaScript (ES6+)
 * EJS 模板引擎
 * 响应式设计
 后端
 * Node.js
 * Express
 * MongoDB Atlas
 部署
 * Vercel 部署平台
 * 自动化构建部署
 工具
 * Git 版本控制
 * npm 包管理
 * Nodemon 开发服务器
## 本地开发
. 克隆项目
bash
git clone https://github.com/peyoba/love-prediction.git
2. 安装依赖
bash
cd love-prediction
npm install
3. 配置环境变量
- 创建 .env 文件
- 添加必要的环境变量：
env
MONGODB_URI=你的MongoDB连接字符串
SESSION_SECRET=你的session密钥

4. 启动项目
bash
开发模式
npm run dev
生产模式
npm start

## 部署
项目使用 Vercel 进行部署：
1. 安装 Vercel CLI: `npm i -g vercel`
2. 登录 Vercel: `vercel login`
3. 部署: `vercel --prod`

## 项目结构
```
love-prediction/
├── public/          # 静态资源
├── views/           # 视图模板
├── routes/          # 路由文件
├── models/          # 数据模型
├── middleware/      # 中间件
├── config/          # 配置文件
└── server.js        # 入口文件
```

## 版本历史
查看 [CHANGELOG.md](CHANGELOG.md) 了解详细更新历史。

## 许可证
MIT License

## 作者
peyoba

## 致谢
感谢所有贡献者的付出。

## 联系方式
- GitHub: [peyoba](https://github.com/peyoba)