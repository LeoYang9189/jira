import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, Typography, CircularProgress, Box } from '@mui/material';
import { DesignerWorkHours, DesignerIssueDetail } from '../../services/apiService';
import apiService from '../../services/apiService';
import DesignerIssueDetailsDialog from './DesignerIssueDetailsDialog';

interface EChartsDesignerWorkHoursChartProps {
  data: DesignerWorkHours[];
  loading?: boolean;
  filters?: any; // 筛选条件
}

const EChartsDesignerWorkHoursChart: React.FC<EChartsDesignerWorkHoursChartProps> = ({ 
  data, 
  loading = false,
  filters = {}
}) => {
  
  // 弹窗状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDesigner, setSelectedDesigner] = useState<string>('');
  const [selectedWorkHours, setSelectedWorkHours] = useState<number>(0);
  const [issueDetails, setIssueDetails] = useState<DesignerIssueDetail[]>([]);
  const [issueLoading, setIssueLoading] = useState(false);

  // 处理柱形点击事件
  const handleBarClick = async (params: any) => {
    try {
      const designerName = params.name;
      const workHours = params.value;
      
      setSelectedDesigner(designerName);
      setSelectedWorkHours(workHours);
      setDialogOpen(true);
      setIssueLoading(true);
      
      // 调用API获取详细issue信息
      const details = await apiService.getDesignerIssueDetails(designerName, filters);
      setIssueDetails(details);
    } catch (error) {
      console.error('获取设计人员详细信息失败:', error);
      setIssueDetails([]);
    } finally {
      setIssueLoading(false);
    }
  };

  // 处理弹窗关闭
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedDesigner('');
    setSelectedWorkHours(0);
    setIssueDetails([]);
  };

  // 处理数据
  const processData = () => {
    if (!data || data.length === 0) {
      return {
        names: ['暂无数据'],
        values: [0]
      };
    }

    // 数据已经按工时降序排列，但在横向柱形图中需要倒序显示，使最大值在最上面
    const names = data.map(item => item.designer_name).reverse();
    const values = data.map(item => item.total_work_hours).reverse();

    return { names, values };
  };

  const { names, values } = processData();

  // ECharts配置
  const option = {
    title: {
      text: '开发实际工时统计',
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
            <div style="color: #059669;">
              <span style="display: inline-block; width: 10px; height: 10px; background-color: ${item.color}; border-radius: 50%; margin-right: 8px;"></span>
              实际开发工时: ${item.value}小时
            </div>
            <div style="margin-top: 8px; font-size: 12px; color: #64748b;">
              💡 点击柱形查看详细Issue列表
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
      name: '实际开发工时(小时)',
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
        name: '实际开发工时',
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
                color: '#059669' // 绿色起始
              },
              {
                offset: 1,
                color: '#047857' // 绿色结束
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
                  color: '#10b981'
                },
                {
                  offset: 1,
                  color: '#065f46'
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
          formatter: (params: any) => {
            return params.value.toFixed(1) + 'h';
          }
        }
      }
    ],
    backgroundColor: 'transparent'
  };

  // ECharts事件配置
  const onEvents = {
    click: handleBarClick
  };

  if (loading) {
    return (
      <Card sx={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} sx={{ color: '#059669' }} />
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ height: '500px' }}>
        <CardContent sx={{ height: '100%', p: 0 }}>
          {data && data.length > 0 ? (
            <ReactECharts
              option={option}
              style={{ height: '100%', width: '100%', cursor: 'pointer' }}
              notMerge={true}
              lazyUpdate={true}
              onEvents={onEvents}
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
                暂无工时数据
              </Typography>
              <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                请检查筛选条件或数据源
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 详细信息弹窗 */}
      <DesignerIssueDetailsDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        designerName={selectedDesigner}
        totalWorkHours={selectedWorkHours}
        issueDetails={issueDetails}
        loading={issueLoading}
      />
    </>
  );
};

export default EChartsDesignerWorkHoursChart; 