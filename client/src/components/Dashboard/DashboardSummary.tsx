import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Schedule,
  Folder,
  People,
  Movie
} from '@mui/icons-material';
import { DashboardSummary as SummaryData } from '../../services/apiService';

interface DashboardSummaryProps {
  data: SummaryData | null;
  loading: boolean;
}

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color, subtitle }) => (
  <Card 
    sx={{ 
      height: '100%',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}30`,
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 25px ${color}20`
      }
    }}
  >
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h3" component="div" sx={{ color, fontWeight: 'bold' }}>
            {value.toLocaleString()}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ color, opacity: 0.8 }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const DashboardSummary: React.FC<DashboardSummaryProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          正在加载仪表板数据...
        </Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="h6" color="error">
          无法加载仪表板数据
        </Typography>
      </Box>
    );
  }

  const completionRate = data.total_issues > 0 
    ? Math.round((data.completed_issues / data.total_issues) * 100) 
    : 0;

  const metrics = [
    {
      title: '总需求数',
      value: data.total_issues,
      icon: <Assignment sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      subtitle: '所有JIRA需求'
    },
    {
      title: '已完成',
      value: data.completed_issues,
      icon: <CheckCircle sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      subtitle: `完成率 ${completionRate}%`
    },
    {
      title: '进行中',
      value: data.in_progress_issues,
      icon: <Schedule sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      subtitle: '正在开发中'
    },
    {
      title: '史诗数',
      value: data.epic_count,
      icon: <Movie sx={{ fontSize: 40 }} />,
      color: '#e91e63',
      subtitle: 'Epic类型问题'
    },
    {
      title: '项目数量',
      value: data.total_projects,
      icon: <Folder sx={{ fontSize: 40 }} />,
      color: '#7b1fa2',
      subtitle: '活跃项目'
    },
    {
      title: '经办人数',
      value: data.total_assignees,
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#1565c0',
      subtitle: '参与人员'
    }
  ];

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          📊 JIRA BI 数据看板
        </Typography>
        <Box display="flex" gap={1}>
          <Chip 
            label={`完成率 ${completionRate}%`} 
            color={completionRate >= 80 ? 'success' : completionRate >= 60 ? 'warning' : 'error'}
            variant="filled"
          />
          <Chip 
            label={`${data.total_projects} 个项目`} 
            color="primary" 
            variant="outlined"
          />
        </Box>
      </Box>

      <Box 
        display="grid" 
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)', 
          md: 'repeat(3, 1fr)',
          lg: 'repeat(6, 1fr)'
        }}
        gap={3}
      >
        {metrics.map((metric, index) => (
          <Box key={index}>
            <MetricCard {...metric} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DashboardSummary; 