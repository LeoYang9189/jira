#!/bin/bash

echo "🚀 启动JIRA数据分析看板服务..."

# 检查PM2是否安装
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2未安装，请先运行: npm install -g pm2"
    exit 1
fi

# 停止现有的服务（如果有的话）
echo "🛑 停止现有服务..."
pm2 stop jira-backend jira-frontend db-keepalive 2>/dev/null || true
pm2 delete jira-backend jira-frontend db-keepalive 2>/dev/null || true

# 启动后端服务
echo "🔧 启动后端服务..."
pm2 start ecosystem.config.js --only jira-backend --env development

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 3

# 检查后端是否正常运行
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ 后端服务启动成功"
else
    echo "❌ 后端服务启动失败"
    pm2 logs jira-backend --lines 10
    exit 1
fi

# 启动数据库保活服务
echo "💾 启动数据库保活服务..."
pm2 start ecosystem.config.js --only db-keepalive

# 启动前端服务
echo "🎨 启动前端服务..."
pm2 start ecosystem.config.js --only jira-frontend

echo "📊 服务启动完成！"
echo ""
echo "📱 前端地址: http://localhost:3000"
echo "🔧 后端地址: http://localhost:3001"
echo "💾 数据库保活: 每5分钟自动ping"
echo ""
echo "📋 常用命令:"
echo "  查看状态: pm2 status"
echo "  查看日志: pm2 logs"
echo "  监控服务: ./scripts/monitor-services.sh"
echo "  重启服务: pm2 restart all"
echo "  停止服务: pm2 stop all"
echo "  删除服务: pm2 delete all" 