import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CircularProgress, Box, Typography } from '@mui/material';
import { CreationTrend } from '../../services/apiService';

// 定义时间类型
type DateTimeType = 'created' | 'completed_design' | 'closed' | 'actual_release';

interface EChartsTrendChartProps {
  data: CreationTrend[];
  loading?: boolean;
  dateTimeType?: DateTimeType;
  startDate?: string;
  endDate?: string;
}

const EChartsTrendChart: React.FC<EChartsTrendChartProps> = ({ 
  data, 
  loading = false, 
  dateTimeType = 'created',
  startDate,
  endDate
}) => {
  
  // 根据时间类型获取标题和描述
  const getTitleAndDescription = () => {
    switch (dateTimeType) {
      case 'created':
        return {
          title: '需求创建趋势',
          description: '创建数量',
          yAxisLabel: '创建数量'
        };
      case 'completed_design':
        return {
          title: '需求设计完成趋势',
          description: '设计完成数量',
          yAxisLabel: '设计完成数量'
        };
      case 'closed':
        return {
          title: '需求关闭趋势',
          description: '关闭数量',
          yAxisLabel: '关闭数量'
        };
      case 'actual_release':
        return {
          title: '需求发布趋势',
          description: '发布数量',
          yAxisLabel: '发布数量'
        };
      default:
        return {
          title: '需求创建趋势',
          description: '创建数量',
          yAxisLabel: '创建数量'
        };
    }
  };

  const { title, description, yAxisLabel } = getTitleAndDescription();
  
  // 处理数据并根据时间范围筛选
  const processData = () => {
    if (!data || data.length === 0) {
      return { months: [], counts: [] };
    }

    let filteredData = data;
    
    // 如果设置了时间范围，过滤数据
    if (startDate || endDate) {
      filteredData = data.filter(item => {
        // 比较年月格式 (YYYY-MM)
        const itemMonth = item.month;
        let includeItem = true;
        
        if (startDate) {
          const startMonth = startDate.substring(0, 7); // 获取YYYY-MM格式
          includeItem = includeItem && itemMonth >= startMonth;
        }
        
        if (endDate) {
          const endMonth = endDate.substring(0, 7); // 获取YYYY-MM格式
          includeItem = includeItem && itemMonth <= endMonth;
        }
        
        return includeItem;
      });
    }

    const months = filteredData.map(item => item.month);
    const counts = filteredData.map(item => item.count);
    
    return { months, counts };
  };

  const { months, counts } = processData();

  // 生成标题副标题，包含时间范围信息
  const getTitleWithDateRange = () => {
    let titleWithRange = title;
    if (startDate && endDate) {
      const startMonth = startDate.substring(0, 7);
      const endMonth = endDate.substring(0, 7);
      if (startMonth === endMonth) {
        titleWithRange += ` (${startMonth})`;
      } else {
        titleWithRange += ` (${startMonth} ~ ${endMonth})`;
      }
    } else if (startDate) {
      titleWithRange += ` (${startDate.substring(0, 7)} 至今)`;
    } else if (endDate) {
      titleWithRange += ` (截至 ${endDate.substring(0, 7)})`;
    }
    return titleWithRange;
  };

  // ECharts配置
  const getOption = () => {
    return {
      title: {
        text: getTitleWithDateRange(),
        left: 'left',
        textStyle: {
          fontSize: 18,
          fontWeight: 600,
          color: '#1e293b'
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: {
          color: '#334155'
        },
        formatter: (params: any) => {
          const param = params[0];
          return `
            <div style="padding: 12px;">
              <div style="margin-bottom: 8px; font-weight: 600; color: #1e293b;">
                ${param.axisValue}
              </div>
              <div style="display: flex; align-items: center;">
                <span style="display: inline-block; width: 10px; height: 10px; background: #0284c7; border-radius: 50%; margin-right: 8px;"></span>
                ${description}: <span style="font-weight: 600; margin-left: 4px; color: #0284c7;">${param.value}</span>
              </div>
            </div>
          `;
        }
      },
      legend: {
        data: [description],
        top: 40,
        textStyle: {
          color: '#64748b',
          fontSize: 14
        }
      },
      grid: {
        left: '60px',
        right: '60px',
        top: '80px',
        bottom: '60px',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: months,
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: '#e2e8f0'
          }
        },
        axisLabel: {
          color: '#64748b',
          fontSize: 12,
          rotate: months.length > 12 ? 45 : 0 // 如果月份太多，旋转标签
        },
        axisTick: {
          alignWithLabel: true,
          lineStyle: {
            color: '#e2e8f0'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: '数量',
        nameTextStyle: {
          color: '#64748b',
          fontSize: 12
        },
        axisLine: {
          lineStyle: {
            color: '#e2e8f0'
          }
        },
        axisLabel: {
          color: '#64748b',
          fontSize: 12
        },
        splitLine: {
          lineStyle: {
            color: '#f1f5f9',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: description,
          type: 'line',
          data: counts,
          smooth: true,
          lineStyle: {
            width: 3,
            color: '#0284c7'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(2, 132, 199, 0.2)' },
                { offset: 1, color: 'rgba(2, 132, 199, 0.05)' }
              ]
            }
          },
          itemStyle: {
            color: '#0284c7',
            borderColor: '#ffffff',
            borderWidth: 2
          },
          label: {
            show: true,
            position: 'top',
            color: '#1e293b',
            fontSize: 12,
            fontWeight: 600,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            borderRadius: 4,
            padding: [4, 8],
            shadowBlur: 2,
            shadowColor: 'rgba(0, 0, 0, 0.1)',
            formatter: '{c}'
          },
          emphasis: {
            itemStyle: {
              color: '#0284c7',
              borderColor: '#0284c7',
              borderWidth: 3,
              shadowBlur: 8,
              shadowColor: 'rgba(2, 132, 199, 0.3)'
            },
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 700,
              color: '#0284c7'
            }
          }
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
            加载趋势数据中...
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
            暂无趋势数据
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

export default EChartsTrendChart; 