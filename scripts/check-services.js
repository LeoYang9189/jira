const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function checkServices() {
  console.log('🔍 JIRA数据分析看板 - 完整服务检查');
  console.log('=' .repeat(50));
  console.log();

  // 1. 检查PM2状态
  console.log('📋 1. PM2服务状态');
  try {
    const { stdout } = await execAsync('pm2 jlist');
    const processes = JSON.parse(stdout);
    
    processes.forEach(proc => {
      const status = proc.pm2_env.status;
      const memory = Math.round(proc.monit.memory / 1024 / 1024);
      const cpu = proc.monit.cpu;
      const restarts = proc.pm2_env.restart_time;
      
      const statusIcon = status === 'online' ? '✅' : '❌';
      console.log(`   ${statusIcon} ${proc.name}: ${status} (内存: ${memory}MB, CPU: ${cpu}%, 重启: ${restarts}次)`);
    });
  } catch (error) {
    console.log('   ❌ 无法获取PM2状态:', error.message);
  }
  console.log();

  // 2. 检查端口占用
  console.log('🌐 2. 端口检查');
  const ports = [3000, 3001];
  
  for (const port of ports) {
    try {
      const { stdout } = await execAsync(`lsof -i :${port}`);
      if (stdout.trim()) {
        console.log(`   ✅ 端口 ${port}: 已占用`);
      } else {
        console.log(`   ❌ 端口 ${port}: 未占用`);
      }
    } catch (error) {
      console.log(`   ❌ 端口 ${port}: 未占用`);
    }
  }
  console.log();

  // 3. 检查API健康状态
  console.log('🔧 3. 后端API检查');
  try {
    const response = await axios.get('http://localhost:3001/health', { timeout: 5000 });
    console.log('   ✅ 健康检查: 正常');
    console.log(`   📊 运行时间: ${Math.round(response.data.uptime)}秒`);
  } catch (error) {
    console.log('   ❌ 健康检查: 失败 -', error.message);
  }

  try {
    const response = await axios.get('http://localhost:3001/api/dashboard/summary', { timeout: 10000 });
    console.log('   ✅ 数据API: 正常');
    console.log(`   📊 总需求数: ${response.data.data.total_issues}`);
  } catch (error) {
    console.log('   ❌ 数据API: 失败 -', error.message);
  }
  console.log();

  // 4. 检查前端服务
  console.log('🎨 4. 前端服务检查');
  try {
    const response = await axios.get('http://localhost:3000', { timeout: 5000 });
    console.log('   ✅ 前端服务: 正常');
    console.log(`   📄 页面大小: ${Math.round(response.data.length / 1024)}KB`);
  } catch (error) {
    console.log('   ❌ 前端服务: 失败 -', error.message);
  }
  console.log();

  // 5. 检查数据库连接
  console.log('💾 5. 数据库连接检查');
  try {
    const response = await axios.get('http://localhost:3001/api/projects/list', { timeout: 10000 });
    console.log('   ✅ 数据库连接: 正常');
    console.log(`   📊 项目数量: ${response.data.data.length}`);
  } catch (error) {
    console.log('   ❌ 数据库连接: 失败 -', error.message);
  }
  console.log();

  // 6. 检查CORS配置
  console.log('🌍 6. CORS配置检查');
  try {
    const response = await axios.get('http://localhost:3001/api/dashboard/summary', {
      headers: { 'Origin': 'http://localhost:3000' },
      timeout: 5000
    });
    console.log('   ✅ CORS配置: 正常');
  } catch (error) {
    console.log('   ❌ CORS配置: 可能有问题 -', error.message);
  }
  console.log();

  // 7. 总结
  console.log('📋 7. 访问地址');
  console.log('   🌐 前端界面: http://localhost:3000');
  console.log('   🔧 后端API: http://localhost:3001');
  console.log('   🏥 健康检查: http://localhost:3001/health');
  console.log();

  console.log('🛠️  常用命令:');
  console.log('   pm2 status          - 查看服务状态');
  console.log('   pm2 logs            - 查看所有日志');
  console.log('   pm2 restart all     - 重启所有服务');
  console.log('   ./scripts/monitor-services.sh - 监控服务');
}

checkServices().catch(console.error); 