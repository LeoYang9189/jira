const axios = require('axios');

async function testProjectFilter() {
  try {
    console.log('🔍 测试项目筛选功能...\n');
    
    // 1. 测试获取项目列表
    console.log('1. 获取项目列表...');
    const projectsResponse = await axios.get('http://localhost:3001/api/projects/list');
    const projects = projectsResponse.data.data;
    console.log(`   找到 ${projects.length} 个项目`);
    console.log('   前5个项目:');
    projects.slice(0, 5).forEach(project => {
      console.log(`     ${project.project_key}: ${project.project_name}`);
    });
    
    // 2. 测试无筛选的总数
    console.log('\n2. 测试无筛选的总数...');
    const allDataResponse = await axios.get('http://localhost:3001/api/dashboard/summary');
    console.log(`   总问题数: ${allDataResponse.data.data.total_issues}`);
    
    // 3. 测试CARGO项目筛选
    console.log('\n3. 测试CARGO项目筛选...');
    const cargoResponse = await axios.get('http://localhost:3001/api/dashboard/summary?projects=CARGO');
    console.log(`   CARGO项目问题数: ${cargoResponse.data.data.total_issues}`);
    
    // 4. 测试多项目筛选
    console.log('\n4. 测试多项目筛选 (CARGO,ETOWER)...');
    const multiResponse = await axios.get('http://localhost:3001/api/dashboard/summary?projects=CARGO,ETOWER');
    console.log(`   CARGO+ETOWER项目问题数: ${multiResponse.data.data.total_issues}`);
    
    // 5. 测试项目+日期筛选
    console.log('\n5. 测试项目+日期筛选 (CARGO, 2025年)...');
    const dateProjectResponse = await axios.get('http://localhost:3001/api/dashboard/summary?projects=CARGO&startDate=2025-01-01&endDate=2025-12-31');
    console.log(`   CARGO项目2025年问题数: ${dateProjectResponse.data.data.total_issues}`);
    
    console.log('\n✅ 项目筛选功能测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    if (error.response) {
      console.error('   响应状态:', error.response.status);
      console.error('   响应数据:', error.response.data);
    }
  }
}

testProjectFilter(); 