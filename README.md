# JIRA 数据分析看板

一个基于 React + Node.js 的 JIRA 数据可视化分析平台。

## 🚀 快速启动

### 方法一：使用 PM2 进程管理器（推荐）

1. **安装依赖**
```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client && npm install && cd ..

# 全局安装 PM2
npm install -g pm2
```

2. **启动服务**
```bash
# 使用脚本启动所有服务
./scripts/start-services.sh

# 或者手动启动
pm2 start ecosystem.config.js
```

3. **访问应用**
- 前端地址：http://localhost:3000
- 后端地址：http://localhost:3001

### 方法二：传统方式启动

1. **启动后端服务**
```bash
# 在项目根目录
node server/server.js
# 或者
npm run dev
```

2. **启动前端服务**
```bash
# 在 client 目录
cd client
npm start
```

## 📋 PM2 常用命令

```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs
pm2 logs jira-backend
pm2 logs jira-frontend

# 重启服务
pm2 restart all
pm2 restart jira-backend

# 停止服务
pm2 stop all
./scripts/stop-services.sh

# 重启服务
pm2 restart all
./scripts/restart-services.sh

# 删除服务
pm2 delete all

# 保存 PM2 配置（开机自启）
pm2 save
pm2 startup
```

## 🔧 配置说明

### 数据库配置
- 服务器：172.31.23.187
- 端口：3306
- 数据库：jira
- 用户：read_user1
- 密码：Read@123456

### 环境变量
可以在 `ecosystem.config.js` 中修改环境变量：
- `NODE_ENV`: 运行环境
- `PORT`: 端口号

## 📊 功能特性

- ✅ 仪表板数据摘要
- ✅ 需求状态统计
- ✅ 创建趋势分析
- ✅ 日期筛选功能
- ✅ 问题类型筛选
- ✅ 项目筛选
- ✅ 实时数据联动

## 🛠️ 开发说明

### 项目结构
```
jira/
├── server/                 # 后端代码
│   ├── server.js          # 服务器入口
│   ├── routes/            # API 路由
│   ├── services/          # 业务逻辑
│   └── config/            # 配置文件
├── client/                # 前端代码
│   ├── src/               # React 源码
│   ├── public/            # 静态资源
│   └── package.json       # 前端依赖
├── scripts/               # 工具脚本
├── logs/                  # 日志文件
├── ecosystem.config.js    # PM2 配置
└── package.json           # 后端依赖
```

### 添加新的筛选条件
1. 在 `FilterParams` 接口中添加新字段
2. 在后端 `jiraDataService.js` 中添加筛选逻辑
3. 在前端组件中添加 UI 控件
4. 更新 API 路由支持新参数

## 🔍 故障排查

### 服务无法启动
```bash
# 查看 PM2 日志
pm2 logs

# 检查端口占用
lsof -i :3001
lsof -i :3000

# 重启服务
pm2 restart all
```

### 数据库连接问题
```bash
# 测试数据库连接
node scripts/testDateFilter.js
```

### 前端无法访问后端
- 检查后端服务是否正常运行
- 确认端口配置正确
- 检查防火墙设置

## 📝 日志文件

- 后端日志：`./logs/combined.log`
- 前端日志：`./logs/frontend-combined.log`
- 错误日志：`./logs/error.log`

## 🔄 自动重启

PM2 会自动监控服务状态，如果服务崩溃会自动重启。可以通过以下配置调整：

```javascript
// ecosystem.config.js
{
  autorestart: true,        // 自动重启
  max_memory_restart: '1G', // 内存超限重启
  watch: false,             // 文件变化重启（开发环境可设为 true）
}
```

## 📞 技术支持

如有问题，请检查：
1. PM2 服务状态：`pm2 status`
2. 应用日志：`pm2 logs`
3. 数据库连接：运行测试脚本
4. 端口占用：`lsof -i :3001`

## 🚀 功能特性

- **📊 数据概览**: 显示总需求数、完成率、进行中任务等关键指标
- **📈 趋势分析**: 需求创建趋势图表，支持按月查看
- **🥧 状态分布**: 需求状态饼图，直观展示各状态占比
- **🔄 实时刷新**: 支持手动刷新数据，保持数据最新
- **📱 响应式设计**: 适配桌面端和移动端

## 🛠 技术栈

### 后端
- **Node.js** + **Express**: 服务器框架
- **MySQL2**: 数据库连接
- **CORS**: 跨域支持
- **Helmet**: 安全中间件

### 前端
- **React 18** + **TypeScript**: 前端框架
- **Material-UI**: UI组件库
- **Recharts**: 图表库
- **Axios**: HTTP客户端

## 📋 系统要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- MySQL数据库访问权限

## 🎨 自定义开发

### 添加新图表
1. 在 `client/src/components/Charts/` 创建新组件
2. 在 `server/services/jiraDataService.js` 添加数据查询方法
3. 在 `server/routes/api.js` 添加API路由
4. 在 `client/src/App.tsx` 中集成新组件

### 修改样式主题
在 `client/src/App.tsx` 中修改 Material-UI 主题配置：

```typescript
const theme = createTheme({
  palette: {
    primary: { main: '#你的主色' },
    // 其他配置...
  }
});
```

## 🐛 故障排除

### 数据库连接失败
1. 检查数据库服务器是否可访问
2. 验证用户名密码是否正确
3. 确认数据库名称是否存在

### 前端无法加载数据
1. 检查后端服务是否启动 (http://localhost:3001/health)
2. 查看浏览器控制台错误信息
3. 检查CORS配置

### 图表显示异常
1. 检查数据格式是否正确
2. 确认表结构与SQL查询匹配
3. 查看浏览器控制台错误

## 📝 开发规范

- 遵循SOLID原则
- 函数单一职责
- 异常必须处理
- 变量命名语义化
- 组件必须写TypeScript类型

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 联系方式

如有问题，请联系开发团队。 