import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { CreationTrend } from '../../services/apiService';

interface TrendChartProps {
  data: CreationTrend[];
  loading: boolean;
}

// 自定义工具提示
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
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
          {label}
        </Typography>
        <Typography variant="body2" color="primary">
          创建数量: {payload[0].value}
        </Typography>
      </Box>
    );
  }
  return null;
};

// 格式化月份显示
const formatMonth = (month: string) => {
  const [year, monthNum] = month.split('-');
  return `${year}年${monthNum}月`;
};

const TrendChart: React.FC<TrendChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card sx={{ height: 400 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📈 需求创建趋势
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
            📈 需求创建趋势
          </Typography>
          <Box display="flex" justifyContent="center" alignItems="center" height={300}>
            <Typography color="textSecondary">暂无数据</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // 处理数据，添加格式化的月份显示
  const chartData = data.map(item => ({
    ...item,
    monthDisplay: formatMonth(item.month)
  }));

  // 计算统计信息
  const totalIssues = data.reduce((sum, item) => sum + item.count, 0);
  const avgPerMonth = Math.round(totalIssues / data.length);
  const maxMonth = data.reduce((max, item) => item.count > max.count ? item : max, data[0]);

  return (
    <Card sx={{ height: 400 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            📈 需求创建趋势
          </Typography>
          <Box display="flex" gap={2}>
            <Typography variant="body2" color="textSecondary">
              总计: {totalIssues}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              月均: {avgPerMonth}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              峰值: {maxMonth.count} ({formatMonth(maxMonth.month)})
            </Typography>
          </Box>
        </Box>
        
        <Box height={320}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#1976d2" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="monthDisplay" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: '需求数量', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#1976d2"
                strokeWidth={3}
                fill="url(#colorTrend)"
                dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#1976d2', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TrendChart; 