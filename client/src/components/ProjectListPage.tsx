import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import ProjectList from './ProjectList';

const ProjectListPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          项目管理
        </Typography>
        <Typography variant="body1" color="text.secondary">
          查看和管理所有JIRA项目信息
        </Typography>
      </Box>
      
      <ProjectList />
    </Container>
  );
};

export default ProjectListPage; 