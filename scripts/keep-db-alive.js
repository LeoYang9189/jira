const { pool } = require('../server/config/database');

class DatabaseKeepAlive {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;
  }

  // 执行简单查询保持连接活跃
  async pingDatabase() {
    try {
      const connection = await pool.getConnection();
      await connection.execute('SELECT 1 as ping');
      connection.release();
      console.log(`✅ [${new Date().toISOString()}] 数据库连接正常`);
      return true;
    } catch (error) {
      console.error(`❌ [${new Date().toISOString()}] 数据库连接失败:`, error.message);
      return false;
    }
  }

  // 启动保活任务
  start(intervalMinutes = 5) {
    if (this.isRunning) {
      console.log('⚠️  保活任务已在运行中');
      return;
    }

    console.log(`🚀 启动数据库保活任务，间隔: ${intervalMinutes}分钟`);
    
    // 立即执行一次
    this.pingDatabase();
    
    // 设置定时任务
    this.intervalId = setInterval(() => {
      this.pingDatabase();
    }, intervalMinutes * 60 * 1000);
    
    this.isRunning = true;
  }

  // 停止保活任务
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log('🛑 数据库保活任务已停止');
    }
  }

  // 获取连接池状态
  async getPoolStatus() {
    try {
      const status = {
        totalConnections: pool.pool._allConnections.length,
        freeConnections: pool.pool._freeConnections.length,
        acquiringConnections: pool.pool._acquiringConnections.length,
        connectionLimit: pool.pool.config.connectionLimit
      };
      
      console.log('📊 连接池状态:', status);
      return status;
    } catch (error) {
      console.error('❌ 获取连接池状态失败:', error.message);
      return null;
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const keepAlive = new DatabaseKeepAlive();
  
  // 启动保活任务（每5分钟ping一次）
  keepAlive.start(5);
  
  // 每30分钟显示连接池状态
  setInterval(() => {
    keepAlive.getPoolStatus();
  }, 30 * 60 * 1000);
  
  // 优雅关闭处理
  process.on('SIGTERM', () => {
    console.log('📴 收到SIGTERM信号，正在停止保活任务...');
    keepAlive.stop();
    process.exit(0);
  });
  
  process.on('SIGINT', () => {
    console.log('📴 收到SIGINT信号，正在停止保活任务...');
    keepAlive.stop();
    process.exit(0);
  });
  
  console.log('🔄 数据库保活服务已启动，按 Ctrl+C 停止');
}

module.exports = DatabaseKeepAlive; 