# Node.js 项目部署完整指南

## 目录
1. [前期准备](#前期准备)
2. [Vercel 部署流程](#vercel-部署流程)
3. [MongoDB Atlas 配置](#mongodb-atlas-配置)
4. [域名配置](#域名配置)
5. [项目优化](#项目优化)
6. [故障排除](#故障排除)

## 前期准备

### 1. 环境要求
- Node.js 14.0 或以上
- npm 6.0 或以上
- Git

### 2. 账号准备
- GitHub 账号
- Vercel 账号（可使用 GitHub 账号登录）
- MongoDB Atlas 账号
- 域名服务商账号（如阿里云）

### 3. 项目准备
- 确保项目有 package.json
- 确保项目有正确的启动脚本
- 确保所有依赖都已列在 package.json 中

## Vercel 部署流程

### 1. 安装 Vercel CLI
```bash
npm i -g vercel
```

### 2. 配置 vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node",
      "config": {
        "includeFiles": ["views/**"]
      }
    },
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/images/(.*)",
      "dest": "/public/images/$1"
    },
    {
      "src": "/css/(.*)",
      "dest": "/public/css/$1"
    },
    {
      "src": "/js/(.*)",
      "dest": "/public/js/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

### 3. 部署步骤
1. 登录 Vercel
```bash
vercel login
```

2. 初始部署
```bash
vercel
```

3. 生产环境部署
```bash
vercel --prod
```

## MongoDB Atlas 配置

### 1. 创建数据库
1. 登录 MongoDB Atlas
2. 创建新集群（选择免费层）
3. 设置数据库用户
4. 配置网络访问（IP 白名单）

### 2. 获取连接字符串
1. 点击 "Connect"
2. 选择 "Connect your application"
3. 复制连接字符串

### 3. 配置数据库连接
```javascript
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    keepAlive: true,
    retryWrites: true
});
```

## 域名配置

### 1. 阿里云 DNS 配置
1. 登录阿里云控制台
2. 进入域名解析设置
3. 添加记录：
   - 记录类型：CNAME
   - 主机记录：ai（二级域名前缀）
   - 记录值：cname.vercel-dns.com
   - TTL：10分钟

### 2. Vercel 域名绑定
1. 进入项目设置
2. 点击 "Domains"
3. ���击 "Add Domain"
4. 输入域名（如：ai.peyoba.top）
5. 等待验证完成

## 项目优化

### 1. 性能监控
```javascript
// 添加请求时间监控
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.url} - ${duration}ms`);
    });
    next();
});
```

### 2. 健康检查
```javascript
app.get('/health', async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database not connected');
        }
        res.json({ 
            status: 'ok',
            dbStatus: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({ 
            status: 'error',
            message: error.message
        });
    }
});
```

### 3. 错误处理
```javascript
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        error: process.env.NODE_ENV === 'production' 
            ? '服务器内部错误' 
            : err.message
    });
});
```

## 故障排除

### 1. Vercel 部署问题
- 检查 vercel.json 配置是否正确
- 确保所有依赖都已正确安装
- 检查环境变量是否正确设置
- 查看部署日志排查错误

### 2. MongoDB 连接问题
- 确认连接字符串格式正确
- 检查数据库用户权限
- 验证 IP 白名单设置
- 检查数据库状态

### 3. 域名解析问题
- 等待 DNS 解析生效（通常需要几分钟）
- 使用 ping 命令检查域名解析
- 检查 CNAME 记录配置
- 验证 SSL 证书状态

## 维护和更新

### 1. 版本更新流程
```bash
# 更新版本号
npm version patch/minor/major

# 提交更改
git add .
git commit -m "chore: upgrade to version x.x.x"

# 创建标签
git tag -a vx.x.x -m "Version x.x.x - Description"

# 推送更新
git push origin main
git push origin vx.x.x
```

### 2. 监控和日志
- 使用 Vercel 仪表板监控性能
- 定期检查健康检查接口
- 查看服务器日志排查问题
- 监控数据库连接状态

### 3. 备份策略
- 定期备份数据库
- 保存项目配置文件
- 记录环境变量
- 维护文档更新 