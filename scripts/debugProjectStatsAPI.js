const axios = require('axios');

async function debugProjectStatsAPI() {
  try {
    console.log('🔍 调试项目统计API参数传递...\n');
    
    const CW_PROJECT_IDS = [
      'AUTH', 'B2B', 'BI', 'CARGO', 'BASIC', 'CAR1', 'CWUI', 'DW', 'JIRA', 
      'NEWB2B', 'UBICW', 'VCARGO', 'WC', 'WKC', 'YUSEN', 'BJCJ', 'DLJF', 
      'BILLING', 'SQ', 'PILL', 'CP', 'TOPIDEAL'
    ];
    
    // 1. 先测试参数传递API
    console.log('1. 测试参数传递API...');
    const testUrl = `http://localhost:3001/api/test-params?projects=${CW_PROJECT_IDS.join(',')}`;
    console.log(`请求URL: ${testUrl}`);
    
    const testResponse = await axios.get(testUrl);
    console.log('参数测试响应:', JSON.stringify(testResponse.data, null, 2));
    
    // 2. 测试项目统计API的完整参数传递
    console.log('\n2. 测试项目统计API...');
    const projectStatsUrl = `http://localhost:3001/api/projects/stats?projects=${CW_PROJECT_IDS.join(',')}`;
    console.log(`项目统计URL: ${projectStatsUrl}`);
    
    // 添加调试头
    const config = {
      headers: {
        'Debug-Request': 'true'
      }
    };
    
    const projectStatsResponse = await axios.get(projectStatsUrl, config);
    console.log(`项目统计响应数量: ${projectStatsResponse.data.data.length}`);
    console.log('前3个项目:');
    projectStatsResponse.data.data.slice(0, 3).forEach(project => {
      console.log(`  ${project.project_key}: ${project.project_name} (${project.total_issues}个需求)`);
    });
    
    // 3. 手动构造URL测试
    console.log('\n3. 手动构造简单测试...');
    const simpleUrl = 'http://localhost:3001/api/projects/stats?projects=AUTH,B2B,BI';
    console.log(`简单测试URL: ${simpleUrl}`);
    
    const simpleResponse = await axios.get(simpleUrl);
    console.log(`简单测试响应数量: ${simpleResponse.data.data.length}`);
    console.log('简单测试结果:');
    simpleResponse.data.data.forEach(project => {
      console.log(`  ${project.project_key}: ${project.project_name} (${project.total_issues}个需求)`);
    });
    
    console.log('\n✅ 调试完成！');
    
  } catch (error) {
    console.error('❌ 调试失败:', error.response ? error.response.data : error.message);
  }
}

debugProjectStatsAPI(); 