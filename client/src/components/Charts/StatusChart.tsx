import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { StatusStats } from '../../services/apiService';

interface StatusChartProps {
  data: StatusStats[];
  loading: boolean;
}

// 状态颜色映射
const STATUS_COLORS: Record<string, string> = {
  'Done': '#2e7d32',
  'Closed': '#1b5e20',
  'In Progress': '#ed6c02',
  'To Do': '#d32f2f',
  'Open': '#1976d2',
  'Resolved': '#388e3c',
  'Reopened': '#f57c00',
  'default': '#757575'
};

const getStatusColor = (status: string): string => {
  return STATUS_COLORS[status] || STATUS_COLORS.default;
};

// 自定义工具提示
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <Box
        sx={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: 1,
          padding: 2,
          boxShadow: 2
        }}
      >
        <Typography variant="body2" fontWeight="bold">
          {data.payload.status}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          数量: {data.value}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          占比: {((data.value / data.payload.total) * 100).toFixed(1)}%
        </Typography>
      </Box>
    );
  }
  return null;
};

// 自定义标签
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null; // 小于5%不显示标签
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const StatusChart: React.FC<StatusChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card sx={{ height: 400 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 需求状态分布
          </Typography>
          <Box display="flex" justifyContent="center" alignItems="center" height={300}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card sx={{ height: 400 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 需求状态分布
          </Typography>
          <Box display="flex" justifyContent="center" alignItems="center" height={300}>
            <Typography color="textSecondary">暂无数据</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // 计算总数用于百分比计算
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const chartData = data.map(item => ({
    ...item,
    total,
    color: getStatusColor(item.status)
  }));

  return (
    <Card sx={{ height: 400 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          📊 需求状态分布
        </Typography>
        <Box height={320}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry: any) => (
                  <span style={{ color: entry.color }}>
                    {value} ({entry.payload.count})
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatusChart; 