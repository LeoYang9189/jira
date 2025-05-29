const mysql = require('mysql2/promise');

async function checkDesignerFields() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Yangtian0701!',
    database: 'jiradb'
  });

  try {
    console.log('=== 检查changegroup和changeitem表结构 ===');
    
    // 查看changegroup表结构
    console.log('\nchangegroup表结构:');
    const [cg] = await connection.execute('DESCRIBE changegroup');
    console.log(cg);
    
    // 查看changeitem表结构
    console.log('\nchangeitem表结构:');
    const [ci] = await connection.execute('DESCRIBE changeitem');
    console.log(ci);
    
    console.log('\n=== 查看设计人员相关数据 ===');
    
    // 查看所有包含"设计"的字段
    const [designFields] = await connection.execute(`
      SELECT DISTINCT ci.FIELD, ci.FIELDTYPE, COUNT(*) as count
      FROM changeitem ci 
      WHERE ci.FIELD LIKE '%设计%' 
      GROUP BY ci.FIELD, ci.FIELDTYPE
      ORDER BY count DESC
    `);
    console.log('\n包含"设计"的字段:');
    console.log(designFields);
    
    // 查看具体的设计人员字段数据
    const [designerData] = await connection.execute(`
      SELECT ci.FIELD, ci.FIELDTYPE, ci.NEWSTRING, COUNT(*) as count
      FROM changeitem ci 
      WHERE ci.FIELD = '设计人员' AND ci.FIELDTYPE = 'custom'
      GROUP BY ci.NEWSTRING
      ORDER BY count DESC
      LIMIT 20
    `);
    console.log('\n设计人员字段具体数据:');
    console.log(designerData);
    
    // 查看总记录数
    const [totalCount] = await connection.execute(`
      SELECT COUNT(*) as total_records
      FROM changeitem ci 
      WHERE ci.FIELD = '设计人员' AND ci.FIELDTYPE = 'custom'
    `);
    console.log('\n设计人员字段总记录数:');
    console.log(totalCount);
    
  } catch (error) {
    console.error('查询出错:', error);
  } finally {
    await connection.end();
  }
}

checkDesignerFields(); 