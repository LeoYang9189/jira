#!/bin/bash

echo "📊 JIRA数据分析看板服务监控"
echo "================================"

# 检查PM2状态
echo "🔍 PM2服务状态:"
pm2 status

echo ""
echo "🌐 服务健康检查:"

# 检查后端健康状态
echo -n "后端服务 (http://localhost:3001): "
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ 正常"
else
    echo "❌ 异常"
fi

# 检查前端服务
echo -n "前端服务 (http://localhost:3000): "
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ 正常"
else
    echo "❌ 异常"
fi

echo ""
echo "💾 内存使用情况:"
pm2 monit --no-daemon | head -20

echo ""
echo "📝 最近日志 (最后10行):"
echo "--- 后端日志 ---"
pm2 logs jira-backend --lines 5 --nostream

echo ""
echo "--- 前端日志 ---"
pm2 logs jira-frontend --lines 5 --nostream 