const axios = require('axios');

async function testProjectStatsFilter() {
  try {
    console.log('🔍 测试项目统计筛选功能...\n');
    
    // 1. 测试无筛选的项目统计
    console.log('1. 测试无筛选的项目统计...');
    const allProjectsResponse = await axios.get('http://localhost:3001/api/projects/stats');
    const allProjects = allProjectsResponse.data.data;
    console.log(`   总项目数: ${allProjects.length}`);
    console.log('   前5个项目:');
    allProjects.slice(0, 5).forEach(project => {
      console.log(`     ${project.project_key}: ${project.project_name} (${project.total_issues}个需求)`);
    });
    
    // 2. 测试CW项目筛选
    const CW_PROJECT_IDS = [
      'AUTH', 'B2B', 'BI', 'CARGO', 'BASIC', 'CAR1', 'CWUI', 'DW', 'JIRA', 
      'NEWB2B', 'UBICW', 'VCARGO', 'WC', 'WKC', 'YUSEN', 'BJCJ', 'DLJF', 
      'BILLING', 'SQ', 'PILL', 'CP', 'TOPIDEAL'
    ];
    
    console.log('\n2. 测试CW项目筛选...');
    const cwProjectsResponse = await axios.get(`http://localhost:3001/api/projects/stats?projects=${CW_PROJECT_IDS.join(',')}`);
    const cwProjects = cwProjectsResponse.data.data;
    console.log(`   CW项目数: ${cwProjects.length}`);
    console.log('   CW项目列表:');
    cwProjects.forEach(project => {
      console.log(`     ${project.project_key}: ${project.project_name} (${project.total_issues}个需求)`);
    });
    
    // 3. 测试日期+项目筛选
    console.log('\n3. 测试日期+项目筛选 (2025年CW项目)...');
    const dateProjectResponse = await axios.get(`http://localhost:3001/api/projects/stats?projects=${CW_PROJECT_IDS.join(',')}&startDate=2025-01-01&endDate=2025-05-31`);
    const dateProjects = dateProjectResponse.data.data;
    console.log(`   2025年CW项目数: ${dateProjects.length}`);
    console.log('   2025年CW项目列表:');
    dateProjects.forEach(project => {
      console.log(`     ${project.project_key}: ${project.project_name} (${project.total_issues}个需求)`);
    });
    
    // 4. 验证筛选逻辑
    console.log('\n4. 验证筛选逻辑...');
    const nonCwProjects = allProjects.filter(project => !CW_PROJECT_IDS.includes(project.project_key));
    console.log(`   非CW项目数: ${nonCwProjects.length}`);
    console.log('   前5个非CW项目:');
    nonCwProjects.slice(0, 5).forEach(project => {
      console.log(`     ${project.project_key}: ${project.project_name} (${project.total_issues}个需求)`);
    });
    
    console.log('\n✅ 项目统计筛选功能测试完成！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.response ? error.response.data : error.message);
  }
}

testProjectStatsFilter(); 