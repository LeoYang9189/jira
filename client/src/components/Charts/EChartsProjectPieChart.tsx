import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CircularProgress, Box, Typography } from '@mui/material';
import { ProjectStats } from '../../services/apiService';

interface EChartsProjectPieChartProps {
  data: ProjectStats[];
  loading?: boolean;
}

const EChartsProjectPieChart: React.FC<EChartsProjectPieChartProps> = ({ 
  data, 
  loading = false 
}) => {
  
  // 处理数据
  const processData = () => {
    if (!data || data.length === 0) {
      return [];
    }

    // 定义项目颜色映射 - 使用不同的蓝绿色系
    const colorPalette = [
      '#06b6d4', // cyan-500
      '#0891b2', // cyan-600
      '#0e7490', // cyan-700
      '#155e75', // cyan-800
      '#164e63', // cyan-900
      '#22d3ee', // cyan-400
      '#67e8f9', // cyan-300
      '#a5f3fc', // cyan-200
      '#14b8a6', // teal-500
      '#0d9488', // teal-600
      '#0f766e', // teal-700
      '#134e4a', // teal-800
      '#2dd4bf', // teal-400
      '#5eead4', // teal-300
      '#99f6e4', // teal-200
    ];

    // 计算总数用于百分比计算
    const totalIssues = data.reduce((sum, item) => sum + item.total_issues, 0);

    return data.map((item, index) => ({
      name: item.project_name || item.project_key || '未知项目',
      value: item.total_issues,
      percentage: totalIssues > 0 ? ((item.total_issues / totalIssues) * 100).toFixed(1) : '0',
      projectKey: item.project_key,
      completedIssues: item.completed_issues,
      activeIssues: item.active_issues,
      itemStyle: {
        color: colorPalette[index % colorPalette.length]
      }
    }));
  };

  const chartData = processData();

  // ECharts配置
  const getOption = () => {
    return {
      title: {
        text: '项目需求分布',
        left: 'left',
        textStyle: {
          fontSize: 18,
          fontWeight: 600,
          color: '#1e293b'
        }
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: {
          color: '#334155'
        },
        formatter: (params: any) => {
          const data = params.data;
          return `
            <div style="padding: 12px;">
              <div style="margin-bottom: 8px; font-weight: 600; color: #334155;">
                ${data.name}
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="display: inline-block; width: 10px; height: 10px; background: ${params.color}; border-radius: 50%; margin-right: 8px; border: 1px solid #e2e8f0;"></span>
                总需求: <span style="font-weight: 600; margin-left: 4px; color: #475569;">${data.value}</span>
              </div>
              <div style="color: #64748b; font-size: 12px; margin-bottom: 4px;">
                占比: ${data.percentage}%
              </div>
              <div style="color: #64748b; font-size: 12px; margin-bottom: 2px;">
                已完成: ${data.completedIssues}
              </div>
              <div style="color: #64748b; font-size: 12px;">
                进行中: ${data.activeIssues}
              </div>
              ${data.projectKey ? `<div style="color: #94a3b8; font-size: 11px; margin-top: 4px;">${data.projectKey}</div>` : ''}
            </div>
          `;
        }
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: '60px', // 向下移动，避免与标题重叠
        textStyle: {
          color: '#64748b',
          fontSize: 13
        },
        formatter: (name: string) => {
          const item = chartData.find(d => d.name === name);
          // 缩短显示文本，避免过长
          const shortName = name.length > 12 ? name.substring(0, 12) + '...' : name;
          return `${shortName} (${item?.value || 0})`;
        },
        type: 'scroll',
        pageIconColor: '#64748b',
        pageIconInactiveColor: '#cbd5e1',
        pageTextStyle: {
          color: '#64748b',
          fontSize: 12
        },
        // 减少每页显示的数量
        pageButtonItemGap: 5,
        pageButtonGap: 10,
        pageButtonPosition: 'end',
        // 设置图例区域高度，限制显示数量
        height: '280px',
        // 每页最多显示8个项目
        pageItemGap: 3,
        itemGap: 8,
        itemWidth: 14,
        itemHeight: 14
      },
      series: [
        {
          name: '项目分布',
          type: 'pie',
          radius: ['45%', '75%'], // 环形饼图
          center: ['60%', '50%'],  // 向右偏移给图例留空间
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#ffffff',
            borderWidth: 2
          },
          label: {
            show: true,
            position: 'outside',
            color: '#475569',
            fontSize: 12,
            fontWeight: 500,
            formatter: (params: any) => {
              // 只显示百分比大于5%的标签
              if (parseFloat(params.data.percentage) < 5) {
                return '';
              }
              return `${params.data.percentage}%`;
            }
          },
          labelLine: {
            show: true,
            length: 15,
            length2: 10,
            lineStyle: {
              color: '#cbd5e1'
            }
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 8,
              shadowOffsetX: 0,
              shadowColor: 'rgba(100, 116, 139, 0.15)'
            },
            label: {
              fontSize: 13,
              fontWeight: 600,
              color: '#334155'
            }
          },
          data: chartData
        }
      ],
      animation: true,
      animationDuration: 800,
      animationEasing: 'cubicOut'
    };
  };

  if (loading) {
    return (
      <Card 
        elevation={1}
        sx={{ 
          p: 3, 
          height: 400, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 2
        }}
      >
        <Box textAlign="center">
          <CircularProgress size={40} sx={{ color: '#06b6d4' }} />
          <Typography variant="body2" sx={{ mt: 2, color: '#64748b' }}>
            加载项目数据中...
          </Typography>
        </Box>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card 
        elevation={1}
        sx={{ 
          p: 3, 
          height: 400, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 2
        }}
      >
        <Box textAlign="center">
          <Typography variant="h6" sx={{ color: '#64748b' }}>
            暂无项目数据
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: '#94a3b8' }}>
            请调整筛选条件后重试
          </Typography>
        </Box>
      </Card>
    );
  }

  return (
    <Card 
      elevation={1}
      sx={{ 
        p: 2,
        background: '#ffffff',
        borderRadius: 2,
        border: '1px solid #e2e8f0'
      }}
    >
      <Box
        sx={{
          background: '#ffffff',
          borderRadius: 1,
          overflow: 'hidden'
        }}
      >
        <ReactECharts
          option={getOption()}
          style={{ height: '400px', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </Box>
    </Card>
  );
};

export default EChartsProjectPieChart; 