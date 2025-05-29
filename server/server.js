const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const { testConnection } = require('./config/database');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: false, // 开发环境下关闭CSP
}));

// 启用gzip压缩
app.use(compression());

// CORS配置
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// 解析JSON请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务（用于生产环境）
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// API路由
app.use('/api', apiRoutes);

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 生产环境下的前端路由处理
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// 全局错误处理
app.use((error, req, res, next) => {
  console.error('服务器错误:', error);
  
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? error.message : '请联系管理员'
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 启动服务器
async function startServer() {
  try {
    // 测试数据库连接
    console.log('🔄 正在测试数据库连接...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ 数据库连接失败，服务器启动中止');
      process.exit(1);
    }
    
    // 启动HTTP服务器
    app.listen(PORT, () => {
      console.log(`🚀 JIRA BI看板服务器已启动`);
      console.log(`📊 服务地址: http://localhost:${PORT}`);
      console.log(`🔗 API文档: http://localhost:${PORT}/api`);
      console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
      console.log(`📝 环境: ${process.env.NODE_ENV || 'development'}`);
    });
    
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

// 优雅关闭处理
process.on('SIGTERM', () => {
  console.log('📴 收到SIGTERM信号，正在优雅关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 收到SIGINT信号，正在优雅关闭服务器...');
  process.exit(0);
});

// 启动服务器
startServer(); 