const mysql = require('mysql2/promise');

async function getIssueTypes() {
  const connection = await mysql.createConnection({
    host: '172.31.23.187',
    user: 'read_user1',
    password: 'Read@123456',
    database: 'jira',
    port: 3306
  });

  try {
    console.log('🔍 获取所有问题类型信息...\n');
    
    // 获取问题类型统计
    const [issueTypes] = await connection.execute(`
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

    console.log(`📊 总共找到 ${issueTypes.length} 种问题类型:\n`);
    
    issueTypes.forEach((type, index) => {
      console.log(`${index + 1}. 类型ID: ${type.ID}`);
      console.log(`   类型名称: ${type.issue_type}`);
      console.log(`   描述: ${type.DESCRIPTION || '无描述'}`);
      console.log(`   需求数量: ${type.count}`);
      console.log('   ─────────────────────────────────');
    });

  } catch (error) {
    console.error('❌ 查询失败:', error.message);
  } finally {
    await connection.end();
  }
}

getIssueTypes(); 