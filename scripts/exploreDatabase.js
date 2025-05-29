const { testConnection, getTableStructure } = require('../server/config/database');
const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: '172.31.23.187',
  port: 3306,
  user: 'read_user1',
  password: 'Read@123456',
  // 不指定数据库，先查看所有数据库
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

async function exploreDatabase() {
  console.log('🔍 开始探索数据库结构...\n');
  
  try {
    // 创建连接
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功\n');
    
    // 1. 查看所有数据库
    console.log('📊 可用数据库列表:');
    const [databases] = await connection.query('SHOW DATABASES');
    databases.forEach((db, index) => {
      console.log(`${index + 1}. ${db.Database}`);
    });
    console.log('');
    
    // 2. 专门查看jira数据库
    console.log('🔍 检查JIRA数据库...');
    await connection.query('USE jira');
    
    // 获取所有表
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`📋 JIRA数据库中的表 (${tables.length}个):`);
    
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`\n📊 表: ${tableName}`);
      
      try {
        // 获取表结构
        const [columns] = await connection.query(`DESCRIBE ${tableName}`);
        console.log('  字段结构:');
        columns.forEach(col => {
          console.log(`    - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `[${col.Key}]` : ''}`);
        });
        
        // 获取记录数
        const [count] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`  📈 记录数: ${count[0].count}`);
        
        // 如果有数据，显示前几条记录的示例
        if (count[0].count > 0) {
          const [sample] = await connection.query(`SELECT * FROM ${tableName} LIMIT 2`);
          console.log('  📝 示例数据:');
          sample.forEach((row, index) => {
            console.log(`    记录${index + 1}:`, JSON.stringify(row, null, 6));
          });
        }
        
      } catch (error) {
        console.log(`  ❌ 无法访问表 ${tableName}: ${error.message}`);
      }
    }
    
    await connection.end();
    console.log('\n✅ 数据库探索完成');
    
  } catch (error) {
    console.error('❌ 数据库探索失败:', error.message);
  }
}

// 运行探索
exploreDatabase(); 