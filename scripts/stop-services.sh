#!/bin/bash

echo "🛑 停止JIRA数据分析看板服务..."

# 停止所有服务
pm2 stop jira-backend jira-frontend db-keepalive 2>/dev/null || true

echo "🗑️  删除PM2进程..."
pm2 delete jira-backend jira-frontend db-keepalive 2>/dev/null || true

echo "✅ 服务已停止" 