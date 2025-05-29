import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, Typography, CircularProgress, Box } from '@mui/material';
import { DesignerWorkload } from '../../services/apiService';

interface EChartsDesignerBarChartProps {
  data: DesignerWorkload[];
  loading?: boolean;
}

const EChartsDesignerBarChart: React.FC<EChartsDesignerBarChartProps> = ({ 
  data, 
  loading = false 
}) => {
  
  // 处理数据
  const processData = () => {
    if (!data || data.length === 0) {
      return {
        names: ['暂无数据'],
        values: [0]
      };
    }

    // 数据已经按issue数量降序排列，但在横向柱形图中需要倒序显示，使最大值在最上面
    const names = data.map(item => item.designer_name).reverse();
    const values = data.map(item => item.designed_issues_count).reverse();

    return { names, values };
  };

  const { names, values } = processData();

  // ECharts配置
  const option = {
    title: {
      text: '设计人员工作量统计',
      left: 24,
      top: 20,
      textStyle: {
        fontSize: 18,
        fontWeight: 600,
        color: '#1e293b'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        const item = params[0];
        return `
          <div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${item.name}</div>
            <div style="color: #0284c7;">
              <span style="display: inline-block; width: 10px; height: 10px; background-color: ${item.color}; border-radius: 50%; margin-right: 8px;"></span>
              设计需求数: ${item.value}
            </div>
          </div>
        `;
      }
    },
    grid: {
      left: '20%',
      right: '15%',
      top: '80px',
      bottom: '60px',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '设计需求数',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        color: '#64748b',
        fontSize: 12,
        fontWeight: 500
      },
      axisLine: {
        lineStyle: {
          color: '#e2e8f0'
        }
      },
      axisTick: {
        lineStyle: {
          color: '#e2e8f0'
        }
      },
      axisLabel: {
        color: '#64748b',
        fontSize: 11
      },
      splitLine: {
        lineStyle: {
          color: '#f1f5f9',
          type: 'dashed'
        }
      }
    },
    yAxis: {
      type: 'category',
      data: names,
      name: '设计人员',
      nameLocation: 'middle',
      nameGap: 80,
      nameTextStyle: {
        color: '#64748b',
        fontSize: 12,
        fontWeight: 500
      },
      axisLine: {
        lineStyle: {
          color: '#e2e8f0'
        }
      },
      axisTick: {
        lineStyle: {
          color: '#e2e8f0'
        }
      },
      axisLabel: {
        color: '#475569',
        fontSize: 11,
        fontWeight: 500,
        // 长名字自动截断显示
        formatter: (value: string) => {
          return value.length > 8 ? value.substring(0, 8) + '...' : value;
        }
      }
    },
    series: [
      {
        name: '设计需求数',
        type: 'bar',
        data: values,
        barWidth: '60%',
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              {
                offset: 0,
                color: '#3b82f6' // 蓝色起始
              },
              {
                offset: 1,
                color: '#1d4ed8' // 蓝色结束
              }
            ]
          },
          borderRadius: [0, 4, 4, 0]
        },
        emphasis: {
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                {
                  offset: 0,
                  color: '#2563eb'
                },
                {
                  offset: 1,
                  color: '#1e40af'
                }
              ]
            }
          }
        },
        label: {
          show: true,
          position: 'right',
          color: '#64748b',
          fontSize: 11,
          fontWeight: 500,
          formatter: '{c}'
        }
      }
    ],
    backgroundColor: 'transparent'
  };

  if (loading) {
    return (
      <Card sx={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} sx={{ color: '#0284c7' }} />
      </Card>
    );
  }

  return (
    <Card sx={{ height: '500px' }}>
      <CardContent sx={{ height: '100%', p: 0 }}>
        {data && data.length > 0 ? (
          <ReactECharts
            option={option}
            style={{ height: '100%', width: '100%' }}
            notMerge={true}
            lazyUpdate={true}
          />
        ) : (
          <Box 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#64748b'
            }}
          >
            <Typography variant="h6" sx={{ mb: 1, color: '#94a3b8' }}>
              暂无设计人员数据
            </Typography>
            <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
              请检查筛选条件或数据源
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default EChartsDesignerBarChart; 