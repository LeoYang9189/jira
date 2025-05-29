const mysql = require('mysql2/promise');
const axios = require('axios');

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

async function compareApiAndDb() {
  try {
    console.log('🔍 对比API和数据库查询结果...\n');
    
    // 1. 直接数据库查询
    const connection = await pool.getConnection();
    
    const [dbResult] = await connection.execute(`
      SELECT 
        COUNT(*) as total_issues,
        SUM(CASE WHEN s.pname IN ('完成', 'Done', 'Closed') THEN 1 ELSE 0 END) as completed_issues,
        SUM(CASE WHEN s.pname LIKE '%进行%' OR s.pname = 'In Progress' THEN 1 ELSE 0 END) as in_progress_issues,
        SUM(CASE WHEN s.pname LIKE '%待%' OR s.pname = 'To Do' OR s.pname = 'Open' THEN 1 ELSE 0 END) as todo_issues,
        COUNT(DISTINCT j.PROJECT) as total_projects,
        COUNT(DISTINCT j.ASSIGNEE) as total_assignees
      FROM jiraissue j
      LEFT JOIN issuestatus s ON j.issuestatus = s.ID
      WHERE 1=1 AND j.CREATED >= '2025-01-01'
    `);
    
    console.log('📊 数据库直接查询结果:');
    console.log('  总问题数:', dbResult[0].total_issues);
    console.log('  已完成:', dbResult[0].completed_issues);
    console.log('  进行中:', dbResult[0].in_progress_issues);
    console.log('  待处理:', dbResult[0].todo_issues);
    console.log('  项目数:', dbResult[0].total_projects);
    console.log('  经办人数:', dbResult[0].total_assignees);
    
    connection.release();
    
    // 2. API查询
    try {
      const apiResponse = await axios.get('http://localhost:3001/api/dashboard/summary?startDate=2025-01-01');
      const apiData = apiResponse.data.data;
      
      console.log('\n🌐 API查询结果:');
      console.log('  总问题数:', apiData.total_issues);
      console.log('  已完成:', apiData.completed_issues);
      console.log('  进行中:', apiData.in_progress_issues);
      console.log('  待处理:', apiData.todo_issues);
      console.log('  项目数:', apiData.total_projects);
      console.log('  经办人数:', apiData.total_assignees);
      
      // 3. 对比结果
      console.log('\n🔍 对比结果:');
      const dbTotal = parseInt(dbResult[0].total_issues);
      const apiTotal = parseInt(apiData.total_issues);
      
      if (dbTotal === apiTotal) {
        console.log('✅ 数据一致！');
      } else {
        console.log('❌ 数据不一致！');
        console.log(`   数据库: ${dbTotal}`);
        console.log(`   API: ${apiTotal}`);
        console.log(`   差异: ${dbTotal - apiTotal}`);
      }
      
    } catch (apiError) {
      console.error('\n❌ API调用失败:', apiError.message);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await pool.end();
  }
}

compareApiAndDb(); 