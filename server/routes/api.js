const express = require('express');
const router = express.Router();
const jiraDataService = require('../services/jiraDataService');
const { getTableStructure } = require('../config/database');

// 错误处理中间件
const handleAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 解析问题类型参数
const parseIssueTypes = (issueTypesParam) => {
  if (!issueTypesParam) return null;
  
  if (typeof issueTypesParam === 'string') {
    return issueTypesParam.split(',').map(id => id.trim()).filter(id => id);
  }
  
  if (Array.isArray(issueTypesParam)) {
    return issueTypesParam;
  }
  
  return null;
};

// 解析项目参数
const parseProjects = (projectsParam) => {
  if (!projectsParam) return null;
  
  if (typeof projectsParam === 'string') {
    return projectsParam.split(',').map(key => key.trim()).filter(key => key);
  }
  
  if (Array.isArray(projectsParam)) {
    return projectsParam;
  }
  
  return null;
};

// 解析设计人员参数
const parseAssignees = (assigneesParam) => {
  if (!assigneesParam) return null;
  
  if (typeof assigneesParam === 'string') {
    return assigneesParam.split(',').map(name => name.trim()).filter(name => name);
  }
  
  if (Array.isArray(assigneesParam)) {
    return assigneesParam;
  }
  
  return null;
};

// 获取数据库表结构信息
router.get('/database/structure/:dbName', handleAsync(async (req, res) => {
  const { dbName } = req.params;
  const structure = await getTableStructure(dbName);
  
  res.json({
    success: true,
    data: structure,
    message: '获取表结构成功'
  });
}));

// 测试参数传递的端点
router.get('/test-params', handleAsync(async (req, res) => {
  console.log('=== 测试参数传递 ===');
  console.log('完整查询参数:', req.query);
  console.log('URL:', req.url);
  
  const { startDate, endDate, dateTimeType = 'created' } = req.query;
  console.log('解析后的参数:');
  console.log('- startDate:', startDate);
  console.log('- endDate:', endDate); 
  console.log('- dateTimeType:', dateTimeType);
  
  res.json({
    success: true,
    data: {
      received_params: req.query,
      parsed_params: { startDate, endDate, dateTimeType }
    },
    message: '参数测试成功'
  });
}));

// 获取仪表板摘要数据
router.get('/dashboard/summary', handleAsync(async (req, res) => {
  const { startDate, endDate, dateTimeType = 'created', issueTypes, projects, assignees } = req.query;
  const parsedIssueTypes = parseIssueTypes(issueTypes);
  const parsedProjects = parseProjects(projects);
  const parsedAssignees = parseAssignees(assignees);
  const summary = await jiraDataService.getDashboardSummary(startDate, endDate, dateTimeType, parsedIssueTypes, parsedProjects, parsedAssignees);
  
  res.json({
    success: true,
    data: summary,
    message: '获取仪表板摘要成功'
  });
}));

// 获取需求状态统计
router.get('/issues/status-stats', handleAsync(async (req, res) => {
  const { startDate, endDate, dateTimeType = 'created', issueTypes, projects, assignees } = req.query;
  const parsedIssueTypes = parseIssueTypes(issueTypes);
  const parsedProjects = parseProjects(projects);
  const parsedAssignees = parseAssignees(assignees);
  const stats = await jiraDataService.getIssueStatusStats(startDate, endDate, dateTimeType, parsedIssueTypes, parsedProjects, parsedAssignees);
  
  res.json({
    success: true,
    data: stats,
    message: '获取需求状态统计成功'
  });
}));

// 获取需求优先级分布
router.get('/issues/priority-distribution', handleAsync(async (req, res) => {
  const { startDate, endDate, dateTimeType = 'created', issueTypes, projects, assignees } = req.query;
  const parsedIssueTypes = parseIssueTypes(issueTypes);
  const parsedProjects = parseProjects(projects);
  const parsedAssignees = parseAssignees(assignees);
  const distribution = await jiraDataService.getIssuePriorityDistribution(startDate, endDate, dateTimeType, parsedIssueTypes, parsedProjects, parsedAssignees);
  
  res.json({
    success: true,
    data: distribution,
    message: '获取需求优先级分布成功'
  });
}));

// 获取需求类型统计
router.get('/issues/type-stats', handleAsync(async (req, res) => {
  const { startDate, endDate, issueTypes } = req.query;
  const parsedIssueTypes = parseIssueTypes(issueTypes);
  const stats = await jiraDataService.getIssueTypeStats(startDate, endDate, parsedIssueTypes);
  
  res.json({
    success: true,
    data: stats,
    message: '获取需求类型统计成功'
  });
}));

// 获取需求创建趋势
router.get('/issues/creation-trend', handleAsync(async (req, res) => {
  const { months = 12, startDate, endDate, dateTimeType = 'created', issueTypes, projects, assignees } = req.query;
  const parsedIssueTypes = parseIssueTypes(issueTypes);
  const parsedProjects = parseProjects(projects);
  const parsedAssignees = parseAssignees(assignees);
  const trend = await jiraDataService.getIssueCreationTrend(parseInt(months), startDate, endDate, dateTimeType, parsedIssueTypes, parsedProjects, parsedAssignees);
  
  res.json({
    success: true,
    data: trend,
    message: '获取需求创建趋势成功'
  });
}));

// 获取需求解决时间统计
router.get('/issues/resolution-time-stats', handleAsync(async (req, res) => {
  const { startDate, endDate, issueTypes } = req.query;
  const parsedIssueTypes = parseIssueTypes(issueTypes);
  const stats = await jiraDataService.getIssueResolutionTimeStats(startDate, endDate, parsedIssueTypes);
  
  res.json({
    success: true,
    data: stats,
    message: '获取需求解决时间统计成功'
  });
}));

// 获取项目统计
router.get('/projects/stats', handleAsync(async (req, res) => {
  console.log('=== 项目统计API调试 ===');
  console.log('原始查询参数:', req.query);
  
  const { startDate, endDate, dateTimeType = 'created', issueTypes, projects, assignees } = req.query;
  
  console.log('提取的参数:');
  console.log('- projects (原始):', projects);
  console.log('- issueTypes (原始):', issueTypes);
  console.log('- assignees (原始):', assignees);
  
  const parsedIssueTypes = parseIssueTypes(issueTypes);
  const parsedProjects = parseProjects(projects);
  const parsedAssignees = parseAssignees(assignees);
  
  console.log('解析后的参数:');
  console.log('- parsedProjects:', parsedProjects);
  console.log('- parsedIssueTypes:', parsedIssueTypes);
  console.log('- parsedAssignees:', parsedAssignees);
  
  const stats = await jiraDataService.getProjectStats(startDate, endDate, dateTimeType, parsedIssueTypes, parsedProjects, parsedAssignees);
  
  console.log(`返回项目数量: ${stats.length}`);
  console.log('========================');
  
  res.json({
    success: true,
    data: stats,
    debug: {
      originalParams: req.query,
      parsedParams: {
        parsedProjects,
        parsedIssueTypes,
        parsedAssignees
      }
    },
    message: '获取项目统计成功'
  });
}));

// 获取所有项目列表
router.get('/projects/list', handleAsync(async (req, res) => {
  const projects = await jiraDataService.getAllProjects();
  
  res.json({
    success: true,
    data: projects,
    message: '获取项目列表成功'
  });
}));

// 获取所有问题类型列表
router.get('/issues/types', handleAsync(async (req, res) => {
  const issueTypes = await jiraDataService.getAllIssueTypes();
  
  res.json({
    success: true,
    data: issueTypes,
    message: '获取问题类型列表成功'
  });
}));

// 获取所有设计人员列表
router.get('/assignees/list', handleAsync(async (req, res) => {
  const assignees = await jiraDataService.getAllAssignees();
  
  res.json({
    success: true,
    data: assignees,
    message: '获取设计人员列表成功'
  });
}));

// 获取经办人工作量统计
router.get('/assignees/workload-stats', handleAsync(async (req, res) => {
  const { startDate, endDate, dateTimeType = 'created', issueTypes, projects, assignees } = req.query;
  const parsedIssueTypes = parseIssueTypes(issueTypes);
  const parsedProjects = parseProjects(projects);
  const parsedAssignees = parseAssignees(assignees);
  const stats = await jiraDataService.getAssigneeWorkloadStats(startDate, endDate, dateTimeType, parsedIssueTypes, parsedProjects, parsedAssignees);
  
  res.json({
    success: true,
    data: stats,
    message: '获取经办人工作量统计成功'
  });
}));

// 获取需求历史变更统计
router.get('/issues/history-stats', handleAsync(async (req, res) => {
  const { startDate, endDate, issueTypes } = req.query;
  const parsedIssueTypes = parseIssueTypes(issueTypes);
  const stats = await jiraDataService.getIssueHistoryStats(startDate, endDate, parsedIssueTypes);
  
  res.json({
    success: true,
    data: stats,
    message: '获取需求历史变更统计成功'
  });
}));

// 健康检查接口
router.get('/health', handleAsync(async (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    },
    message: '服务运行正常'
  });
}));

// 错误处理中间件
router.use((error, req, res, next) => {
  console.error('API错误:', error);
  
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? error.message : '请联系管理员'
  });
});

module.exports = router; 