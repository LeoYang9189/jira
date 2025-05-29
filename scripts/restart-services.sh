#!/bin/bash

echo "🔄 重启JIRA数据分析看板服务..."

# 重启所有服务
pm2 restart jira-backend jira-frontend db-keepalive

echo "✅ 服务已重启"
echo ""
echo "📋 查看状态: pm2 status"
echo "📋 查看日志: pm2 logs"
echo "📋 监控服务: ./scripts/monitor-services.sh" 