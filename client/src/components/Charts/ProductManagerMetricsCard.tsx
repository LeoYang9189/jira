import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Divider,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { FilterParams, ProductManagerMetrics, DesignerReopenDetail, DesignerIssueDetail } from '../../services/apiService';
import apiService from '../../services/apiService';
import DesignerReopenDetailsDialog from './DesignerReopenDetailsDialog';
import DesignerIssueDetailsDialog from './DesignerIssueDetailsDialog';

interface ProductManagerMetricsCardProps {
  filters: FilterParams;
  loading?: boolean;
}

interface MetricItemProps {
  title: string;
  value: number | string;
  unit?: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  textColor?: string;
  showDetailsButton?: boolean;
  onDetailsClick?: () => void;
  buttonLoading?: boolean;
}

const MetricItem: React.FC<MetricItemProps> = ({
  title,
  value,
  unit = '',
  icon: Icon,
  color,
  bgColor,
  textColor = '#1e293b',
  showDetailsButton = false,
  onDetailsClick,
  buttonLoading = false
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        background: bgColor,
        borderRadius: 2,
        border: '1px solid #e2e8f0',
        height: '100%',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
        }
      }}
    >
      <Box display="flex" alignItems="center" mb={2}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 2
          }}
        >
          <Icon sx={{ color, fontSize: 24 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: textColor,
              lineHeight: 1
            }}
          >
            {typeof value === 'number' ? (
              unit === '%' ? `${value}%` : value.toLocaleString()
            ) : (
              value
            )}
            {unit && unit !== '%' && (
              <Typography
                component="span"
                variant="body2"
                sx={{ color: '#64748b', ml: 0.5, fontWeight: 400 }}
              >
                {unit}
              </Typography>
            )}
          </Typography>
        </Box>
        {showDetailsButton && (
          <Tooltip title="查看详细信息">
            <IconButton
              size="small"
              onClick={onDetailsClick}
              sx={{ 
                color: color,
                '&:hover': {
                  backgroundColor: `${color}15`
                }
              }}
              disabled={buttonLoading}
            >
              {buttonLoading ? (
                <CircularProgress size={16} sx={{ color: color }} />
              ) : (
                <VisibilityIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Typography
        variant="body2"
        sx={{
          color: '#64748b',
          fontWeight: 500,
          fontSize: '0.875rem'
        }}
      >
        {title}
      </Typography>
    </Paper>
  );
};

// 渲染单个设计师的指标卡片
const DesignerMetricsSection: React.FC<{
  designer: ProductManagerMetrics;
  onIssueDetails: (designerName: string) => void;
  onReopenDetails: (designerName: string) => void;
  issueButtonLoading: boolean;
  reopenButtonLoading: boolean;
}> = ({ designer, onIssueDetails, onReopenDetails, issueButtonLoading, reopenButtonLoading }) => {
  return (
    <Box sx={{ mb: 4 }}>
      {/* 设计师名称 */}
      <Typography variant="h6" sx={{ 
        fontWeight: 600, 
        color: '#1e293b', 
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <PersonIcon sx={{ fontSize: 20, color: '#059669' }} />
        {designer.designer_name}
      </Typography>
      
      {/* 指标卡片网格 */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
          gap: 2,
          mb: 3
        }}
      >
        <MetricItem
          title="设计Issue数"
          value={designer.design_issue_count}
          unit="个"
          icon={AssignmentIcon}
          color="#0284c7"
          bgColor="linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)"
          showDetailsButton={true}
          onDetailsClick={() => onIssueDetails(designer.designer_name)}
          buttonLoading={issueButtonLoading}
        />
        
        <MetricItem
          title="实际开发工时"
          value={designer.total_work_hours}
          unit="小时"
          icon={ScheduleIcon}
          color="#059669"
          bgColor="linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)"
        />
        
        <MetricItem
          title="设计Reopen次数"
          value={designer.total_reopen_count}
          unit="次"
          icon={RefreshIcon}
          color="#d97706"
          bgColor="linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
          showDetailsButton={true}
          onDetailsClick={() => onReopenDetails(designer.designer_name)}
          buttonLoading={reopenButtonLoading}
        />
        
        <MetricItem
          title="设计Reopen率"
          value={designer.reopen_rate}
          unit="%"
          icon={AssessmentIcon}
          color="#e11d48"
          bgColor="linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)"
        />
      </Box>
      
      <Divider sx={{ mt: 2 }} />
    </Box>
  );
};

const ProductManagerMetricsCard: React.FC<ProductManagerMetricsCardProps> = ({
  filters,
  loading = false
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [metricsData, setMetricsData] = useState<ProductManagerMetrics[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [reopenDetails, setReopenDetails] = useState<DesignerReopenDetail[]>([]);
  const [issueDetails, setIssueDetails] = useState<DesignerIssueDetail[]>([]);
  const [isReopenDetailsDialogOpen, setIsReopenDetailsDialogOpen] = useState(false);
  const [isIssueDetailsDialogOpen, setIsIssueDetailsDialogOpen] = useState(false);
  const [reopenDetailsLoading, setReopenDetailsLoading] = useState(false);
  const [issueDetailsLoading, setIssueDetailsLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [issueButtonLoading, setIssueButtonLoading] = useState(false);

  // 目标设计师列表
  const targetDesigners = ['Neal', '杨琪磊', '李佳琦', '朱俊阳', '杨辰吉', '洪婉秋'];

  // 检测是否为打印模式（屏幕宽度判断）
  const isPrintMode = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('print').matches;

  // 获取数据
  const fetchMetrics = async () => {
    try {
      setDataLoading(true);
      console.log('📊 获取产品经理指标数据...');
      
      const data = await apiService.getAllProductManagerMetrics(filters);
      console.log('产品经理指标数据:', data);
      
      setMetricsData(data);
    } catch (error) {
      console.error('获取产品经理指标失败:', error);
      setMetricsData([]);
    } finally {
      setDataLoading(false);
    }
  };

  // 监听筛选条件变化
  useEffect(() => {
    fetchMetrics();
  }, [filters]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  // 获取当前选中设计师的数据
  const getCurrentMetrics = (): ProductManagerMetrics | null => {
    const designerName = targetDesigners[selectedTab];
    return metricsData.find(item => item.designer_name === designerName) || null;
  };

  const currentMetrics = getCurrentMetrics();

  const handleReopenDetails = async (designerName: string) => {
    try {
      setButtonLoading(true);
      setReopenDetailsLoading(true);
      console.log(`📋 正在获取${designerName}的Reopen详细信息...`);
      
      const details = await apiService.getDesignerReopenDetails(designerName, filters);
      console.log(`✅ ${designerName}的Reopen详细信息获取成功:`, details);
      
      setReopenDetails(details);
      setIsReopenDetailsDialogOpen(true);
    } catch (error) {
      console.error('获取设计师Reopen详细信息失败:', error);
      setReopenDetails([]);
    } finally {
      setButtonLoading(false);
      setReopenDetailsLoading(false);
    }
  };

  const handleIssueDetails = async (designerName: string) => {
    try {
      setIssueButtonLoading(true);
      setIssueDetailsLoading(true);
      console.log(`📋 正在获取${designerName}的Issue详细信息...`);
      
      const details = await apiService.getDesignerIssueDetails(designerName, filters);
      console.log(`✅ ${designerName}的Issue详细信息获取成功:`, details);
      
      setIssueDetails(details);
      setIsIssueDetailsDialogOpen(true);
    } catch (error) {
      console.error('获取设计师Issue详细信息失败:', error);
      setIssueDetails([]);
    } finally {
      setIssueButtonLoading(false);
      setIssueDetailsLoading(false);
    }
  };

  if (loading || dataLoading) {
    return (
      <Card sx={{ height: '400px' }}>
        <CardContent sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={40} sx={{ color: '#059669' }} />
        </CardContent>
      </Card>
    );
  }

  // 打印模式：显示所有设计师
  if (isPrintMode || window.location.search.includes('print=true')) {
    return (
      <Card sx={{ height: 'auto', minHeight: '400px' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 3 }}>
            产品经理指标卡 - 完整报告
          </Typography>
          
          {targetDesigners.map(designerName => {
            const designerMetrics = metricsData.find(item => item.designer_name === designerName);
            if (!designerMetrics) return null;
            
            return (
              <DesignerMetricsSection
                key={designerName}
                designer={designerMetrics}
                onIssueDetails={handleIssueDetails}
                onReopenDetails={handleReopenDetails}
                issueButtonLoading={issueButtonLoading}
                reopenButtonLoading={buttonLoading}
              />
            );
          })}
        </CardContent>
      </Card>
    );
  }

  // 正常模式：Tab切换
  return (
    <Card sx={{ height: 'auto', minHeight: '400px' }}>
      <CardContent sx={{ p: 0 }}>
        {/* 标题和Tab切换 */}
        <Box sx={{ px: 3, pt: 3, pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 2 }}>
            产品经理指标卡
          </Typography>
          
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minWidth: 'auto',
                px: 2,
                py: 1,
                mx: 0.5,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#64748b',
                borderRadius: 1,
                '&.Mui-selected': {
                  color: '#059669',
                  backgroundColor: '#dcfce7'
                }
              },
              '& .MuiTabs-indicator': {
                display: 'none'
              }
            }}
          >
            {targetDesigners.map((designer, index) => (
              <Tab
                key={designer}
                label={
                  <Box display="flex" alignItems="center">
                    <PersonIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    {designer}
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>

        <Divider sx={{ mx: 3 }} />

        {/* 指标展示 */}
        <Box sx={{ p: 3 }}>
          {currentMetrics ? (
            <>
              {/* 指标卡片 - 使用Box布局 */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2
                }}
              >
                <MetricItem
                  title="设计Issue数"
                  value={currentMetrics.design_issue_count}
                  unit="个"
                  icon={AssignmentIcon}
                  color="#0284c7"
                  bgColor="linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)"
                  showDetailsButton={true}
                  onDetailsClick={() => handleIssueDetails(currentMetrics.designer_name)}
                  buttonLoading={issueButtonLoading}
                />
                
                <MetricItem
                  title="实际开发工时"
                  value={currentMetrics.total_work_hours}
                  unit="小时"
                  icon={ScheduleIcon}
                  color="#059669"
                  bgColor="linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)"
                />
                
                <MetricItem
                  title="设计Reopen次数"
                  value={currentMetrics.total_reopen_count}
                  unit="次"
                  icon={RefreshIcon}
                  color="#d97706"
                  bgColor="linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
                  showDetailsButton={true}
                  onDetailsClick={() => handleReopenDetails(currentMetrics.designer_name)}
                  buttonLoading={buttonLoading}
                />
                
                <MetricItem
                  title="设计Reopen率"
                  value={currentMetrics.reopen_rate}
                  unit="%"
                  icon={AssessmentIcon}
                  color="#e11d48"
                  bgColor="linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)"
                />
              </Box>
            </>
          ) : (
            <Box
              sx={{
                height: '200px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b'
              }}
            >
              <Typography variant="h6" sx={{ mb: 1, color: '#94a3b8' }}>
                暂无数据
              </Typography>
              <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                请检查筛选条件或数据源
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>

      {isReopenDetailsDialogOpen && (
        <DesignerReopenDetailsDialog
          open={isReopenDetailsDialogOpen}
          onClose={() => setIsReopenDetailsDialogOpen(false)}
          designerName={currentMetrics?.designer_name || ''}
          totalReopenCount={currentMetrics?.total_reopen_count || 0}
          reopenDetails={reopenDetails}
          loading={reopenDetailsLoading}
        />
      )}

      {isIssueDetailsDialogOpen && (
        <DesignerIssueDetailsDialog
          open={isIssueDetailsDialogOpen}
          onClose={() => setIsIssueDetailsDialogOpen(false)}
          designerName={currentMetrics?.designer_name || ''}
          totalIssueCount={currentMetrics?.design_issue_count || 0}
          issueDetails={issueDetails}
          loading={issueDetailsLoading}
        />
      )}
    </Card>
  );
};

export default ProductManagerMetricsCard; 