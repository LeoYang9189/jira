import axios from 'axios';

// API基础配置
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🔄 API请求: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API响应: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API响应错误:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// 筛选参数接口
export interface FilterParams {
  startDate?: string;
  endDate?: string;
  dateTimeType?: 'created' | 'completed_design' | 'closed' | 'actual_release';
  issueTypes?: string[];
  projects?: string[];
  assignees?: string[];
}

// 日期筛选参数接口（保持向后兼容）
export interface DateFilter {
  startDate?: string;
  endDate?: string;
}

// 数据类型定义
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface DashboardSummary {
  total_issues: number;
  completed_issues: number;
  in_progress_issues: number;
  epic_count: number;
  total_projects: number;
  total_assignees: number;
  // 同比数据 (Year-over-Year)
  total_issues_yoy?: number;
  completed_issues_yoy?: number;
  in_progress_issues_yoy?: number;
  epic_count_yoy?: number;
  total_projects_yoy?: number;
  // 环比数据 (Month-over-Month)
  total_issues_mom?: number;
  completed_issues_mom?: number;
  in_progress_issues_mom?: number;
  epic_count_mom?: number;
  total_projects_mom?: number;
  // 历史数据用于前端计算
  last_year_total_issues?: number;
  last_year_completed_issues?: number;
  last_year_in_progress_issues?: number;
  last_year_epic_count?: number;
  last_year_total_projects?: number;
  last_period_total_issues?: number;
  last_period_completed_issues?: number;
  last_period_in_progress_issues?: number;
  last_period_epic_count?: number;
  last_period_total_projects?: number;
}

export interface StatusStats {
  status: string;
  count: number;
}

export interface PriorityDistribution {
  priority: string;
  count: number;
  percentage: number;
}

export interface TypeStats {
  issue_type: string;
  count: number;
}

export interface CreationTrend {
  month: string;
  count: number;
}

export interface ResolutionTimeStats {
  avg_resolution_days: number;
  min_resolution_days: number;
  max_resolution_days: number;
  resolved_count: number;
}

export interface ProjectStats {
  project_key: string;
  project_name: string;
  total_issues: number;
  completed_issues: number;
  active_issues: number;
}

export interface AssigneeWorkload {
  assignee: string;
  total_assigned: number;
  completed: number;
  in_progress: number;
  todo: number;
}

export interface Project {
  ID: number;
  project_name: string;
  project_key: string;
  project_lead: string;
  DESCRIPTION: string;
  project_type: string;
  assignee_type: number;
}

export interface IssueType {
  ID: number;
  issue_type: string;
  DESCRIPTION: string;
  count: number;
}

export interface Assignee {
  assignee_username: string;
  assignee_display_name: string;
  assigned_issues_count: number;
}

export interface HistoryStats {
  change_date: string;
  field_name: string;
  change_count: number;
}

export interface DesignerWorkload {
  designer_name: string;
  designed_issues_count: number;
}

export interface DesignerWorkHours {
  designer_name: string;
  total_work_hours: number;
}

// 设计人员详细issue信息接口
export interface DesignerIssueDetail {
  issue_id: number;
  issue_key: string;
  issue_title: string;
  created_date: string;
  updated_date: string;
  project_name: string;
  project_key: string;
  issue_type: string;
  status: string;
  priority: string;
  assignee: string;
  designer_name: string;
  work_hours: number;
}

// 产品经理指标接口
export interface ProductManagerMetrics {
  designer_name: string;
  design_issue_count: number;
  total_work_hours: number;
  total_reopen_count: number;
  reopen_rate: number;
}

// 设计师Reopen详细信息接口
export interface DesignerReopenDetail {
  issue_id: number;
  issue_key: string;
  issue_title: string;
  created_date: string;
  updated_date: string;
  project_name: string;
  project_key: string;
  issue_type: string;
  status: string;
  priority: string;
  assignee: string;
  designer_name: string;
  reopen_count: number;
}

// API服务类
class ApiService {
  
  // 构建查询参数
  private buildQueryParams(params: Record<string, any>): string {
    console.log('🔧 构建查询参数:', params);
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          // 数组参数转换为逗号分隔的字符串
          if (value.length > 0) {
            searchParams.append(key, value.join(','));
          }
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });
    const queryString = searchParams.toString();
    const result = queryString ? `?${queryString}` : '';
    console.log('🔗 生成的查询字符串:', result);
    return result;
  }
  
  // 获取数据库表结构
  async fetchDatabaseStructure(dbName: string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/database/structure/${dbName}`);
    return response.data.data;
  }

  // 获取仪表板摘要
  async fetchDashboardSummary(filters?: FilterParams): Promise<DashboardSummary> {
    const queryParams = this.buildQueryParams(filters || {});
    const response = await apiClient.get<ApiResponse<DashboardSummary>>(`/dashboard/summary${queryParams}`);
    return response.data.data;
  }

  // 获取需求状态统计
  async fetchIssueStatusStats(filters?: FilterParams): Promise<StatusStats[]> {
    const queryParams = this.buildQueryParams(filters || {});
    const response = await apiClient.get<ApiResponse<StatusStats[]>>(`/issues/status-stats${queryParams}`);
    return response.data.data;
  }

  // 获取需求优先级分布
  async fetchIssuePriorityDistribution(filters?: FilterParams): Promise<PriorityDistribution[]> {
    const queryParams = this.buildQueryParams(filters || {});
    const response = await apiClient.get<ApiResponse<PriorityDistribution[]>>(`/issues/priority-distribution${queryParams}`);
    return response.data.data;
  }

  // 获取需求类型统计
  async fetchIssueTypeStats(filters?: FilterParams): Promise<TypeStats[]> {
    const queryParams = this.buildQueryParams(filters || {});
    const response = await apiClient.get<ApiResponse<TypeStats[]>>(`/issues/type-stats${queryParams}`);
    return response.data.data;
  }

  // 获取需求创建趋势
  async fetchIssueCreationTrend(months: number = 12, filters?: FilterParams): Promise<CreationTrend[]> {
    const params = { months, ...filters };
    const queryParams = this.buildQueryParams(params);
    const response = await apiClient.get<ApiResponse<CreationTrend[]>>(`/issues/creation-trend${queryParams}`);
    return response.data.data;
  }

  // 获取需求解决时间统计
  async fetchIssueResolutionTimeStats(filters?: FilterParams): Promise<ResolutionTimeStats> {
    const queryParams = this.buildQueryParams(filters || {});
    const response = await apiClient.get<ApiResponse<ResolutionTimeStats>>(`/issues/resolution-time-stats${queryParams}`);
    return response.data.data;
  }

  // 获取项目统计
  async fetchProjectStats(filters?: FilterParams): Promise<ProjectStats[]> {
    const queryParams = this.buildQueryParams(filters || {});
    const response = await apiClient.get<ApiResponse<ProjectStats[]>>(`/projects/stats${queryParams}`);
    return response.data.data;
  }

  // 获取经办人工作量统计
  async fetchAssigneeWorkloadStats(filters?: FilterParams): Promise<AssigneeWorkload[]> {
    const queryParams = this.buildQueryParams(filters || {});
    const response = await apiClient.get<ApiResponse<AssigneeWorkload[]>>(`/assignees/workload-stats${queryParams}`);
    return response.data.data;
  }

  // 获取所有项目列表
  async getAllProjects(): Promise<ApiResponse<Project[]>> {
    const response = await apiClient.get<ApiResponse<Project[]>>('/projects/list');
    return response.data;
  }

  // 获取所有问题类型列表
  async getAllIssueTypes(): Promise<ApiResponse<IssueType[]>> {
    const response = await apiClient.get<ApiResponse<IssueType[]>>('/issues/types');
    return response.data;
  }

  // 获取所有设计人员列表
  async getAllAssignees(): Promise<ApiResponse<Assignee[]>> {
    const response = await apiClient.get<ApiResponse<Assignee[]>>('/assignees/list');
    return response.data;
  }

  // 获取需求历史变更统计
  async fetchIssueHistoryStats(filters?: FilterParams): Promise<HistoryStats[]> {
    const queryParams = this.buildQueryParams(filters || {});
    const response = await apiClient.get<ApiResponse<HistoryStats[]>>(`/issues/history-stats${queryParams}`);
    return response.data.data;
  }

  // 获取设计人员工作量统计
  async fetchDesignerWorkloadStats(filters?: FilterParams): Promise<DesignerWorkload[]> {
    const queryParams = this.buildQueryParams(filters || {});
    const response = await apiClient.get<ApiResponse<DesignerWorkload[]>>(`/designers/workload-stats${queryParams}`);
    return response.data.data;
  }

  // 获取设计人员工时统计
  async fetchDesignerWorkHoursStats(filters?: FilterParams): Promise<DesignerWorkHours[]> {
    const queryParams = this.buildQueryParams(filters || {});
    const response = await apiClient.get<ApiResponse<DesignerWorkHours[]>>(`/designers/workhours-stats${queryParams}`);
    return response.data.data;
  }

  // 健康检查
  async healthCheck(): Promise<any> {
    const response = await apiClient.get('/health');
    return response.data;
  }

  // 获取指定设计人员的详细issue信息
  async getDesignerIssueDetails(
    designerName: string,
    filters: FilterParams = {}
  ): Promise<DesignerIssueDetail[]> {
    const queryParams = this.buildQueryParams(filters || {});
    const response = await apiClient.get<ApiResponse<DesignerIssueDetail[]>>(`/designers/${encodeURIComponent(designerName)}/issues${queryParams}`);
    return response.data.data;
  }

  // 获取产品经理指标（单个设计师）
  async getProductManagerMetrics(
    designerName: string,
    filters: FilterParams = {}
  ): Promise<ProductManagerMetrics> {
    const queryParams = this.buildQueryParams(filters || {});
    const response = await apiClient.get<ApiResponse<ProductManagerMetrics>>(`/product-manager/metrics/${encodeURIComponent(designerName)}${queryParams}`);
    return response.data.data;
  }

  // 获取所有产品经理指标（批量）
  async getAllProductManagerMetrics(
    filters: FilterParams = {}
  ): Promise<ProductManagerMetrics[]> {
    const queryParams = this.buildQueryParams(filters || {});
    const response = await apiClient.get<ApiResponse<ProductManagerMetrics[]>>(`/product-manager/metrics${queryParams}`);
    return response.data.data;
  }

  // 获取指定设计人员的Reopen详细信息
  async getDesignerReopenDetails(
    designerName: string,
    filters: FilterParams = {}
  ): Promise<DesignerReopenDetail[]> {
    const queryParams = this.buildQueryParams(filters || {});
    const response = await apiClient.get<ApiResponse<DesignerReopenDetail[]>>(`/designers/${encodeURIComponent(designerName)}/reopen-details${queryParams}`);
    return response.data.data;
  }
}

export default new ApiService(); 