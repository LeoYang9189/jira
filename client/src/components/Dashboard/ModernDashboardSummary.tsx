import React from 'react';
import {
  Card,
  Typography,
  Box,
  CircularProgress,
  Avatar,
  Stack,
  Chip
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Business as BusinessIcon,
  Movie as EpicIcon
} from '@mui/icons-material';
import { DashboardSummary } from '../../services/apiService';

interface ModernDashboardSummaryProps {
  data: DashboardSummary | null;
  loading?: boolean;
}

const ModernDashboardSummary: React.FC<ModernDashboardSummaryProps> = ({
  data,
  loading = false
}) => {
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 3
        }}
      >
        {[1, 2, 3, 4, 5].map((item) => (
          <Card
            key={item}
            elevation={1}
            sx={{
              p: 3,
              textAlign: 'center',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              minHeight: 120,
              borderRadius: 2
            }}
          >
            <CircularProgress size={24} sx={{ color: '#0284c7' }} />
            <Typography variant="body2" sx={{ mt: 1, color: '#64748b' }}>
              加载中...
            </Typography>
          </Card>
        ))}
      </Box>
    );
  }

  if (!data) {
    return (
      <Card
        elevation={1}
        sx={{
          p: 4,
          textAlign: 'center',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 2
        }}
      >
        <Typography variant="h6" color="#64748b">
          暂无数据
        </Typography>
      </Card>
    );
  }

  // 计算同比和环比增长率
  const calculateGrowthRate = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const rate = Math.round(((current - previous) / previous) * 100);
    return rate >= 0 ? `+${rate}%` : `${rate}%`;
  };

  // 获取同比数据
  const getYoyChangeRate = (itemKey: string) => {
    if (!data) return 'N/A';
    
    const currentValue = parseInt(String(data[itemKey as keyof DashboardSummary] || 0));
    const lastYearKey = `last_year_${itemKey}` as keyof DashboardSummary;
    const lastYearValue = data[lastYearKey];
    
    // 检查去年数据是否存在且有效
    if (lastYearValue === undefined || lastYearValue === null) {
      return 'N/A';
    }
    
    const lastYear = parseInt(String(lastYearValue || 0));
    return calculateGrowthRate(currentValue, lastYear);
  };

  // 获取环比数据
  const getMomChangeRate = (itemKey: string) => {
    if (!data) return 'N/A';
    
    const currentValue = parseInt(String(data[itemKey as keyof DashboardSummary] || 0));
    const lastPeriodKey = `last_period_${itemKey}` as keyof DashboardSummary;
    const lastPeriodValue = data[lastPeriodKey];
    
    // 检查上期数据是否存在且有效
    if (lastPeriodValue === undefined || lastPeriodValue === null) {
      return 'N/A';
    }
    
    const lastPeriod = parseInt(String(lastPeriodValue || 0));
    return calculateGrowthRate(currentValue, lastPeriod);
  };

  const summaryItems = [
    {
      title: '总问题数',
      value: data.total_issues || 0,
      icon: AssignmentIcon,
      color: '#0284c7',
      bgGradient: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
      textColor: '#0f172a',
      yoyChange: getYoyChangeRate('total_issues'),
      momChange: getMomChangeRate('total_issues')
    },
    {
      title: '已完成',
      value: data.completed_issues || 0,
      icon: CheckCircleIcon,
      color: '#059669',
      bgGradient: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
      textColor: '#0f172a',
      yoyChange: getYoyChangeRate('completed_issues'),
      momChange: getMomChangeRate('completed_issues')
    },
    {
      title: '进行中',
      value: data.in_progress_issues || 0,
      icon: ScheduleIcon,
      color: '#d97706',
      bgGradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
      textColor: '#0f172a',
      yoyChange: getYoyChangeRate('in_progress_issues'),
      momChange: getMomChangeRate('in_progress_issues')
    },
    {
      title: '史诗数',
      value: data.epic_count || 0,
      icon: EpicIcon,
      color: '#e11d48',
      bgGradient: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)',
      textColor: '#0f172a',
      yoyChange: getYoyChangeRate('epic_count'),
      momChange: getMomChangeRate('epic_count')
    },
    {
      title: '项目数',
      value: data.total_projects || 0,
      icon: BusinessIcon,
      color: '#7c3aed',
      bgGradient: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
      textColor: '#0f172a',
      yoyChange: getYoyChangeRate('total_projects'),
      momChange: getMomChangeRate('total_projects')
    }
  ];

  const formatNumber = (num: number | string | null | undefined) => {
    if (num === null || num === undefined) {
      return '0';
    }
    const n = typeof num === 'string' ? parseInt(num) : num;
    if (isNaN(n)) {
      return '0';
    }
    return n.toLocaleString();
  };

  return (
    <Box 
      sx={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: 3
      }}
    >
      {summaryItems.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <Card
            key={index}
            elevation={1}
            sx={{
              background: item.bgGradient,
              borderRadius: 2,
              overflow: 'hidden',
              position: 'relative',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              border: '1px solid rgba(226, 232, 240, 0.5)',
              minHeight: 160,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                borderColor: item.color
              }
            }}
          >
            <Box sx={{ p: 3, color: item.textColor, position: 'relative', zIndex: 1 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ height: '100%' }}>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    color: item.color,
                    width: 48,
                    height: 48,
                    border: `2px solid ${item.color}20`
                  }}
                >
                  <IconComponent sx={{ fontSize: 24 }} />
                </Avatar>
                
                <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', minHeight: 120 }}>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748b',
                        fontWeight: 500,
                        mb: 1,
                        fontSize: '0.875rem'
                      }}
                    >
                      {item.title}
                    </Typography>
                    
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        lineHeight: 1,
                        color: item.textColor
                      }}
                    >
                      {formatNumber(item.value)}
                    </Typography>
                  </Box>
                  
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5} sx={{ mt: 2 }}>
                    <Chip
                      label={`同比 ${item.yoyChange}`}
                      size="small"
                      sx={{
                        bgcolor: item.yoyChange === 'N/A' ? 'rgba(148, 163, 184, 0.1)' : 
                                item.yoyChange.startsWith('+') ? 'rgba(5, 150, 105, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: item.yoyChange === 'N/A' ? '#64748b' :
                               item.yoyChange.startsWith('+') ? '#059669' : '#dc2626',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 22,
                        border: item.yoyChange === 'N/A' ? '1px solid #94a3b820' :
                                `1px solid ${item.yoyChange.startsWith('+') ? '#059669' : '#dc2626'}20`
                      }}
                    />
                    <Chip
                      label={`环比 ${item.momChange}`}
                      size="small"
                      sx={{
                        bgcolor: item.momChange === 'N/A' ? 'rgba(148, 163, 184, 0.1)' : 
                                item.momChange.startsWith('+') ? 'rgba(5, 150, 105, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: item.momChange === 'N/A' ? '#64748b' :
                               item.momChange.startsWith('+') ? '#059669' : '#dc2626',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 22,
                        border: item.momChange === 'N/A' ? '1px solid #94a3b820' :
                                `1px solid ${item.momChange.startsWith('+') ? '#059669' : '#dc2626'}20`
                      }}
                    />
                  </Stack>
                </Box>
              </Stack>
            </Box>
            
            {/* 简化的装饰性背景元素 */}
            <Box
              sx={{
                position: 'absolute',
                top: -10,
                right: -10,
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: `${item.color}10`,
                zIndex: 0
              }}
            />
          </Card>
        );
      })}
    </Box>
  );
};

export default ModernDashboardSummary; 