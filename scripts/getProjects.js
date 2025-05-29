const mysql = require('mysql2/promise');

async function getProjects() {
  const connection = await mysql.createConnection({
    host: '172.31.23.187',
    user: 'read_user1',
    password: 'Read@123456',
    database: 'jira',
    port: 3306
  });

  try {
    console.log('🔍 获取所有项目信息...\n');
    
    // 获取项目基本信息
    const [projects] = await connection.execute(`
      SELECT 
        ID,
        pname as project_name,
        pkey as project_key,
        LEAD as project_lead,
        DESCRIPTION,
        PROJECTTYPE as project_type,
        ASSIGNEETYPE as assignee_type
      FROM project 
      ORDER BY ID
    `);

    console.log(`📊 总共找到 ${projects.length} 个项目:\n`);
    
    projects.forEach((project, index) => {
      console.log(`${index + 1}. 项目ID: ${project.ID}`);
      console.log(`   项目名称: ${project.project_name}`);
      console.log(`   项目键值: ${project.project_key}`);
      console.log(`   项目负责人: ${project.project_lead || '未分配'}`);
      console.log(`   项目类型: ${project.project_type || '未知'}`);
      console.log(`   描述: ${project.DESCRIPTION || '无描述'}`);
      console.log('   ─────────────────────────────────');
    });

    // 获取每个项目的需求统计
    console.log('\n📈 各项目需求统计:\n');
    
    const [projectStats] = await connection.execute(`
      SELECT 
        p.ID,
        p.pname as project_name,
        p.pkey as project_key,
        COUNT(j.ID) as total_issues,
        COUNT(CASE WHEN j.issuestatus = 6 THEN 1 END) as closed_issues,
        COUNT(CASE WHEN j.issuestatus = 5 THEN 1 END) as resolved_issues,
        COUNT(CASE WHEN j.issuestatus = 3 THEN 1 END) as in_progress_issues,
        COUNT(CASE WHEN j.issuestatus = 1 THEN 1 END) as open_issues
      FROM project p
      LEFT JOIN jiraissue j ON p.ID = j.PROJECT
      GROUP BY p.ID, p.pname, p.pkey
      ORDER BY total_issues DESC
    `);

    projectStats.forEach((stat, index) => {
      console.log(`${index + 1}. ${stat.project_name} (${stat.project_key})`);
      console.log(`   总需求: ${stat.total_issues}`);
      console.log(`   已关闭: ${stat.closed_issues}`);
      console.log(`   已解决: ${stat.resolved_issues}`);
      console.log(`   进行中: ${stat.in_progress_issues}`);
      console.log(`   待处理: ${stat.open_issues}`);
      console.log('   ─────────────────────────────────');
    });

  } catch (error) {
    console.error('❌ 查询失败:', error.message);
  } finally {
    await connection.end();
  }
}

getProjects(); 