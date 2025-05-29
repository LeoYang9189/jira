import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Card,
  Stack,
  IconButton,
  Tooltip,
  Badge,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Fade,
  Zoom
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Category as CategoryIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import apiService, { FilterParams, IssueType, Project, Assignee } from '../../services/apiService';

interface FilterSidebarProps {
  open: boolean;
  onClose: () => void;
  onFilterChange: (filters: FilterParams) => void;
  loading?: boolean;
  cwProjectsOnly?: boolean;
  cwProjectIds?: string[];
  requirementTypesOnly?: boolean;
  requirementTypeIds?: string[];
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  open,
  onClose,
  onFilterChange,
  loading = false,
  cwProjectsOnly,
  cwProjectIds,
  requirementTypesOnly,
  requirementTypeIds
}) => {
  // 筛选状态 - 移除日期筛选，已移到Header中
  const [selectedIssueTypes, setSelectedIssueTypes] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);

  // 数据状态
  const [issueTypes, setIssueTypes] = useState<IssueType[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [dataLoading, setDataLoading] = useState({
    issueTypes: true,
    projects: true,
    assignees: true
  });

  // Accordion展开状态 - 移除date，默认展开issueTypes
  const [expandedPanels, setExpandedPanels] = useState<string[]>(['issueTypes']);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [issueTypesRes, projectsRes, assigneesRes] = await Promise.all([
          apiService.getAllIssueTypes(),
          apiService.getAllProjects(),
          apiService.getAllAssignees()
        ]);

        // 根据需求类型模式筛选问题类型
        let filteredIssueTypes = issueTypesRes.data;
        if (requirementTypesOnly && requirementTypeIds) {
          filteredIssueTypes = issueTypesRes.data.filter(issueType => 
            requirementTypeIds.includes(issueType.ID.toString())
          );
        }
        setIssueTypes(filteredIssueTypes);
        
        // 根据CW模式筛选项目
        let filteredProjects = projectsRes.data;
        if (cwProjectsOnly && cwProjectIds) {
          filteredProjects = projectsRes.data.filter(project => 
            cwProjectIds.includes(project.project_key)
          );
        }
        setProjects(filteredProjects);
        
        setAssignees(assigneesRes.data);
      } catch (error) {
        console.error('获取筛选器数据失败:', error);
      } finally {
        setDataLoading({
          issueTypes: false,
          projects: false,
          assignees: false
        });
      }
    };

    fetchData();
  }, [cwProjectsOnly, cwProjectIds, requirementTypesOnly, requirementTypeIds]);

  const buildFilters = (): FilterParams => {
    const filters: FilterParams = {};
    
    if (selectedIssueTypes.length > 0) filters.issueTypes = selectedIssueTypes;
    if (selectedProjects.length > 0) filters.projects = selectedProjects;
    if (selectedAssignees.length > 0) filters.assignees = selectedAssignees;
    
    return filters;
  };

  const applyFilters = () => {
    const filters = buildFilters();
    onFilterChange(filters);
  };

  const resetFilters = () => {
    setSelectedIssueTypes([]);
    setSelectedProjects([]);
    setSelectedAssignees([]);
    onFilterChange({});
  };

  const getActiveFiltersCount = () => {
    return (
      selectedIssueTypes.length +
      selectedProjects.length +
      selectedAssignees.length
    );
  };

  const handleAccordionChange = (panel: string) => {
    setExpandedPanels(prev => 
      prev.includes(panel) 
        ? prev.filter(p => p !== panel)
        : [...prev, panel]
    );
  };

  useEffect(() => {
    const delayedApplyFilters = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => clearTimeout(delayedApplyFilters);
  }, [selectedIssueTypes, selectedProjects, selectedAssignees]);

  const drawerContent = (
    <Box
      sx={{
        width: 380,
        height: '100%',
        background: '#ffffff',
        overflow: 'hidden',
        borderRight: '1px solid #e2e8f0'
      }}
    >
      {/* 头部 */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          background: '#f8fafc',
          color: '#1e293b',
          borderRadius: 0,
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <FilterListIcon sx={{ fontSize: 28, color: '#0284c7' }} />
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e293b' }}>
                数据筛选器
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                自定义数据视图
              </Typography>
            </Box>
          </Stack>
          
          <Stack direction="row" spacing={1}>
            {getActiveFiltersCount() > 0 && (
              <Zoom in={true}>
                <Badge badgeContent={getActiveFiltersCount()} sx={{ 
                  '& .MuiBadge-badge': { 
                    backgroundColor: '#0284c7', 
                    color: '#ffffff' 
                  } 
                }}>
                  <Box sx={{ width: 24, height: 24 }} />
                </Badge>
              </Zoom>
            )}
            <IconButton
              onClick={onClose}
              sx={{ 
                color: '#64748b', 
                '&:hover': { 
                  backgroundColor: '#e2e8f0',
                  color: '#0284c7'
                } 
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>

      {/* 筛选内容 */}
      <Box sx={{ p: 2, height: 'calc(100% - 120px)', overflow: 'auto' }}>
        <Stack spacing={2}>
          
          {/* 问题类型筛选 */}
          <Accordion
            expanded={expandedPanels.includes('issueTypes')}
            onChange={() => handleAccordionChange('issueTypes')}
            sx={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 1,
              '&:before': { display: 'none' },
              boxShadow: 'none'
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#64748b' }} />}
              sx={{
                background: '#fef3c7',
                color: '#1e293b',
                borderRadius: '4px 4px 0 0',
                minHeight: 48,
                '&.Mui-expanded': {
                  minHeight: 48
                }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <CategoryIcon sx={{ color: '#d97706' }} />
                <Typography fontWeight="600" sx={{ color: '#1e293b' }}>问题类型</Typography>
                {selectedIssueTypes.length > 0 && (
                  <Badge badgeContent={selectedIssueTypes.length} sx={{ 
                    '& .MuiBadge-badge': { 
                      backgroundColor: '#d97706', 
                      color: '#ffffff' 
                    } 
                  }} />
                )}
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2 }}>
              {dataLoading.issueTypes ? (
                <Box textAlign="center" py={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <>
                  {requirementTypesOnly && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#d97706', 
                        fontWeight: 600,
                        display: 'block',
                        mb: 1,
                        p: 1,
                        backgroundColor: '#fef3c7',
                        borderRadius: 1,
                        border: '1px solid #fbbf24'
                      }}
                    >
                      🔒 当前仅显示需求相关类型
                    </Typography>
                  )}
                  <FormControl fullWidth size="small">
                    <InputLabel>选择问题类型</InputLabel>
                    <Select
                      multiple
                      value={selectedIssueTypes}
                      onChange={(e) => setSelectedIssueTypes(e.target.value as string[])}
                      label="选择问题类型"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const issueType = issueTypes.find(type => type.ID.toString() === value);
                            return (
                              <Chip
                                key={value}
                                label={issueType?.issue_type}
                                size="small"
                                sx={{
                                  backgroundColor: '#fef3c7',
                                  color: '#d97706',
                                  border: '1px solid #fbbf24',
                                  fontWeight: 500
                                }}
                              />
                            );
                          })}
                        </Box>
                      )}
                      sx={{ borderRadius: 1 }}
                    >
                      {issueTypes.map((type) => (
                        <MenuItem key={type.ID} value={type.ID.toString()}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <Typography>{type.issue_type}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              ({type.count})
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}
            </AccordionDetails>
          </Accordion>

          {/* 项目筛选 */}
          <Accordion
            expanded={expandedPanels.includes('projects')}
            onChange={() => handleAccordionChange('projects')}
            sx={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 1,
              '&:before': { display: 'none' },
              boxShadow: 'none'
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#64748b' }} />}
              sx={{
                background: '#dcfce7',
                color: '#1e293b',
                borderRadius: '4px 4px 0 0',
                minHeight: 48,
                '&.Mui-expanded': {
                  minHeight: 48
                }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <BusinessIcon sx={{ color: '#059669' }} />
                <Typography fontWeight="600" sx={{ color: '#1e293b' }}>项目</Typography>
                {selectedProjects.length > 0 && (
                  <Badge badgeContent={selectedProjects.length} sx={{ 
                    '& .MuiBadge-badge': { 
                      backgroundColor: '#059669', 
                      color: '#ffffff' 
                    } 
                  }} />
                )}
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2 }}>
              {dataLoading.projects ? (
                <Box textAlign="center" py={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <>
                  {cwProjectsOnly && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#059669', 
                        fontWeight: 600,
                        display: 'block',
                        mb: 1,
                        p: 1,
                        backgroundColor: '#dcfce7',
                        borderRadius: 1,
                        border: '1px solid #10b981'
                      }}
                    >
                      🔒 当前仅显示CW关联项目
                    </Typography>
                  )}
                  <FormControl fullWidth size="small">
                    <InputLabel>选择项目</InputLabel>
                    <Select
                      multiple
                      value={selectedProjects}
                      onChange={(e) => setSelectedProjects(e.target.value as string[])}
                      label="选择项目"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const project = projects.find(proj => proj.project_key === value);
                            return (
                              <Chip
                                key={value}
                                label={project?.project_name || value}
                                size="small"
                                sx={{
                                  backgroundColor: '#dcfce7',
                                  color: '#059669',
                                  border: '1px solid #10b981',
                                  fontWeight: 500
                                }}
                              />
                            );
                          })}
                        </Box>
                      )}
                      sx={{ borderRadius: 1 }}
                    >
                      {projects.map((project) => (
                        <MenuItem key={project.project_key} value={project.project_key}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <Typography>{project.project_name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              ({project.project_key})
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}
            </AccordionDetails>
          </Accordion>

          {/* 设计人员筛选 */}
          <Accordion
            expanded={expandedPanels.includes('assignees')}
            onChange={() => handleAccordionChange('assignees')}
            sx={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 1,
              '&:before': { display: 'none' },
              boxShadow: 'none'
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#64748b' }} />}
              sx={{
                background: '#f3e8ff',
                color: '#1e293b',
                borderRadius: '4px 4px 0 0',
                minHeight: 48,
                '&.Mui-expanded': {
                  minHeight: 48
                }
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <PersonIcon sx={{ color: '#7c3aed' }} />
                <Typography fontWeight="600" sx={{ color: '#1e293b' }}>设计人员</Typography>
                {selectedAssignees.length > 0 && (
                  <Badge badgeContent={selectedAssignees.length} sx={{ 
                    '& .MuiBadge-badge': { 
                      backgroundColor: '#7c3aed', 
                      color: '#ffffff' 
                    } 
                  }} />
                )}
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2 }}>
              {dataLoading.assignees ? (
                <Box textAlign="center" py={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <FormControl fullWidth size="small">
                  <InputLabel>选择设计人员</InputLabel>
                  <Select
                    multiple
                    value={selectedAssignees}
                    onChange={(e) => setSelectedAssignees(e.target.value as string[])}
                    label="选择设计人员"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const assignee = assignees.find(ass => ass.assignee_username === value);
                          return (
                            <Chip
                              key={value}
                              label={assignee?.assignee_display_name || assignee?.assignee_username}
                              size="small"
                              sx={{
                                backgroundColor: '#f3e8ff',
                                color: '#7c3aed',
                                border: '1px solid #a855f7',
                                fontWeight: 500
                              }}
                            />
                          );
                        })}
                      </Box>
                    )}
                    sx={{ borderRadius: 1 }}
                  >
                    {assignees.map((assignee) => (
                      <MenuItem key={assignee.assignee_username} value={assignee.assignee_username}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <Typography>
                            {assignee.assignee_display_name || assignee.assignee_username}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ({assignee.assigned_issues_count})
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </AccordionDetails>
          </Accordion>
          
        </Stack>
      </Box>

      {/* 底部操作按钮 */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          background: '#f8fafc',
          borderRadius: 0,
          borderTop: '1px solid #e2e8f0'
        }}
      >
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={applyFilters}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
            sx={{
              flex: 1,
              background: '#0284c7',
              borderRadius: 1,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: '#0369a1'
              }
            }}
          >
            {loading ? '应用中...' : '立即应用'}
          </Button>
          <Button
            variant="outlined"
            onClick={resetFilters}
            startIcon={<ClearIcon />}
            sx={{
              flex: 1,
              borderRadius: 1,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#e2e8f0',
              color: '#64748b',
              '&:hover': {
                borderColor: '#0284c7',
                backgroundColor: '#f8fafc',
                color: '#0284c7'
              }
            }}
          >
            重置全部
          </Button>
        </Stack>
      </Paper>
    </Box>
  );

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          background: 'transparent',
          boxShadow: 'none'
        }
      }}
    >
      <Fade in={open} timeout={300}>
        <div>{drawerContent}</div>
      </Fade>
    </Drawer>
  );
};

export default FilterSidebar; 