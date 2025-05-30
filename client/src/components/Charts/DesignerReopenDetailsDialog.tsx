import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import { Close as CloseIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { DesignerReopenDetail } from '../../services/apiService';

interface DesignerReopenDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  designerName: string;
  totalReopenCount: number;
  reopenDetails: DesignerReopenDetail[];
  loading: boolean;
}

const DesignerReopenDetailsDialog: React.FC<DesignerReopenDetailsDialogProps> = ({
  open,
  onClose,
  designerName,
  totalReopenCount,
  reopenDetails,
  loading
}) => {

  // 状态颜色映射
  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('完成') || lowerStatus.includes('关闭') || lowerStatus.includes('done')) {
      return 'success';
    } else if (lowerStatus.includes('进行') || lowerStatus.includes('处理') || lowerStatus.includes('progress')) {
      return 'warning';
    } else if (lowerStatus.includes('待') || lowerStatus.includes('等待') || lowerStatus.includes('todo')) {
      return 'info';
    } else {
      return 'default';
    }
  };

  // 优先级颜色映射
  const getPriorityColor = (priority: string) => {
    const lowerPriority = priority.toLowerCase();
    if (lowerPriority.includes('高') || lowerPriority.includes('紧急') || lowerPriority.includes('critical') || lowerPriority.includes('high')) {
      return 'error';
    } else if (lowerPriority.includes('中') || lowerPriority.includes('medium')) {
      return 'warning';
    } else if (lowerPriority.includes('低') || lowerPriority.includes('low')) {
      return 'info';
    } else {
      return 'default';
    }
  };

  // Reopen次数颜色映射
  const getReopenColor = (count: number) => {
    if (count >= 5) {
      return 'error'; // 红色：非常高
    } else if (count >= 3) {
      return 'warning'; // 橙色：较高
    } else if (count >= 1) {
      return 'info'; // 蓝色：一般
    } else {
      return 'default'; // 默认
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '80vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6" component="div">
              {designerName} - Reopen详细信息
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              总Reopen次数: {totalReopenCount} 次 | 包含 {reopenDetails.length} 个Issue
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress size={40} sx={{ color: '#e11d48' }} />
          </Box>
        ) : reopenDetails.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <Typography variant="h6" color="textSecondary">
              暂无Reopen数据
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: 'calc(90vh - 200px)' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#f8fafc' }}>Issue Key</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#f8fafc' }}>标题</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#f8fafc' }}>项目</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#f8fafc' }}>类型</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#f8fafc' }}>状态</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#f8fafc' }}>优先级</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#f8fafc' }}>经办人</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#f8fafc' }}>Reopen次数</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#f8fafc' }}>创建时间</TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#f8fafc' }}>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reopenDetails.map((issue, index) => (
                  <TableRow key={issue.issue_id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="600" color="primary">
                        {issue.issue_key}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={issue.issue_title} arrow>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 300,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {issue.issue_title}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={issue.project_key || issue.project_name} 
                        size="small" 
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={issue.issue_type} 
                        size="small" 
                        color="info"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={issue.status} 
                        size="small" 
                        color={getStatusColor(issue.status) as any}
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={issue.priority} 
                        size="small" 
                        color={getPriorityColor(issue.priority) as any}
                        sx={{ fontSize: '0.75rem' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {issue.assignee || '未分配'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${issue.reopen_count} 次`}
                        size="small" 
                        color={getReopenColor(issue.reopen_count) as any}
                        sx={{ 
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {formatDate(issue.created_date)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title="在新窗口中打开Issue" arrow>
                        <IconButton 
                          size="small" 
                          onClick={() => {
                            // 使用Wall Tech JIRA的实际地址
                            window.open(`http://jira.walltechsystem.com/browse/${issue.issue_key}`, '_blank');
                          }}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" size="medium">
          关闭
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DesignerReopenDetailsDialog; 