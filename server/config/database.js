const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: '172.31.23.187',
  port: 3306,
  user: 'read_user1',
  password: 'Read@123456',
  database: 'jira', // 先假设数据库名为jira，后续可调整
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 测试数据库连接
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ 数据库连接成功');
    
    // 查看所有数据库
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('📊 可用数据库:', databases.map(db => db.Database));
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }
}

// 获取数据库表结构
async function getTableStructure(databaseName) {
  try {
    const connection = await pool.getConnection();
    
    // 切换到指定数据库
    await connection.execute(`USE ${databaseName}`);
    
    // 获取所有表
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 数据库 ${databaseName} 中的表:`, tables);
    
    // 获取每个表的结构
    const tableStructures = {};
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
      tableStructures[tableName] = columns;
    }
    
    connection.release();
    return tableStructures;
  } catch (error) {
    console.error('❌ 获取表结构失败:', error.message);
    return null;
  }
}

module.exports = {
  pool,
  testConnection,
  getTableStructure
}; 