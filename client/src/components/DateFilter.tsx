import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Chip,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  SelectChangeEvent
} from '@mui/material';
import {
  DateRange,
  FilterAlt,
  Clear,
  Today,
  CalendarMonth
} from '@mui/icons-material';
import apiService, { FilterParams, IssueType, Project } from '../services/apiService';

interface FilterComponentProps {
  onFilterChange: (filter: FilterParams) => void;
  loading?: boolean;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 6 + ITEM_PADDING_TOP,
      width: 350,
    },
  },
};

const FilterComponent: React.FC<FilterComponentProps> = ({ onFilterChange, loading = false }) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedIssueTypes, setSelectedIssueTypes] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [issueTypes, setIssueTypes] = useState<IssueType[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [issueTypesLoading, setIssueTypesLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // 获取问题类型列表
  useEffect(() => {
    const fetchIssueTypes = async () => {
      try {
        setIssueTypesLoading(true);
        const response = await apiService.getAllIssueTypes();
        // 显示所有问题类型，包括没有数据的
        setIssueTypes(response.data);
      } catch (error) {
        console.error('获取问题类型失败:', error);
      } finally {
        setIssueTypesLoading(false);
      }
    };

    fetchIssueTypes();
  }, []);

  // 获取项目列表
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setProjectsLoading(true);
        const response = await apiService.getAllProjects();
        // 按项目名称排序
        const sortedProjects = response.data.sort((a, b) => a.project_name.localeCompare(b.project_name));
        setProjects(sortedProjects);
      } catch (error) {
        console.error('获取项目列表失败:', error);
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // 应用筛选
  const handleApplyFilter = () => {
    const filter: FilterParams = {};
    if (startDate) filter.startDate = startDate;
    if (endDate) filter.endDate = endDate;
    if (selectedIssueTypes.length > 0) filter.issueTypes = selectedIssueTypes;
    if (selectedProjects.length > 0) filter.projects = selectedProjects;
    onFilterChange(filter);
  };

  // 清除筛选
  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setSelectedIssueTypes([]);
    setSelectedProjects([]);
    onFilterChange({});
  };

  // 快速筛选选项
  const handleQuickFilter = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    setStartDate(startDateStr);
    setEndDate(endDateStr);
    
    const filter: FilterParams = {
      startDate: startDateStr,
      endDate: endDateStr
    };
    if (selectedIssueTypes.length > 0) {
      filter.issueTypes = selectedIssueTypes;
    }
    if (selectedProjects.length > 0) {
      filter.projects = selectedProjects;
    }
    
    onFilterChange(filter);
  };

  // 本月筛选
  const handleCurrentMonth = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const startDateStr = startOfMonth.toISOString().split('T')[0];
    const endDateStr = endOfMonth.toISOString().split('T')[0];
    
    setStartDate(startDateStr);
    setEndDate(endDateStr);
    
    const filter: FilterParams = {
      startDate: startDateStr,
      endDate: endDateStr
    };
    if (selectedIssueTypes.length > 0) {
      filter.issueTypes = selectedIssueTypes;
    }
    if (selectedProjects.length > 0) {
      filter.projects = selectedProjects;
    }
    
    onFilterChange(filter);
  };

  // 本年筛选
  const handleCurrentYear = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    
    const startDateStr = startOfYear.toISOString().split('T')[0];
    const endDateStr = endOfYear.toISOString().split('T')[0];
    
    setStartDate(startDateStr);
    setEndDate(endDateStr);
    
    const filter: FilterParams = {
      startDate: startDateStr,
      endDate: endDateStr
    };
    if (selectedIssueTypes.length > 0) {
      filter.issueTypes = selectedIssueTypes;
    }
    
    onFilterChange(filter);
  };

  // 处理问题类型选择
  const handleIssueTypeChange = (event: SelectChangeEvent<typeof selectedIssueTypes>) => {
    const value = event.target.value;
    const newSelectedTypes = typeof value === 'string' ? value.split(',') : value;
    setSelectedIssueTypes(newSelectedTypes);
    
    // 立即应用筛选
    const filter: FilterParams = {};
    if (startDate) filter.startDate = startDate;
    if (endDate) filter.endDate = endDate;
    if (newSelectedTypes.length > 0) filter.issueTypes = newSelectedTypes;
    if (selectedProjects.length > 0) filter.projects = selectedProjects;
    onFilterChange(filter);
  };

  // 处理开始日期变化
  const handleStartDateChange = (newStartDate: string) => {
    setStartDate(newStartDate);
    
    // 立即应用筛选
    const filter: FilterParams = {};
    if (newStartDate) filter.startDate = newStartDate;
    if (endDate) filter.endDate = endDate;
    if (selectedIssueTypes.length > 0) filter.issueTypes = selectedIssueTypes;
    if (selectedProjects.length > 0) filter.projects = selectedProjects;
    onFilterChange(filter);
  };

  // 处理结束日期变化
  const handleEndDateChange = (newEndDate: string) => {
    setEndDate(newEndDate);
    
    // 立即应用筛选
    const filter: FilterParams = {};
    if (startDate) filter.startDate = startDate;
    if (newEndDate) filter.endDate = newEndDate;
    if (selectedIssueTypes.length > 0) filter.issueTypes = selectedIssueTypes;
    if (selectedProjects.length > 0) filter.projects = selectedProjects;
    onFilterChange(filter);
  };

  // 处理项目选择
  const handleProjectChange = (event: SelectChangeEvent<typeof selectedProjects>) => {
    const value = event.target.value;
    const newSelectedProjects = typeof value === 'string' ? value.split(',') : value;
    setSelectedProjects(newSelectedProjects);
    
    // 立即应用筛选
    const filter: FilterParams = {};
    if (startDate) filter.startDate = startDate;
    if (endDate) filter.endDate = endDate;
    if (selectedIssueTypes.length > 0) filter.issueTypes = selectedIssueTypes;
    if (newSelectedProjects.length > 0) filter.projects = newSelectedProjects;
    onFilterChange(filter);
  };

  const hasFilter = startDate || endDate || selectedIssueTypes.length > 0 || selectedProjects.length > 0;

  // 获取选中问题类型的名称
  const getSelectedTypeNames = () => {
    return selectedIssueTypes
      .map(id => issueTypes.find(type => type.ID.toString() === id)?.issue_type)
      .filter(Boolean)
      .join(', ');
  };

  // 获取选中项目的名称
  const getSelectedProjectNames = () => {
    return selectedProjects
      .map(key => projects.find(project => project.project_key === key)?.project_name)
      .filter(Boolean)
      .join(', ');
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <DateRange sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="h2">
            数据筛选器
          </Typography>
          {hasFilter && (
            <Chip
              label="已筛选"
              size="small"
              color="primary"
              sx={{ ml: 2 }}
            />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          根据需求创建时间和问题类型筛选数据，筛选后所有图表数据将联动更新
        </Typography>

        {/* 快速时间筛选按钮 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            快速时间筛选：
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              icon={<Today />}
              label="最近7天"
              variant="outlined"
              clickable
              onClick={() => handleQuickFilter(7)}
              disabled={loading}
            />
            <Chip
              icon={<Today />}
              label="最近30天"
              variant="outlined"
              clickable
              onClick={() => handleQuickFilter(30)}
              disabled={loading}
            />
            <Chip
              icon={<Today />}
              label="最近90天"
              variant="outlined"
              clickable
              onClick={() => handleQuickFilter(90)}
              disabled={loading}
            />
            <Chip
              icon={<CalendarMonth />}
              label="本月"
              variant="outlined"
              clickable
              onClick={handleCurrentMonth}
              disabled={loading}
            />
            <Chip
              icon={<CalendarMonth />}
              label="本年"
              variant="outlined"
              clickable
              onClick={handleCurrentYear}
              disabled={loading}
            />
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 自定义筛选 */}
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            自定义筛选：
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
            gap: 2,
            mb: 2
          }}>
            <TextField
              label="开始日期"
              type="date"
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              disabled={loading}
            />
            
            <TextField
              label="结束日期"
              type="date"
              value={endDate}
              onChange={(e) => handleEndDateChange(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              disabled={loading}
              inputProps={{
                min: startDate || undefined
              }}
            />

            <FormControl size="small" disabled={loading || issueTypesLoading}>
              <InputLabel>问题类型 ({issueTypes.length}种)</InputLabel>
              <Select
                multiple
                value={selectedIssueTypes}
                onChange={handleIssueTypeChange}
                input={<OutlinedInput label={`问题类型 (${issueTypes.length}种)`} />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        请选择问题类型
                      </Typography>
                    )}
                    {selected.slice(0, 3).map((value) => {
                      const type = issueTypes.find(t => t.ID.toString() === value);
                      return (
                        <Chip
                          key={value}
                          label={type?.issue_type || value}
                          size="small"
                          variant="outlined"
                        />
                      );
                    })}
                    {selected.length > 3 && (
                      <Chip
                        label={`+${selected.length - 3}个`}
                        size="small"
                        color="primary"
                      />
                    )}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {issueTypes.map((type) => (
                  <MenuItem key={type.ID} value={type.ID.toString()}>
                    <Checkbox 
                      checked={selectedIssueTypes.indexOf(type.ID.toString()) > -1}
                      size="small"
                    />
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <Typography variant="body2" sx={{ fontWeight: type.count > 0 ? 'medium' : 'normal' }}>
                            {type.issue_type}
                          </Typography>
                          <Chip
                            label={type.count.toLocaleString()}
                            size="small"
                            variant="outlined"
                            color={type.count > 0 ? 'primary' : 'default'}
                            sx={{ ml: 1, minWidth: 60 }}
                          />
                        </Box>
                      }
                      secondary={type.DESCRIPTION && type.DESCRIPTION.length > 0 ? (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {type.DESCRIPTION.length > 50 ? `${type.DESCRIPTION.substring(0, 50)}...` : type.DESCRIPTION}
                        </Typography>
                      ) : null}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" disabled={loading || projectsLoading}>
              <InputLabel>项目 ({projects.length}个)</InputLabel>
              <Select
                multiple
                value={selectedProjects}
                onChange={handleProjectChange}
                input={<OutlinedInput label={`项目 (${projects.length}个)`} />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        请选择项目
                      </Typography>
                    )}
                    {selected.slice(0, 2).map((value) => {
                      const project = projects.find(p => p.project_key === value);
                      return (
                        <Chip
                          key={value}
                          label={project?.project_key || value}
                          size="small"
                          variant="outlined"
                        />
                      );
                    })}
                    {selected.length > 2 && (
                      <Chip
                        label={`+${selected.length - 2}个`}
                        size="small"
                        color="primary"
                      />
                    )}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {projects.map((project) => (
                  <MenuItem key={project.ID} value={project.project_key}>
                    <Checkbox 
                      checked={selectedProjects.indexOf(project.project_key) > -1}
                      size="small"
                    />
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {project.project_name}
                          </Typography>
                          <Chip
                            label={project.project_key}
                            size="small"
                            variant="outlined"
                            color="secondary"
                            sx={{ ml: 1, minWidth: 60 }}
                          />
                        </Box>
                      }
                      secondary={project.DESCRIPTION && project.DESCRIPTION.length > 0 ? (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {project.DESCRIPTION.length > 50 ? `${project.DESCRIPTION.substring(0, 50)}...` : project.DESCRIPTION}
                        </Typography>
                      ) : null}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ 
            display: 'flex',
            gap: 2,
            justifyContent: 'flex-end'
          }}>
            <Button
              variant="contained"
              startIcon={<FilterAlt />}
              onClick={handleApplyFilter}
              disabled={loading}
            >
              应用筛选
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Clear />}
              onClick={handleClearFilter}
              disabled={loading || !hasFilter}
            >
              清除筛选
            </Button>
          </Box>
        </Box>

        {/* 当前筛选状态显示 */}
        {hasFilter && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
            <Typography variant="body2" color="primary.main">
              <strong>当前筛选：</strong>
              {startDate && ` 从 ${startDate}`}
              {endDate && ` 到 ${endDate}`}
              {startDate && endDate && ' 的需求数据'}
              {startDate && !endDate && ' 之后的需求数据'}
              {!startDate && endDate && ' 之前的需求数据'}
              {selectedIssueTypes.length > 0 && (
                <>
                  {(startDate || endDate) && '，'}
                  问题类型：{selectedIssueTypes.length}种 ({getSelectedTypeNames()})
                </>
              )}
              {selectedProjects.length > 0 && (
                <>
                  {(startDate || endDate || selectedIssueTypes.length > 0) && '，'}
                  项目：{selectedProjects.length}个 ({getSelectedProjectNames()})
                </>
              )}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FilterComponent; 