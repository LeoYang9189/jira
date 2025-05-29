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

async function testDateFilter() {
  try {
    const connection = await pool.getConnection();
    
    console.log('🔍 测试2025年1月1日之后的数据...');
    
    // 测试1: 直接查询总数
    const [totalResult] = await connection.execute(`
      SELECT COUNT(*) as total 
      FROM jiraissue 
      WHERE CREATED >= '2025-01-01'
    `);
    console.log('📊 直接查询结果:', totalResult[0].total);
    
    // 测试2: 使用我们的筛选逻辑
    const [filterResult] = await connection.execute(`
      SELECT COUNT(*) as total 
      FROM jiraissue j
      WHERE 1=1 AND j.CREATED >= '2025-01-01'
    `);
    console.log('🔧 筛选逻辑结果:', filterResult[0].total);
    
    // 测试3: 查看最新的几条数据
    const [latestData] = await connection.execute(`
      SELECT ID, CREATED, PROJECT, issuetype 
      FROM jiraissue 
      WHERE CREATED >= '2025-01-01'
      ORDER BY CREATED DESC 
      LIMIT 5
    `);
    console.log('📅 最新的5条数据:');
    latestData.forEach(row => {
      console.log(`  ID: ${row.ID}, 创建时间: ${row.CREATED}, 项目: ${row.PROJECT}, 类型: ${row.issuetype}`);
    });
    
    // 测试4: 查看数据分布
    const [dateDistribution] = await connection.execute(`
      SELECT 
        DATE(CREATED) as date,
        COUNT(*) as count
      FROM jiraissue 
      WHERE CREATED >= '2025-01-01'
      GROUP BY DATE(CREATED)
      ORDER BY date DESC
      LIMIT 10
    `);
    console.log('📈 按日期分布:');
    dateDistribution.forEach(row => {
      console.log(`  ${row.date}: ${row.count}条`);
    });
    
    connection.release();
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await pool.end();
  }
}

testDateFilter(); 