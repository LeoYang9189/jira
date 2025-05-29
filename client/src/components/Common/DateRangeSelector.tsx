import React from 'react';
import {
  Stack,
  TextField,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { DateRange as DateRangeIcon, Schedule as ScheduleIcon } from '@mui/icons-material';

// 时间类型定义
export type DateTimeType = 'created' | 'completed_design' | 'closed' | 'actual_release';

export interface DateTimeTypeOption {
  value: DateTimeType;
  label: string;
  description: string;
}

export const DATE_TIME_TYPE_OPTIONS: DateTimeTypeOption[] = [
  { value: 'created', label: '创建时间', description: '问题创建的时间' },
  { value: 'completed_design', label: '完成时间(设计)', description: '设计完成的时间' },
  { value: 'closed', label: '关闭时间', description: '问题关闭的时间' },
  { value: 'actual_release', label: '实际发布日', description: '实际发布的日期' }
];

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
  dateTimeType: DateTimeType;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onDateTimeTypeChange: (type: DateTimeType) => void;
  disabled?: boolean;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  dateTimeType,
  onStartDateChange,
  onEndDateChange,
  onDateTimeTypeChange,
  disabled = false
}) => {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <ScheduleIcon sx={{ color: '#64748b', fontSize: 20 }} />
      
      {/* 时间类型选择 */}
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel id="datetime-type-label" sx={{ fontSize: '0.875rem' }}>时间类型</InputLabel>
        <Select
          labelId="datetime-type-label"
          value={dateTimeType}
          label="时间类型"
          onChange={(e) => onDateTimeTypeChange(e.target.value as DateTimeType)}
          disabled={disabled}
          sx={{
            fontSize: '0.875rem',
            backgroundColor: '#ffffff',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0284c7'
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#0284c7'
            }
          }}
        >
          {DATE_TIME_TYPE_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.875rem' }}>
              <Typography variant="body2">{option.label}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <DateRangeIcon sx={{ color: '#64748b', fontSize: 20 }} />
      
      {/* 日期范围选择 */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <TextField
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          size="small"
          disabled={disabled}
          sx={{
            width: 140,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
              backgroundColor: '#ffffff',
              fontSize: '0.875rem',
              '&:hover fieldset': {
                borderColor: '#0284c7'
              },
              '&.Mui-focused fieldset': {
                borderColor: '#0284c7'
              }
            },
            '& .MuiInputBase-input': {
              padding: '6px 8px'
            }
          }}
        />
        <Typography variant="body2" sx={{ color: '#64748b', minWidth: 20, textAlign: 'center' }}>
          ~
        </Typography>
        <TextField
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          size="small"
          disabled={disabled}
          sx={{
            width: 140,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
              backgroundColor: '#ffffff',
              fontSize: '0.875rem',
              '&:hover fieldset': {
                borderColor: '#0284c7'
              },
              '&.Mui-focused fieldset': {
                borderColor: '#0284c7'
              }
            },
            '& .MuiInputBase-input': {
              padding: '6px 8px'
            }
          }}
        />
      </Stack>
    </Stack>
  );
};

export default DateRangeSelector; 