const { pool } = require('../server/config/database');

async function testPriorityData() {
  const connection = await pool.getConnection();
  
  console.log('=== 测试优先级数据 ===');
  
  // 查看所有优先级
  const [priorities] = await connection.execute(`
    SELECT DISTINCT p.ID, p.pname, COUNT(j.ID) as count
    FROM priority p
    LEFT JOIN jiraissue j ON p.ID = j.PRIORITY
    GROUP BY p.ID, p.pname
    ORDER BY count DESC
  `);
  
  console.log('所有优先级:');
  console.table(priorities);
  
  // 查看2024年的优先级分布
  const [priorities2024] = await connection.execute(`
    SELECT 
      p.pname as priority,
      COUNT(*) as count,
      ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
    FROM jiraissue j
    LEFT JOIN priority p ON j.PRIORITY = p.ID
    WHERE j.CREATED >= '2024-01-01' AND j.CREATED <= '2024-12-31 23:59:59'
    GROUP BY j.PRIORITY, p.pname
    ORDER BY count DESC
  `);
  
  console.log('\n2024年优先级分布:');
  console.table(priorities2024);
  
  connection.release();
  process.exit();
}

testPriorityData().catch(console.error); 