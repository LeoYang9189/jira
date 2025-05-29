import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  TextField,
  InputAdornment,
  TablePagination,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import CodeIcon from '@mui/icons-material/Code';
import PersonIcon from '@mui/icons-material/Person';
import apiService, { Project } from '../services/apiService';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    // 过滤项目
    const filtered = projects.filter(project =>
      project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.project_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.project_lead && project.project_lead.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredProjects(filtered);
    setPage(0); // 重置到第一页
  }, [searchTerm, projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllProjects();
      setProjects(response.data);
      setFilteredProjects(response.data);
    } catch (error) {
      console.error('获取项目列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProjectTypeIcon = (type: string) => {
    switch (type) {
      case 'software':
        return <CodeIcon fontSize="small" />;
      case 'business':
        return <BusinessIcon fontSize="small" />;
      default:
        return <BusinessIcon fontSize="small" />;
    }
  };

  const getProjectTypeColor = (type: string) => {
    switch (type) {
      case 'software':
        return 'primary';
      case 'business':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedProjects = filteredProjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>加载中...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" component="h2">
            项目列表 ({filteredProjects.length} 个项目)
          </Typography>
          <TextField
            size="small"
            placeholder="搜索项目名称、键值或负责人..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300 }}
          />
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>项目名称</TableCell>
                <TableCell>项目键值</TableCell>
                <TableCell>项目类型</TableCell>
                <TableCell>负责人</TableCell>
                <TableCell>描述</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProjects.map((project) => (
                <TableRow key={project.ID} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {project.project_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ID: {project.ID}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={project.project_key}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getProjectTypeIcon(project.project_type)}
                      label={project.project_type === 'software' ? '软件项目' : '业务项目'}
                      size="small"
                      color={getProjectTypeColor(project.project_type) as any}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {project.project_lead ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {project.project_lead}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        未分配
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title={project.DESCRIPTION || '无描述'}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {project.DESCRIPTION || '无描述'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredProjects.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="每页显示:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} 共 ${count} 条`}
        />
      </CardContent>
    </Card>
  );
};

export default ProjectList; 