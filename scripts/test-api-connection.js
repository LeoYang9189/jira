const axios = require('axios');

async function testApiConnection() {
  console.log('🔍 测试JIRA数据分析看板API连接...\n');

  const tests = [
    {
      name: '健康检查',
      url: 'http://localhost:3001/health'
    },
    {
      name: '仪表板摘要',
      url: 'http://localhost:3001/api/dashboard/summary'
    },
    {
      name: '需求状态统计',
      url: 'http://localhost:3001/api/issues/status-stats'
    },
    {
      name: '项目列表',
      url: 'http://localhost:3001/api/projects/list'
    },
    {
      name: '问题类型列表',
      url: 'http://localhost:3001/api/issues/types'
    }
  ];

  for (const test of tests) {
    try {
      console.log(`📡 测试: ${test.name}`);
      const startTime = Date.now();
      const response = await axios.get(test.url, { timeout: 10000 });
      const endTime = Date.now();
      
      console.log(`✅ 成功 (${endTime - startTime}ms)`);
      
      if (response.data.data) {
        if (Array.isArray(response.data.data)) {
          console.log(`📊 返回数据: ${response.data.data.length} 条记录`);
        } else if (typeof response.data.data === 'object') {
          console.log(`📊 返回数据:`, Object.keys(response.data.data));
        }
      }
      console.log('');
      
    } catch (error) {
      console.log(`❌ 失败: ${error.message}`);
      if (error.response) {
        console.log(`   状态码: ${error.response.status}`);
        console.log(`   错误信息: ${error.response.data?.message || '未知错误'}`);
      }
      console.log('');
    }
  }

  // 测试CORS
  console.log('🌐 测试CORS配置...');
  try {
    const response = await axios.get('http://localhost:3001/api/dashboard/summary', {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    console.log('✅ CORS配置正常');
  } catch (error) {
    console.log('❌ CORS配置可能有问题:', error.message);
  }

  console.log('\n🔗 前端访问地址: http://localhost:3000');
  console.log('🔗 后端API地址: http://localhost:3001');
}

testApiConnection().catch(console.error); 