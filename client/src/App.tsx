import React, { useState, useEffect } from 'react';
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Backdrop,
  CircularProgress,
  Switch,
  FormControlLabel,
  Stack
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import apiService, { FilterParams, DashboardSummary, CreationTrend, PriorityDistribution, ProjectStats, DesignerWorkload, DesignerWorkHours } from './services/apiService';
import ModernDashboardSummary from './components/Dashboard/ModernDashboardSummary';
import EChartsTrendChart from './components/Charts/EChartsTrendChart';
import EChartsPriorityPieChart from './components/Charts/EChartsPriorityPieChart';
import EChartsProjectPieChart from './components/Charts/EChartsProjectPieChart';
import EChartsDesignerBarChart from './components/Charts/EChartsDesignerBarChart';
import EChartsDesignerWorkHoursChart from './components/Charts/EChartsDesignerWorkHoursChart';
import ProductManagerMetricsCard from './components/Charts/ProductManagerMetricsCard';
import DateRangeSelector, { DateTimeType } from './components/Common/DateRangeSelector';
import PrintReportButton, { PrintDimension } from './components/Common/PrintReportButton';
import PrintService from './services/printService';

// 现代主题配置 - 低饱和度浅蓝色系
const theme = createTheme({
  palette: {
    primary: {
      main: '#7dd3fc',      // 浅蓝色
      light: '#bae6fd',     // 更浅的蓝色
      dark: '#0284c7'       // 深一点的蓝色
    },
    secondary: {
      main: '#a5b4fc',      // 浅紫蓝色
      light: '#c7d2fe',     // 淡紫蓝色
      dark: '#6366f1'       // 深紫蓝色
    },
    background: {
      default: '#f8fafc',   // 极浅的灰蓝色
      paper: '#ffffff'
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#1e293b'
    },
    h5: {
      fontWeight: 600,
      color: '#1e293b'
    },
    h6: {
      fontWeight: 600,
      color: '#1e293b'
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          borderRadius: 8,
          border: '1px solid #e2e8f0'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }
      }
    }
  }
});

// 获取格式化的日期字符串 (YYYY-MM-DD)
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// 获取今天的日期
const getTodayString = (): string => {
  return formatDate(new Date());
};

// 获取2025年1月1日
const getDefaultStartDate = (): string => {
  return '2025-01-01';
};

function App() {
  // CW关联项目列表 - 根据用户提供的22个真正CW项目ID
  const CW_PROJECT_IDS = [
    'AUTH',     // AUTH (10109)
    'B2B',      // B2B (10105) 
    'BI',       // BI (10309)
    'CARGO',    // Cargo (10103)
    'BASIC',    // CargoWare基础版 (10303)
    'CAR1',     // CargoWare研发 (10515)
    'CWUI',     // CargoWare自动化 (10536)
    'DW',       // DW (10104)
    'JIRA',     // Jira使用 (10512)
    'NEWB2B',   // NewB2B (10500)
    'UBICW',    // UBI Cargoware (10504)
    'VCARGO',   // VCargo (10106)
    'WC',       // Walltech Console(沃联之家) (10304)
    'WKC',      // WT Knowledge Chat (10609)
    'YUSEN',    // Yusen (10107)
    'BJCJ',     // 北京长久 (10534)
    'DLJF',     // 大连集发 (10603)
    'BILLING',  // 计费系统 (10110)
    'SQ',       // 售前 (10704)
    'PILL',     // 太平物流 (10607)
    'CP',       // 沃行产品部 (10604)
    'TOPIDEAL'  // 卓志 (10108)
  ];

  // 需求类型ID列表 - 对应需求相关的问题类型（转换为字符串以匹配API类型）
  const REQUIREMENT_TYPE_IDS = [
    '10001',  // 故事
    '10501',  // Customer Requirement
    '10000',  // Epic
    '10505',  // 技术需求
    '10101',  // Functional Requirement
    '10104',  // UI Requirement
    '10700',  // 需求建议
    '10103',  // Business Requirement
    '10102'   // Non-Functional Requirement
  ];

  // 状态管理
  const [loading, setLoading] = useState(false);
  const [globalLoading, setGlobalLoading] = useState(true);
  const [cwProjectsOnly, setCwProjectsOnly] = useState(true);
  const [requirementTypesOnly, setRequirementTypesOnly] = useState(true);

  // 日期筛选状态 - 默认为2025.1.1到今天
  const [startDate, setStartDate] = useState<string>(getDefaultStartDate());
  const [endDate, setEndDate] = useState<string>(getTodayString());
  const [dateTimeType, setDateTimeType] = useState<DateTimeType>('created');

  // 数据状态
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [trendData, setTrendData] = useState<CreationTrend[]>([]);
  const [priorityData, setPriorityData] = useState<PriorityDistribution[]>([]);
  const [projectStats, setProjectStats] = useState<ProjectStats[]>([]);
  const [designerWorkload, setDesignerWorkload] = useState<DesignerWorkload[]>([]);
  const [designerWorkHours, setDesignerWorkHours] = useState<DesignerWorkHours[]>([]);

  // 当前筛选参数
  const [currentFilters, setCurrentFilters] = useState<FilterParams>({});

  // 打印相关状态
  const [printLoading, setPrintLoading] = useState(false);

  // 加载仪表板摘要
  const loadDashboardSummary = async (filters: FilterParams = {}) => {
    try {
      setLoading(true);
      const summary = await apiService.fetchDashboardSummary(filters);
      setDashboardSummary(summary);
    } catch (error) {
      console.error('加载仪表板摘要失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载趋势数据
  const loadTrendData = async (filters: FilterParams = {}) => {
    try {
      const trendData = await apiService.fetchIssueCreationTrend(12, filters);
      setTrendData(trendData);
    } catch (error) {
      console.error('加载趋势数据失败:', error);
    }
  };

  // 加载优先级分布数据
  const loadPriorityData = async (filters: FilterParams = {}) => {
    try {
      const priorityData = await apiService.fetchIssuePriorityDistribution(filters);
      setPriorityData(priorityData);
    } catch (error) {
      console.error('加载优先级分布数据失败:', error);
    }
  };

  // 加载项目统计数据
  const loadProjectStats = async (filters: FilterParams = {}) => {
    try {
      const projectStats = await apiService.fetchProjectStats(filters);
      setProjectStats(projectStats);
    } catch (error) {
      console.error('加载项目统计数据失败:', error);
    }
  };

  // 加载设计师工作量数据
  const loadDesignerWorkload = async (filters: FilterParams = {}) => {
    try {
      const designerWorkload = await apiService.fetchDesignerWorkloadStats(filters);
      setDesignerWorkload(designerWorkload);
    } catch (error) {
      console.error('加载设计师工作量数据失败:', error);
    }
  };

  // 加载设计师工作时间数据
  const loadDesignerWorkHours = async (filters: FilterParams = {}) => {
    try {
      const designerWorkHours = await apiService.fetchDesignerWorkHoursStats(filters);
      setDesignerWorkHours(designerWorkHours);
    } catch (error) {
      console.error('加载设计师工作时间数据失败:', error);
    }
  };

  // 构建当前筛选条件
  const buildFilters = (): FilterParams => {
    const filters: FilterParams = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      dateTimeType: dateTimeType
    };

    // 如果开启了CW项目模式，自动添加CW项目筛选
    if (cwProjectsOnly) {
      filters.projects = CW_PROJECT_IDS;
    }

    // 如果开启了需求类型模式，自动添加需求类型筛选
    if (requirementTypesOnly) {
      filters.issueTypes = REQUIREMENT_TYPE_IDS;
    }

    return filters;
  };

  // 处理筛选变化
  const handleFilterChange = async (filters: FilterParams) => {
    // 构建最终筛选条件，包含日期范围和时间类型
    const finalFilters: FilterParams = {
      ...filters,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      dateTimeType: dateTimeType
    };

    // 如果开启了CW项目模式，自动添加CW项目筛选
    if (cwProjectsOnly) {
      finalFilters.projects = CW_PROJECT_IDS;
    }

    // 如果开启了需求类型模式，自动添加需求类型筛选
    if (requirementTypesOnly) {
      finalFilters.issueTypes = REQUIREMENT_TYPE_IDS;
    }

    setCurrentFilters(finalFilters);
    await Promise.all([
      loadDashboardSummary(finalFilters),
      loadTrendData(finalFilters),
      loadPriorityData(finalFilters),
      loadProjectStats(finalFilters),
      loadDesignerWorkload(finalFilters),
      loadDesignerWorkHours(finalFilters)
    ]);
  };

  // 处理日期变化
  const handleDateChange = async () => {
    // 构建包含日期的筛选条件
    const filtersWithDate: FilterParams = {
      ...currentFilters,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      dateTimeType: dateTimeType
    };

    if (cwProjectsOnly) {
      filtersWithDate.projects = CW_PROJECT_IDS;
    }

    if (requirementTypesOnly) {
      filtersWithDate.issueTypes = REQUIREMENT_TYPE_IDS;
    }

    setCurrentFilters(filtersWithDate);
    await Promise.all([
      loadDashboardSummary(filtersWithDate),
      loadTrendData(filtersWithDate),
      loadPriorityData(filtersWithDate),
      loadProjectStats(filtersWithDate),
      loadDesignerWorkload(filtersWithDate),
      loadDesignerWorkHours(filtersWithDate)
    ]);
  };

  // 处理CW项目开关变化
  const handleCwProjectsToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setCwProjectsOnly(checked);
    
    // 构建新的筛选条件，立即应用CW项目筛选
    const newFilters: FilterParams = {
      ...currentFilters,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      dateTimeType: dateTimeType,
      projects: checked ? CW_PROJECT_IDS : undefined
    };

    // 保持需求类型筛选状态
    if (requirementTypesOnly) {
      newFilters.issueTypes = REQUIREMENT_TYPE_IDS;
    }
    
    setCurrentFilters(newFilters);
    await Promise.all([
      loadDashboardSummary(newFilters),
      loadTrendData(newFilters),
      loadPriorityData(newFilters),
      loadProjectStats(newFilters),
      loadDesignerWorkload(newFilters),
      loadDesignerWorkHours(newFilters)
    ]);
  };

  // 处理需求类型开关变化
  const handleRequirementTypesToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setRequirementTypesOnly(checked);
    
    // 构建新的筛选条件，立即应用需求类型筛选
    const newFilters: FilterParams = {
      ...currentFilters,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      dateTimeType: dateTimeType,
      issueTypes: checked ? REQUIREMENT_TYPE_IDS : undefined
    };

    // 保持CW项目筛选状态
    if (cwProjectsOnly) {
      newFilters.projects = CW_PROJECT_IDS;
    }
    
    setCurrentFilters(newFilters);
    await Promise.all([
      loadDashboardSummary(newFilters),
      loadTrendData(newFilters),
      loadPriorityData(newFilters),
      loadProjectStats(newFilters),
      loadDesignerWorkload(newFilters),
      loadDesignerWorkHours(newFilters)
    ]);
  };

  // 处理打印报告
  const handlePrintReport = async (dimension: PrintDimension) => {
    try {
      setPrintLoading(true);
      console.log(`🖨️ 开始打印${dimension === 'all' ? '全部维度' : dimension}报告...`);
      
      // 定义维度变更处理函数
      const handleDimensionChange = async (newDateTimeType: DateTimeType) => {
        setDateTimeType(newDateTimeType);
        await new Promise(resolve => setTimeout(resolve, 100)); // 短暂延时等待状态更新
        await loadAllData(); // 重新加载所有数据
      };

      // 调用打印服务
      await PrintService.printReport(dimension, handleDimensionChange);
      
      console.log('✅ 报告生成完成');
    } catch (error) {
      console.error('❌ 打印报告失败:', error);
      alert('打印报告时发生错误，请重试');
    } finally {
      setPrintLoading(false);
    }
  };

  // 加载所有数据的统一方法
  const loadAllData = async () => {
    const filters = buildFilters();
    
    // 并行加载所有数据
    await Promise.all([
      loadDashboardSummary(filters),
      loadTrendData(filters),
      loadPriorityData(filters),
      loadProjectStats(filters),
      loadDesignerWorkload(filters),
      loadDesignerWorkHours(filters)
    ]);
  };

  // 初始加载
  useEffect(() => {
    const initialLoad = async () => {
      setGlobalLoading(true);
      await handleFilterChange({});
      setGlobalLoading(false);
    };
    
    initialLoad();
  }, []);

  // 监听日期变化，自动更新数据
  useEffect(() => {
    if (!globalLoading) { // 避免初始加载时重复调用
      const timeoutId = setTimeout(() => {
        handleDateChange();
      }, 300); // 延迟300ms避免频繁请求

      return () => clearTimeout(timeoutId);
    }
  }, [startDate, endDate, dateTimeType]);

  if (globalLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Backdrop
          open={true}
          sx={{
            color: '#0284c7',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            background: '#ffffff'
          }}
        >
          <Box textAlign="center">
            <CircularProgress color="inherit" size={60} />
            <Typography variant="h6" sx={{ mt: 2, color: '#334155' }}>
              正在加载JIRA数据分析看板...
            </Typography>
          </Box>
        </Backdrop>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* 顶部导航栏 */}
        <AppBar 
          position="fixed" 
          elevation={0}
          sx={{
            background: '#ffffff',
            color: '#1e293b',
            borderBottom: '1px solid #e2e8f0',
            zIndex: (theme) => theme.zIndex.drawer + 1
          }}
        >
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: '#1e293b', mr: 3 }}>
              JIRA数据分析看板
            </Typography>
            
            {/* 日期范围选择器 */}
            <DateRangeSelector
              startDate={startDate}
              endDate={endDate}
              dateTimeType={dateTimeType}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onDateTimeTypeChange={setDateTimeType}
              disabled={loading}
            />
            
            {/* 弹性空间 */}
            <Box sx={{ flexGrow: 1 }} />
            
            {/* 开关组 */}
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={requirementTypesOnly}
                    onChange={handleRequirementTypesToggle}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#059669',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#059669',
                      },
                    }}
                  />
                }
                label="只看需求类"
                sx={{ 
                  color: '#64748b',
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }
                }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={cwProjectsOnly}
                    onChange={handleCwProjectsToggle}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#0284c7',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#0284c7',
                      },
                    }}
                  />
                }
                label="只看CW关联项目"
                sx={{ 
                  color: '#64748b',
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }
                }}
              />

              {/* 打印报告按钮 */}
              <PrintReportButton
                onPrint={handlePrintReport}
                loading={printLoading}
              />
            </Stack>
          </Toolbar>
        </AppBar>

        {/* 主要内容区域 */}
        <Box
          component="main"
          data-print-content
          sx={{
            flexGrow: 1,
            pt: 10,
            pb: 4,
            px: 3,
            background: '#f8fafc',
            minHeight: '100vh'
          }}
        >
          <Container maxWidth="xl">
            <Box sx={{ mb: 4 }}>
              {/* 仪表板摘要 */}
              <ModernDashboardSummary
                data={dashboardSummary}
                loading={loading}
              />
            </Box>

            <Box sx={{ mb: 4 }}>
              {/* 趋势图表 */}
              <EChartsTrendChart
                data={trendData}
                loading={loading}
                dateTimeType={dateTimeType}
                startDate={startDate}
                endDate={endDate}
              />
            </Box>

            <Box sx={{ mb: 4, display: 'flex', gap: 3 }}>
              {/* 左侧：优先级分布图表 */}
              <Box sx={{ flex: '0 0 48%' }}>
                <EChartsPriorityPieChart
                  data={priorityData}
                  loading={loading}
                />
              </Box>
              
              {/* 右侧：项目统计图表 */}
              <Box sx={{ flex: '0 0 48%' }}>
                <EChartsProjectPieChart
                  data={projectStats}
                  loading={loading}
                />
              </Box>
            </Box>

            <Box sx={{ mb: 4, display: 'flex', gap: 3 }}>
              {/* 左侧：设计师工作量图表 */}
              <Box sx={{ flex: '0 0 48%' }}>
                <EChartsDesignerBarChart
                  data={designerWorkload}
                  loading={loading}
                />
              </Box>
              
              {/* 右侧：设计师工时图表 */}
              <Box sx={{ flex: '0 0 48%' }}>
                <EChartsDesignerWorkHoursChart
                  data={designerWorkHours}
                  loading={loading}
                  filters={{
                    startDate,
                    endDate,
                    dateTimeType,
                    issueTypes: requirementTypesOnly ? ['需求'] : null,
                    projects: cwProjectsOnly ? CW_PROJECT_IDS : null
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
              {/* 产品经理指标卡 */}
              <ProductManagerMetricsCard
                filters={currentFilters}
                loading={loading}
              />
            </Box>
          </Container>
        </Box>

        {/* 加载遮罩 */}
        <Backdrop
          open={loading || printLoading}
          sx={{
            color: '#0284c7',
            zIndex: (theme) => theme.zIndex.modal + 1,
            background: 'rgba(248, 250, 252, 0.8)',
            backdropFilter: 'blur(4px)'
          }}
        >
          <Box textAlign="center">
            <CircularProgress color="inherit" />
            <Typography variant="body1" sx={{ mt: 2, color: '#334155' }}>
              {printLoading ? '正在生成PDF报告...' : '正在更新数据...'}
            </Typography>
          </Box>
        </Backdrop>
      </Box>
    </ThemeProvider>
  );
}

export default App;
