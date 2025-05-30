import React, { useState } from 'react';
import {
  Button,
  Menu,
  MenuItem,
  CircularProgress,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography
} from '@mui/material';
import {
  Print as PrintIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { DateTimeType } from './DateRangeSelector';

export type PrintDimension = 'all' | 'created' | 'resolutiondate' | 'duedate' | 'actualreleasedate';

interface PrintReportButtonProps {
  onPrint: (dimension: PrintDimension) => void;
  loading?: boolean;
}

const PrintReportButton: React.FC<PrintReportButtonProps> = ({
  onPrint,
  loading = false
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePrintOption = (dimension: PrintDimension) => {
    onPrint(dimension);
    handleClose();
  };

  const printOptions = [
    {
      key: 'all',
      label: '全部维度',
      description: '包含所有时间维度的完整报告',
      icon: <AssessmentIcon />,
      color: '#059669'
    },
    {
      key: 'created',
      label: '创建时间维度',
      description: '按Issue创建时间统计',
      icon: <CalendarIcon />,
      color: '#0284c7'
    },
    {
      key: 'resolutiondate',
      label: '设计完成时间维度', 
      description: '按设计完成时间统计',
      icon: <CheckIcon />,
      color: '#059669'
    },
    {
      key: 'duedate',
      label: '关闭时间维度',
      description: '按Issue关闭时间统计',
      icon: <CloseIcon />,
      color: '#dc2626'
    },
    {
      key: 'actualreleasedate',
      label: '实际发布日维度',
      description: '按实际发布日期统计',
      icon: <ScheduleIcon />,
      color: '#d97706'
    }
  ];

  return (
    <>
      <Button
        variant="outlined"
        startIcon={loading ? <CircularProgress size={16} /> : <PrintIcon />}
        onClick={handleClick}
        disabled={loading}
        sx={{
          borderColor: '#e2e8f0',
          color: '#475569',
          '&:hover': {
            borderColor: '#cbd5e1',
            backgroundColor: '#f8fafc'
          },
          '&:disabled': {
            borderColor: '#e2e8f0',
            color: '#94a3b8'
          }
        }}
      >
        {loading ? '生成中...' : '打印报告'}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            minWidth: 280,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            borderRadius: 2,
            mt: 1
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            px: 2,
            py: 1,
            color: '#64748b',
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}
        >
          选择打印维度
        </Typography>
        <Divider sx={{ mb: 1 }} />

        {printOptions.map((option, index) => (
          <MenuItem
            key={option.key}
            onClick={() => handlePrintOption(option.key as PrintDimension)}
            sx={{
              px: 2,
              py: 1.5,
              '&:hover': {
                backgroundColor: '#f8fafc'
              }
            }}
          >
            <ListItemIcon sx={{ color: option.color, minWidth: 36 }}>
              {option.icon}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 500,
                    color: '#1e293b',
                    fontSize: '0.875rem'
                  }}
                >
                  {option.label}
                </Typography>
              }
              secondary={
                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748b',
                    fontSize: '0.75rem',
                    lineHeight: 1.2,
                    mt: 0.5
                  }}
                >
                  {option.description}
                </Typography>
              }
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default PrintReportButton; 