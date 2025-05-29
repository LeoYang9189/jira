const { pool } = require('../config/database');

class JiraDataService {
  
  // 构建日期筛选条件
  buildDateFilter(startDate, endDate, dateTimeType = 'created') {
    console.log(`构建日期筛选: startDate=${startDate}, endDate=${endDate}, dateTimeType=${dateTimeType}`);
    
    if (!startDate && !endDate) {
      return '';
    }
    
    let dateFilter = '';
    
    if (dateTimeType === 'created') {
      // 原有的创建时间筛选
      if (startDate && endDate) {
        dateFilter = `AND j.CREATED BETWEEN '${startDate}' AND '${endDate} 23:59:59'`;
      } else if (startDate) {
        dateFilter = `AND j.CREATED >= '${startDate}'`;
      } else if (endDate) {
        dateFilter = `AND j.CREATED <= '${endDate} 23:59:59'`;
      }
      console.log(`创建时间筛选: ${dateFilter}`);
    } else {
      // 自定义时间字段筛选，需要通过CHANGE_HISTORY表查询
      const fieldNameMap = {
        'completed_design': '完成时间(设计)',
        'closed': '关闭时间',
        'actual_release': '实际发布日'
      };
      
      const fieldName = fieldNameMap[dateTimeType];
      console.log(`自定义时间字段: ${dateTimeType} -> ${fieldName}`);
      
      if (fieldName) {
        // 构建子查询，从changegroup和changeitem表中查找符合时间条件的issue
        // 重要：只包含真正设置了时间值的变更，排除清空时间的操作
        let timeCondition = '';
        if (startDate && endDate) {
          timeCondition = `AND cg.CREATED BETWEEN '${startDate}' AND '${endDate} 23:59:59'`;
        } else if (startDate) {
          timeCondition = `AND cg.CREATED >= '${startDate}'`;
        } else if (endDate) {
          timeCondition = `AND cg.CREATED <= '${endDate} 23:59:59'`;
        }
        
        dateFilter = `AND j.ID IN (
          SELECT DISTINCT cg.issueid 
          FROM changegroup cg 
          INNER JOIN changeitem ci ON cg.ID = ci.groupid 
          WHERE ci.FIELD = '${fieldName}' 
            AND ci.FIELDTYPE = 'custom'
            AND ci.NEWSTRING IS NOT NULL 
            AND ci.NEWSTRING != ''
            ${timeCondition}
        )`;
        console.log(`自定义时间筛选: ${dateFilter}`);
      }
    }
    
    return dateFilter;
  }

  // 构建问题类型筛选条件
  buildIssueTypeFilter(issueTypes) {
    if (!issueTypes || !Array.isArray(issueTypes) || issueTypes.length === 0) {
      return '';
    }
    
    const typeIds = issueTypes.map(id => parseInt(id)).filter(id => !isNaN(id));
    if (typeIds.length === 0) {
      return '';
    }
    
    return `AND j.issuetype IN (${typeIds.join(',')})`;
  }

  // 构建项目筛选条件
  buildProjectFilter(projects) {
    console.log('构建项目筛选条件:', projects);
    
    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      console.log('项目筛选为空，返回空条件');
      return '';
    }
    
    const projectKeys = projects.map(key => `'${key}'`).join(',');
    const filter = `AND p.pkey IN (${projectKeys})`;
    console.log('生成的项目筛选条件:', filter);
    return filter;
  }

  // 构建设计人员筛选条件
  buildAssigneeFilter(assignees) {
    if (!assignees || !Array.isArray(assignees) || assignees.length === 0) {
      return '';
    }
    
    const assigneeNames = assignees.map(name => `'${name}'`).join(',');
    return `AND j.ASSIGNEE IN (${assigneeNames})`;
  }

  // 构建完整的筛选条件
  buildFilters(startDate, endDate, dateTimeType, issueTypes, projects, assignees) {
    const dateFilter = this.buildDateFilter(startDate, endDate, dateTimeType);
    const typeFilter = this.buildIssueTypeFilter(issueTypes);
    const projectFilter = this.buildProjectFilter(projects);
    const assigneeFilter = this.buildAssigneeFilter(assignees);
    return `${dateFilter} ${typeFilter} ${projectFilter} ${assigneeFilter}`;
  }
  
  // 获取需求状态统计
  async getIssueStatusStats(startDate = null, endDate = null, dateTimeType = 'created', issueTypes = null, projects = null, assignees = null) {
    try {
      const connection = await pool.getConnection();
      const filters = this.buildFilters(startDate, endDate, dateTimeType, issueTypes, projects, assignees);
      
      const [rows] = await connection.execute(`
        SELECT 
          s.pname as status,
          COUNT(*) as count
        FROM jiraissue j
        LEFT JOIN issuestatus s ON j.issuestatus = s.ID
        LEFT JOIN project p ON j.PROJECT = p.ID
        WHERE 1=1 ${filters}
        GROUP BY j.issuestatus, s.pname
        ORDER BY count DESC
      `);
      
      connection.release();
      return rows;
    } catch (error) {
      console.error('获取需求状态统计失败:', error);
      throw error;
    }
  }

  // 获取需求优先级分布
  async getIssuePriorityDistribution(startDate = null, endDate = null, dateTimeType = 'created', issueTypes = null, projects = null, assignees = null) {
    try {
      const connection = await pool.getConnection();
      const filters = this.buildFilters(startDate, endDate, dateTimeType, issueTypes, projects, assignees);
      
      const [rows] = await connection.execute(`
        SELECT 
          prio.pname as priority,
          COUNT(*) as count
        FROM jiraissue j
        LEFT JOIN priority prio ON j.PRIORITY = prio.ID
        LEFT JOIN project p ON j.PROJECT = p.ID
        WHERE 1=1 ${filters}
        GROUP BY j.PRIORITY, prio.pname
        ORDER BY 
          CASE prio.pname
            WHEN 'P0' THEN 1
            WHEN 'P1' THEN 2
            WHEN 'P2' THEN 3
            WHEN 'P3' THEN 4
            WHEN 'P4' THEN 5
            WHEN 'Highest' THEN 1
            WHEN 'High' THEN 2
            WHEN 'Medium' THEN 3
            WHEN 'Low' THEN 4
            WHEN 'Lowest' THEN 5
            ELSE 6
          END
      `);
      
      connection.release();
      
      // 后端计算百分比
      const total = rows.reduce((sum, row) => sum + parseInt(row.count), 0);
      const result = rows.map(row => ({
        priority: row.priority || '未设置',
        count: parseInt(row.count),
        percentage: total > 0 ? Math.round((parseInt(row.count) / total) * 100 * 100) / 100 : 0
      }));
      
      return result;
    } catch (error) {
      console.error('获取需求优先级分布失败:', error);
      throw error;
    }
  }

  // 获取需求类型统计
  async getIssueTypeStats(startDate = null, endDate = null, issueTypes = null) {
    try {
      const connection = await pool.getConnection();
      const filters = this.buildFilters(startDate, endDate, 'created', issueTypes, null, null);
      
      const [rows] = await connection.execute(`
        SELECT 
          it.pname as issue_type,
          COUNT(*) as count
        FROM jiraissue j
        LEFT JOIN issuetype it ON j.issuetype = it.ID
        WHERE 1=1 ${filters}
        GROUP BY j.issuetype, it.pname
        ORDER BY count DESC
      `);
      
      connection.release();
      return rows;
    } catch (error) {
      console.error('获取需求类型统计失败:', error);
      throw error;
    }
  }

  // 获取需求创建趋势（按月）
  async getIssueCreationTrend(months = 12, startDate = null, endDate = null, dateTimeType = 'created', issueTypes = null, projects = null, assignees = null) {
    try {
      const connection = await pool.getConnection();
      
      // 使用统一的筛选构建方法
      const filters = this.buildFilters(startDate, endDate, dateTimeType, issueTypes, projects, assignees);
      
      // 如果没有指定日期范围，使用默认的月份范围（仅适用于创建时间）
      let defaultDateFilter = '';
      if (!startDate && !endDate && dateTimeType === 'created') {
        defaultDateFilter = `AND j.CREATED >= DATE_SUB(NOW(), INTERVAL ${months} MONTH)`;
      }
      
      // 根据时间类型选择合适的查询策略
      if (dateTimeType === 'created') {
        // 创建时间：直接使用j.CREATED字段
        const [rows] = await connection.execute(`
          SELECT 
            DATE_FORMAT(j.CREATED, '%Y-%m') as month,
            COUNT(*) as count
          FROM jiraissue j
          LEFT JOIN project p ON j.PROJECT = p.ID
          WHERE 1=1 ${filters} ${defaultDateFilter}
          GROUP BY DATE_FORMAT(j.CREATED, '%Y-%m')
          ORDER BY month
        `);
        
        connection.release();
        return rows;
      } else {
        // 自定义时间字段：需要通过changegroup表查询
        const fieldNameMap = {
          'completed_design': '完成时间(设计)',
          'closed': '关闭时间',
          'actual_release': '实际发布日'
        };
        
        const fieldName = fieldNameMap[dateTimeType];
        
        if (!fieldName) {
          connection.release();
          return [];
        }
        
        // 构建自定义时间字段的趋势查询
        const [rows] = await connection.execute(`
          SELECT 
            DATE_FORMAT(cg.CREATED, '%Y-%m') as month,
            COUNT(DISTINCT cg.issueid) as count
          FROM changegroup cg
          INNER JOIN changeitem ci ON cg.ID = ci.groupid
          INNER JOIN jiraissue j ON cg.issueid = j.ID
          LEFT JOIN project p ON j.PROJECT = p.ID
          WHERE ci.FIELD = '${fieldName}' 
            AND ci.FIELDTYPE = 'custom'
            AND ci.NEWSTRING IS NOT NULL 
            AND ci.NEWSTRING != ''
            ${filters.replace(/AND j\.ID IN \([^)]+\)/g, '')} 
            ${startDate && endDate ? `AND cg.CREATED BETWEEN '${startDate}' AND '${endDate} 23:59:59'` : ''}
          GROUP BY DATE_FORMAT(cg.CREATED, '%Y-%m')
          ORDER BY month
        `);
        
        connection.release();
        return rows;
      }
    } catch (error) {
      console.error('获取需求创建趋势失败:', error);
      throw error;
    }
  }

  // 获取需求解决时间分析
  async getIssueResolutionTimeStats(startDate = null, endDate = null, issueTypes = null) {
    try {
      const connection = await pool.getConnection();
      const filters = this.buildFilters(startDate, endDate, 'created', issueTypes, null, null);
      
      const [rows] = await connection.execute(`
        SELECT 
          AVG(DATEDIFF(RESOLUTIONDATE, CREATED)) as avg_resolution_days,
          MIN(DATEDIFF(RESOLUTIONDATE, CREATED)) as min_resolution_days,
          MAX(DATEDIFF(RESOLUTIONDATE, CREATED)) as max_resolution_days,
          COUNT(*) as resolved_count
        FROM jiraissue 
        WHERE RESOLUTIONDATE IS NOT NULL 
          AND CREATED IS NOT NULL
          ${filters}
      `);
      
      connection.release();
      return rows[0];
    } catch (error) {
      console.error('获取需求解决时间统计失败:', error);
      throw error;
    }
  }

  // 获取项目维度统计
  async getProjectStats(startDate = null, endDate = null, dateTimeType = 'created', issueTypes = null, projects = null, assignees = null) {
    try {
      console.log('=== getProjectStats 调试 ===');
      console.log('接收的参数:', { startDate, endDate, dateTimeType, issueTypes, projects, assignees });
      
      const connection = await pool.getConnection();
      const filters = this.buildFilters(startDate, endDate, dateTimeType, issueTypes, projects, assignees);
      
      console.log('生成的筛选条件:', filters);
      
      const sql = `
        SELECT 
          p.ID,
          p.pname as project_name,
          p.pkey as project_key,
          p.LEAD as project_lead,
          p.PROJECTTYPE as project_type,
          COUNT(j.ID) as total_issues,
          COUNT(CASE WHEN j.issuestatus = 6 THEN 1 END) as closed_issues,
          COUNT(CASE WHEN j.issuestatus = 5 THEN 1 END) as resolved_issues,
          COUNT(CASE WHEN j.issuestatus = 3 THEN 1 END) as in_progress_issues,
          COUNT(CASE WHEN j.issuestatus = 1 THEN 1 END) as open_issues,
          COUNT(CASE WHEN s.pname IN ('完成', 'Done', 'Closed') THEN 1 END) as completed_issues,
          COUNT(CASE WHEN s.pname LIKE '%进行%' OR s.pname = 'In Progress' THEN 1 END) as active_issues
        FROM jiraissue j
        LEFT JOIN project p ON j.PROJECT = p.ID
        LEFT JOIN issuestatus s ON j.issuestatus = s.ID
        WHERE 1=1 ${filters}
        GROUP BY p.ID, p.pname, p.pkey, p.LEAD, p.PROJECTTYPE
        HAVING total_issues > 0
        ORDER BY total_issues DESC
      `;
      
      console.log('完整SQL查询:', sql);
      
      const [rows] = await connection.execute(sql);
      
      console.log(`查询结果数量: ${rows.length}`);
      console.log('前3个结果:', rows.slice(0, 3).map(r => ({ key: r.project_key, name: r.project_name, issues: r.total_issues })));
      console.log('=========================');
      
      connection.release();
      return rows;
    } catch (error) {
      console.error('获取项目统计失败:', error);
      throw error;
    }
  }

  // 获取经办人工作量统计
  async getAssigneeWorkloadStats(startDate = null, endDate = null, dateTimeType = 'created', issueTypes = null, projects = null, assignees = null) {
    try {
      const connection = await pool.getConnection();
      const filters = this.buildFilters(startDate, endDate, dateTimeType, issueTypes, projects, assignees);
      
      const [rows] = await connection.execute(`
        SELECT 
          j.ASSIGNEE as assignee,
          COUNT(*) as total_assigned,
          SUM(CASE WHEN s.pname IN ('完成', 'Done', 'Closed') THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN s.pname LIKE '%进行%' OR s.pname = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN s.pname LIKE '%待%' OR s.pname = 'To Do' OR s.pname = 'Open' THEN 1 ELSE 0 END) as todo
        FROM jiraissue j
        LEFT JOIN issuestatus s ON j.issuestatus = s.ID
        LEFT JOIN project p ON j.PROJECT = p.ID
        WHERE j.ASSIGNEE IS NOT NULL ${filters}
        GROUP BY j.ASSIGNEE
        HAVING total_assigned > 0
        ORDER BY total_assigned DESC
        LIMIT 20
      `);
      
      connection.release();
      return rows;
    } catch (error) {
      console.error('获取经办人工作量统计失败:', error);
      throw error;
    }
  }

  // 获取需求历史变更统计
  async getIssueHistoryStats(startDate = null, endDate = null, issueTypes = null) {
    try {
      const connection = await pool.getConnection();
      let dateFilter = '';
      
      if (startDate && endDate) {
        dateFilter = `AND ci.CREATED BETWEEN '${startDate}' AND '${endDate} 23:59:59'`;
      } else if (startDate) {
        dateFilter = `AND ci.CREATED >= '${startDate}'`;
      } else if (endDate) {
        dateFilter = `AND ci.CREATED <= '${endDate} 23:59:59'`;
      } else {
        dateFilter = `AND ci.CREATED >= DATE_SUB(NOW(), INTERVAL 30 DAY)`;
      }
      
      // 检查是否有历史变更表
      const [changeItems] = await connection.execute(`
        SELECT 
          DATE_FORMAT(ci.CREATED, '%Y-%m-%d') as change_date,
          ci.FIELD as field_name,
          COUNT(*) as change_count
        FROM changeitem ci
        LEFT JOIN changegroup cg ON ci.groupid = cg.ID
        WHERE 1=1 ${dateFilter}
        GROUP BY DATE_FORMAT(ci.CREATED, '%Y-%m-%d'), ci.FIELD
        ORDER BY change_date DESC, change_count DESC
        LIMIT 50
      `);
      
      connection.release();
      return changeItems;
    } catch (error) {
      console.error('获取需求历史变更统计失败:', error);
      // 如果没有历史表，返回空数组
      return [];
    }
  }

  // 获取综合仪表板数据
  async getDashboardSummary(startDate = null, endDate = null, dateTimeType = 'created', issueTypes = null, projects = null, assignees = null) {
    try {
      const connection = await pool.getConnection();
      const filters = this.buildFilters(startDate, endDate, dateTimeType, issueTypes, projects, assignees);
      
      // 获取当期数据
      const [summary] = await connection.execute(`
        SELECT 
          COUNT(*) as total_issues,
          SUM(CASE WHEN s.pname IN ('完成', 'Done', 'Closed', 'Resolved') THEN 1 ELSE 0 END) as completed_issues,
          SUM(CASE WHEN s.pname NOT IN ('完成', 'Done', 'Closed', 'Resolved', '录入中', 'Rejected', 'Go Live') THEN 1 ELSE 0 END) as in_progress_issues,
          COUNT(DISTINCT j.PROJECT) as total_projects,
          COUNT(DISTINCT j.ASSIGNEE) as total_assignees
        FROM jiraissue j
        LEFT JOIN issuestatus s ON j.issuestatus = s.ID
        LEFT JOIN project p ON j.PROJECT = p.ID
        WHERE 1=1 ${filters}
      `);
      
      // 获取史诗数量
      const [epicCount] = await connection.execute(`
        SELECT COUNT(*) as epic_count
        FROM jiraissue j
        LEFT JOIN issuetype it ON j.issuetype = it.ID
        LEFT JOIN project p ON j.PROJECT = p.ID
        WHERE it.pname = 'Epic' ${filters}
      `);
      
      // 计算同比和环比数据
      let comparisons = {
        total_issues_yoy: 0, completed_issues_yoy: 0, in_progress_issues_yoy: 0, epic_count_yoy: 0, total_projects_yoy: 0,
        total_issues_mom: 0, completed_issues_mom: 0, in_progress_issues_mom: 0, epic_count_mom: 0, total_projects_mom: 0
      };
      
      if (startDate && endDate) {
        // 获取当期的实际数据用于计算
        const currentData = {
          total_issues: summary[0].total_issues,
          completed_issues: summary[0].completed_issues,
          in_progress_issues: summary[0].in_progress_issues,
          epic_count: epicCount[0].epic_count,
          total_projects: summary[0].total_projects
        };
        
        // 计算同比数据（去年同期）
        const yoyComparisons = await this.calculateYearOverYearComparisons(
          startDate, endDate, dateTimeType, issueTypes, projects, assignees, connection, currentData
        );
        
        // 计算环比数据（上一个周期）
        const momComparisons = await this.calculateMonthOverMonthComparisons(
          startDate, endDate, dateTimeType, issueTypes, projects, assignees, connection, currentData
        );
        
        comparisons = { ...yoyComparisons, ...momComparisons };
      }
      
      connection.release();
      
      const result = {
        ...summary[0],
        epic_count: epicCount[0].epic_count,
        ...comparisons
      };
      
      return result;
    } catch (error) {
      console.error('获取仪表板摘要失败:', error);
      throw error;
    }
  }

  // 计算同比数据（Year-over-Year）
  async calculateYearOverYearComparisons(startDate, endDate, dateTimeType, issueTypes, projects, assignees, connection, currentData) {
    try {
      // 计算去年同期的日期范围
      const start = new Date(startDate);
      const end = new Date(endDate);
      const lastYearStart = new Date(start.getFullYear() - 1, start.getMonth(), start.getDate());
      const lastYearEnd = new Date(end.getFullYear() - 1, end.getMonth(), end.getDate());
      
      const lastYearStartStr = lastYearStart.toISOString().split('T')[0];
      const lastYearEndStr = lastYearEnd.toISOString().split('T')[0];
      
      console.log(`同比计算: 当期(${startDate} ~ ${endDate}), 去年同期(${lastYearStartStr} ~ ${lastYearEndStr}), 时间类型: ${dateTimeType}`);
      
      const lastYearFilters = this.buildFilters(lastYearStartStr, lastYearEndStr, dateTimeType, issueTypes, projects, assignees);
      
      // 获取去年同期数据
      const [lastYearSummary] = await connection.execute(`
        SELECT 
          COUNT(*) as total_issues,
          SUM(CASE WHEN s.pname IN ('完成', 'Done', 'Closed', 'Resolved') THEN 1 ELSE 0 END) as completed_issues,
          SUM(CASE WHEN s.pname NOT IN ('完成', 'Done', 'Closed', 'Resolved', '录入中', 'Rejected', 'Go Live') THEN 1 ELSE 0 END) as in_progress_issues,
          COUNT(DISTINCT j.PROJECT) as total_projects
        FROM jiraissue j
        LEFT JOIN issuestatus s ON j.issuestatus = s.ID
        LEFT JOIN project p ON j.PROJECT = p.ID
        WHERE 1=1 ${lastYearFilters}
      `);
      
      const [lastYearEpicCount] = await connection.execute(`
        SELECT COUNT(*) as epic_count
        FROM jiraissue j
        LEFT JOIN issuetype it ON j.issuetype = it.ID
        LEFT JOIN project p ON j.PROJECT = p.ID
        WHERE it.pname = 'Epic' ${lastYearFilters}
      `);
      
      const lastYear = lastYearSummary[0];
      const lastYearEpic = lastYearEpicCount[0];
      
      // 检查是否有有效的历史数据
      const hasValidData = lastYear.total_issues > 0 || lastYear.completed_issues > 0 || lastYear.in_progress_issues > 0;
      
      console.log('去年同期数据:', lastYear, '有效数据:', hasValidData);
      
      if (!hasValidData) {
        return {
          total_issues_yoy: 0, completed_issues_yoy: 0, in_progress_issues_yoy: 0, 
          epic_count_yoy: 0, total_projects_yoy: 0,
          last_year_total_issues: null,
          last_year_completed_issues: null,
          last_year_in_progress_issues: null,
          last_year_epic_count: null,
          last_year_total_projects: null
        };
      }
      
      // 计算同比增长率
      const calculateYoyGrowth = (current, lastYear) => {
        if (lastYear === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - lastYear) / lastYear) * 100);
      };
      
      return {
        total_issues_yoy: calculateYoyGrowth(currentData.total_issues, lastYear.total_issues),
        completed_issues_yoy: calculateYoyGrowth(currentData.completed_issues, lastYear.completed_issues),
        in_progress_issues_yoy: calculateYoyGrowth(currentData.in_progress_issues, lastYear.in_progress_issues),
        epic_count_yoy: calculateYoyGrowth(currentData.epic_count, lastYearEpic.epic_count),
        total_projects_yoy: calculateYoyGrowth(currentData.total_projects, lastYear.total_projects),
        // 保存去年数据用于前端计算
        last_year_total_issues: lastYear.total_issues,
        last_year_completed_issues: lastYear.completed_issues,
        last_year_in_progress_issues: lastYear.in_progress_issues,
        last_year_epic_count: lastYearEpic.epic_count,
        last_year_total_projects: lastYear.total_projects
      };
    } catch (error) {
      console.error('计算同比数据失败:', error);
      return {
        total_issues_yoy: 0, completed_issues_yoy: 0, in_progress_issues_yoy: 0, 
        epic_count_yoy: 0, total_projects_yoy: 0,
        last_year_total_issues: null,
        last_year_completed_issues: null,
        last_year_in_progress_issues: null,
        last_year_epic_count: null,
        last_year_total_projects: null
      };
    }
  }

  // 计算环比数据（Month-over-Month）
  async calculateMonthOverMonthComparisons(startDate, endDate, dateTimeType, issueTypes, projects, assignees, connection, currentData) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // 计算上一个周期的时间长度
      const periodDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      
      // 计算上一个周期的日期范围
      const lastPeriodEnd = new Date(start.getTime() - 24 * 60 * 60 * 1000); // 前一天
      const lastPeriodStart = new Date(lastPeriodEnd.getTime() - (periodDays - 1) * 24 * 60 * 60 * 1000);
      
      const lastPeriodStartStr = lastPeriodStart.toISOString().split('T')[0];
      const lastPeriodEndStr = lastPeriodEnd.toISOString().split('T')[0];
      
      console.log(`环比计算: 当期(${startDate} ~ ${endDate}), 上期(${lastPeriodStartStr} ~ ${lastPeriodEndStr}), 时间类型: ${dateTimeType}`);
      
      const lastPeriodFilters = this.buildFilters(lastPeriodStartStr, lastPeriodEndStr, dateTimeType, issueTypes, projects, assignees);
      
      // 获取上一周期数据
      const [lastPeriodSummary] = await connection.execute(`
        SELECT 
          COUNT(*) as total_issues,
          SUM(CASE WHEN s.pname IN ('完成', 'Done', 'Closed', 'Resolved') THEN 1 ELSE 0 END) as completed_issues,
          SUM(CASE WHEN s.pname NOT IN ('完成', 'Done', 'Closed', 'Resolved', '录入中', 'Rejected', 'Go Live') THEN 1 ELSE 0 END) as in_progress_issues,
          COUNT(DISTINCT j.PROJECT) as total_projects
        FROM jiraissue j
        LEFT JOIN issuestatus s ON j.issuestatus = s.ID
        LEFT JOIN project p ON j.PROJECT = p.ID
        WHERE 1=1 ${lastPeriodFilters}
      `);
      
      const [lastPeriodEpicCount] = await connection.execute(`
        SELECT COUNT(*) as epic_count
        FROM jiraissue j
        LEFT JOIN issuetype it ON j.issuetype = it.ID
        LEFT JOIN project p ON j.PROJECT = p.ID
        WHERE it.pname = 'Epic' ${lastPeriodFilters}
      `);
      
      const lastPeriod = lastPeriodSummary[0];
      const lastPeriodEpic = lastPeriodEpicCount[0];
      
      // 确保数据是数字类型
      const lastPeriodData = {
        total_issues: parseInt(lastPeriod.total_issues) || 0,
        completed_issues: parseInt(lastPeriod.completed_issues) || 0,
        in_progress_issues: parseInt(lastPeriod.in_progress_issues) || 0,
        total_projects: parseInt(lastPeriod.total_projects) || 0,
        epic_count: parseInt(lastPeriodEpic.epic_count) || 0
      };
      
      // 检查是否有有效的历史数据
      const hasValidData = lastPeriodData.total_issues > 0 || lastPeriodData.completed_issues > 0 || lastPeriodData.in_progress_issues > 0;
      
      console.log('当期数据:', currentData);
      console.log('上期数据:', lastPeriodData, '有效数据:', hasValidData);
      
      if (!hasValidData) {
        return {
          total_issues_mom: 0, completed_issues_mom: 0, in_progress_issues_mom: 0,
          epic_count_mom: 0, total_projects_mom: 0,
          last_period_total_issues: null,
          last_period_completed_issues: null,
          last_period_in_progress_issues: null,
          last_period_epic_count: null,
          last_period_total_projects: null
        };
      }
      
      // 计算环比增长率
      const calculateMomGrowth = (current, lastPeriod) => {
        if (lastPeriod === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - lastPeriod) / lastPeriod) * 100);
      };
      
      const result = {
        total_issues_mom: calculateMomGrowth(currentData.total_issues, lastPeriodData.total_issues),
        completed_issues_mom: calculateMomGrowth(currentData.completed_issues, lastPeriodData.completed_issues),
        in_progress_issues_mom: calculateMomGrowth(currentData.in_progress_issues, lastPeriodData.in_progress_issues),
        epic_count_mom: calculateMomGrowth(currentData.epic_count, lastPeriodData.epic_count),
        total_projects_mom: calculateMomGrowth(currentData.total_projects, lastPeriodData.total_projects),
        // 保存上期数据用于前端计算
        last_period_total_issues: lastPeriodData.total_issues,
        last_period_completed_issues: lastPeriodData.completed_issues,
        last_period_in_progress_issues: lastPeriodData.in_progress_issues,
        last_period_epic_count: lastPeriodData.epic_count,
        last_period_total_projects: lastPeriodData.total_projects
      };
      
      console.log('环比结果:', result);
      return result;
    } catch (error) {
      console.error('计算环比数据失败:', error);
      return {
        total_issues_mom: 0, completed_issues_mom: 0, in_progress_issues_mom: 0,
        epic_count_mom: 0, total_projects_mom: 0,
        last_period_total_issues: null,
        last_period_completed_issues: null,
        last_period_in_progress_issues: null,
        last_period_epic_count: null,
        last_period_total_projects: null
      };
    }
  }

  // 获取所有项目列表（不受筛选影响）
  async getAllProjects() {
    try {
      const connection = await pool.getConnection();
      
      const [rows] = await connection.execute(`
        SELECT 
          ID,
          pname as project_name,
          pkey as project_key,
          LEAD as project_lead,
          DESCRIPTION,
          PROJECTTYPE as project_type,
          ASSIGNEETYPE as assignee_type
        FROM project 
        ORDER BY pname
      `);
      
      connection.release();
      return rows;
    } catch (error) {
      console.error('获取项目列表失败:', error);
      throw error;
    }
  }

  // 获取所有问题类型列表
  async getAllIssueTypes() {
    try {
      const connection = await pool.getConnection();
      
      const [rows] = await connection.execute(`
        SELECT 
          it.ID,
          it.pname as issue_type,
          it.DESCRIPTION,
          COUNT(j.ID) as count
        FROM issuetype it
        LEFT JOIN jiraissue j ON it.ID = j.issuetype
        GROUP BY it.ID, it.pname, it.DESCRIPTION
        ORDER BY count DESC
      `);
      
      connection.release();
      return rows;
    } catch (error) {
      console.error('获取问题类型列表失败:', error);
      throw error;
    }
  }

  // 获取所有设计人员/分配人员列表
  async getAllAssignees() {
    try {
      const connection = await pool.getConnection();
      
      const [rows] = await connection.execute(`
        SELECT 
          j.ASSIGNEE as assignee_username,
          u.display_name as assignee_display_name,
          COUNT(j.ID) as assigned_issues_count
        FROM jiraissue j
        LEFT JOIN cwd_user u ON j.ASSIGNEE = u.user_name
        WHERE j.ASSIGNEE IS NOT NULL AND j.ASSIGNEE != ''
        GROUP BY j.ASSIGNEE, u.display_name
        ORDER BY assigned_issues_count DESC
      `);
      
      connection.release();
      return rows;
    } catch (error) {
      console.error('获取设计人员列表失败:', error);
      throw error;
    }
  }
}

module.exports = new JiraDataService(); 