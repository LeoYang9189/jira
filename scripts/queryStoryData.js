const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '172.31.23.187',
  user: 'read_user1',
  password: 'Read@123456',
  database: 'jira',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function queryStoryData() {
  try {
    const connection = await pool.getConnection();
    
    console.log('🔍 查询2025年1月1日到5月30日之间CARGO项目的故事类型数据...\n');
    
    // 首先查看故事类型的ID
    const [issueTypes] = await connection.execute(`
      SELECT ID, pname, DESCRIPTION 
      FROM issuetype 
      WHERE pname LIKE '%故事%' OR pname LIKE '%Story%'
    `);
    
    console.log('📋 找到的故事类型:');
    issueTypes.forEach(type => {
      console.log(`  ID: ${type.ID}, 名称: ${type.pname}, 描述: ${type.DESCRIPTION || '无'}`);
    });
    
    if (issueTypes.length === 0) {
      console.log('❌ 未找到故事类型，请检查类型名称');
      connection.release();
      return;
    }
    
    // 使用找到的故事类型ID进行查询
    const storyTypeIds = issueTypes.map(type => type.ID);
    
    const [storyData] = await connection.execute(`
      SELECT 
        j.ID,
        j.pkey as issue_key,
        j.SUMMARY as title,
        j.CREATED as created_date,
        j.UPDATED as updated_date,
        j.ASSIGNEE as assignee,
        j.REPORTER as reporter,
        p.pname as project_name,
        p.pkey as project_key,
        s.pname as status,
        it.pname as issue_type,
        pr.pname as priority
      FROM jiraissue j
      LEFT JOIN project p ON j.PROJECT = p.ID
      LEFT JOIN issuestatus s ON j.issuestatus = s.ID
      LEFT JOIN issuetype it ON j.issuetype = it.ID
      LEFT JOIN priority pr ON j.PRIORITY = pr.ID
      WHERE j.CREATED >= '2025-01-01' 
        AND j.CREATED <= '2025-05-30 23:59:59'
        AND j.issuetype IN (${storyTypeIds.join(',')})
        AND p.pkey = 'CARGO'
      ORDER BY j.CREATED DESC
    `);
    
    console.log(`\n📊 查询结果: 共找到 ${storyData.length} 条故事数据\n`);
    
    if (storyData.length > 0) {
      console.log('📅 前10条数据预览:');
      storyData.slice(0, 10).forEach((story, index) => {
        console.log(`${index + 1}. ${story.issue_key} - ${story.title}`);
        console.log(`   项目: ${story.project_name} (${story.project_key})`);
        console.log(`   状态: ${story.status} | 优先级: ${story.priority}`);
        console.log(`   创建时间: ${story.created_date}`);
        console.log(`   经办人: ${story.assignee || '未分配'} | 报告人: ${story.reporter || '未知'}`);
        console.log('');
      });
      
      // 按月统计
      const [monthlyStats] = await connection.execute(`
        SELECT 
          DATE_FORMAT(j.CREATED, '%Y-%m') as month,
          COUNT(*) as count
        FROM jiraissue j
        LEFT JOIN project p ON j.PROJECT = p.ID
        WHERE j.CREATED >= '2025-01-01' 
          AND j.CREATED <= '2025-05-30 23:59:59'
          AND j.issuetype IN (${storyTypeIds.join(',')})
          AND p.pkey = 'CARGO'
        GROUP BY DATE_FORMAT(j.CREATED, '%Y-%m')
        ORDER BY month
      `);
      
      console.log('📈 按月统计:');
      monthlyStats.forEach(stat => {
        console.log(`  ${stat.month}: ${stat.count} 条故事`);
      });
      
      // 按项目统计（只显示CARGO项目的详细信息）
      const [projectStats] = await connection.execute(`
        SELECT 
          p.pname as project_name,
          p.pkey as project_key,
          COUNT(*) as count,
          COUNT(CASE WHEN s.pname IN ('完成', 'Done', 'Closed') THEN 1 END) as completed,
          COUNT(CASE WHEN s.pname LIKE '%进行%' OR s.pname = 'In Progress' THEN 1 END) as in_progress,
          COUNT(CASE WHEN s.pname LIKE '%待%' OR s.pname = 'To Do' OR s.pname = 'Open' THEN 1 END) as todo
        FROM jiraissue j
        LEFT JOIN project p ON j.PROJECT = p.ID
        LEFT JOIN issuestatus s ON j.issuestatus = s.ID
        WHERE j.CREATED >= '2025-01-01' 
          AND j.CREATED <= '2025-05-30 23:59:59'
          AND j.issuetype IN (${storyTypeIds.join(',')})
          AND p.pkey = 'CARGO'
        GROUP BY p.ID, p.pname, p.pkey
      `);
      
      console.log('\n📊 CARGO项目统计:');
      if (projectStats.length > 0) {
        const stat = projectStats[0];
        console.log(`  项目: ${stat.project_name} (${stat.project_key})`);
        console.log(`  总故事数: ${stat.count}`);
        console.log(`  已完成: ${stat.completed}`);
        console.log(`  进行中: ${stat.in_progress}`);
        console.log(`  待处理: ${stat.todo}`);
      } else {
        console.log('  未找到CARGO项目的故事数据');
      }
    }
    
    connection.release();
    
  } catch (error) {
    console.error('❌ 查询失败:', error);
  } finally {
    await pool.end();
  }
}

// 直接的SQL查询语句
console.log('📝 对应的SQL查询语句:');
console.log(`
-- 查询2025年1月1日到5月30日之间的故事类型数据（CARGO项目）
SELECT 
  j.ID,
  j.pkey as issue_key,
  j.SUMMARY as title,
  j.CREATED as created_date,
  j.UPDATED as updated_date,
  j.ASSIGNEE as assignee,
  j.REPORTER as reporter,
  p.pname as project_name,
  p.pkey as project_key,
  s.pname as status,
  it.pname as issue_type,
  pr.pname as priority
FROM jiraissue j
LEFT JOIN project p ON j.PROJECT = p.ID
LEFT JOIN issuestatus s ON j.issuestatus = s.ID
LEFT JOIN issuetype it ON j.issuetype = it.ID
LEFT JOIN priority pr ON j.PRIORITY = pr.ID
WHERE j.CREATED >= '2025-01-01' 
  AND j.CREATED <= '2025-05-30 23:59:59'
  AND it.pname LIKE '%故事%'  -- 或者使用具体的类型ID: AND j.issuetype = 10001
  AND p.pkey = 'CARGO'  -- 限定CARGO项目
ORDER BY j.CREATED DESC;

-- 如果知道故事类型的具体ID，可以使用：
-- AND j.issuetype = 10001  -- 假设10001是故事类型的ID

-- 统计总数的简化查询（CARGO项目）：
SELECT COUNT(*) as total_stories
FROM jiraissue j
LEFT JOIN issuetype it ON j.issuetype = it.ID
LEFT JOIN project p ON j.PROJECT = p.ID
WHERE j.CREATED >= '2025-01-01' 
  AND j.CREATED <= '2025-05-30 23:59:59'
  AND it.pname LIKE '%故事%'
  AND p.pkey = 'CARGO';
`);

queryStoryData(); 