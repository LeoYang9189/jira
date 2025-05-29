import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CircularProgress, Box, Typography } from '@mui/material';
import { PriorityDistribution } from '../../services/apiService';

interface EChartsPriorityPieChartProps {
  data: PriorityDistribution[];
  loading?: boolean;
}

const EChartsPriorityPieChart: React.FC<EChartsPriorityPieChartProps> = ({ 
  data, 
  loading = false 
}) => {
  
  // 处理数据
  const processData = () => {
    if (!data || data.length === 0) {
      return [];
    }

    // 定义优先级颜色映射
    const colorMap: Record<string, string> = {
      'P0': '#f87171',      // 中等红色 - 最高优先级
      'P1': '#fb923c',      // 中等橙色 - 高优先级
      'P2': '#fbbf24',      // 中等黄色 - 中等优先级
      'P3': '#4ade80',      // 中等绿色 - 低优先级
      'P4': '#94a3b8',      // 中等灰色 - 最低优先级
      'Highest': '#f87171', // 中等红色
      'High': '#fb923c',    // 中等橙色
      'Medium': '#fbbf24',  // 中等黄色
      'Low': '#4ade80',     // 中等绿色
      'Lowest': '#94a3b8'   // 中等灰色
    };

    return data.map(item => ({
      name: item.priority || '未设置',
      value: item.count,
      percentage: item.percentage,
      itemStyle: {
        color: colorMap[item.priority] || '#f1f5f9' // 默认浅色
      }
    }));
  };

  const chartData = processData();

  // ECharts配置
  const getOption = () => {
    return {
      title: {
        text: '需求优先级分布',
        left: 24,
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
          return `
            <div style="padding: 12px;">
              <div style="margin-bottom: 8px; font-weight: 600; color: #334155;">
                ${params.name}
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <span style="display: inline-block; width: 10px; height: 10px; background: ${params.color}; border-radius: 50%; margin-right: 8px; border: 1px solid #e2e8f0;"></span>
                数量: <span style="font-weight: 600; margin-left: 4px; color: #475569;">${params.value}</span>
              </div>
              <div style="color: #64748b; font-size: 12px;">
                占比: ${params.data.percentage}%
              </div>
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
          return `${name} (${item?.value || 0})`;
        },
        // 优先级类型相对较少，不需要滚动
        itemGap: 8,
        itemWidth: 14,
        itemHeight: 14
      },
      series: [
        {
          name: '优先级分布',
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
              return `${params.name}\n${params.data.percentage}%`;
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
          <CircularProgress size={40} sx={{ color: '#0284c7' }} />
          <Typography variant="body2" sx={{ mt: 2, color: '#64748b' }}>
            加载优先级数据中...
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
            暂无优先级数据
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

export default EChartsPriorityPieChart; 