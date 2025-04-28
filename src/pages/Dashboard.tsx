import { useState, useEffect } from 'react';
import { Typography, Paper, Grid, Card, CardContent, Box, Button } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import BuildIcon from '@mui/icons-material/Build';
import GroupIcon from '@mui/icons-material/Group';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useNavigate } from 'react-router-dom';
import { useSpaces } from '../context/SpaceContext';
import { useMCPTools } from '../context/MCPToolContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { spaces } = useSpaces();
  const { tools: mcpTools } = useMCPTools();
  const [totalConversations, setTotalConversations] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Calculate aggregate numbers
  useEffect(() => {
    // In a real app, this would be an API call or derived from context
    // For now, we'll use mock data
    let conversations = 0;
    let users = 0;
    
    spaces.forEach(space => {
      // Assume each space has some random number of conversations
      conversations += Math.floor(Math.random() * 40) + 10;
      // Count unique users
      users += space.users.length;
    });
    
    setTotalConversations(conversations);
    setTotalUsers(users);
  }, [spaces]);

  const handleNewChat = () => {
    navigate('/chat');
  };

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Dashboard</Typography>
        <Button variant="contained" color="primary" startIcon={<ChatIcon />} onClick={handleNewChat}>
          New Chat
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box display="flex" alignItems="center">
              <BuildIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
              <div>
                <Typography variant="body2">MCP Tools</Typography>
                <Typography variant="h4">{mcpTools.length}</Typography>
              </div>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box display="flex" alignItems="center">
              <GroupIcon color="secondary" sx={{ fontSize: 40, mr: 2 }} />
              <div>
                <Typography variant="body2">Team Spaces</Typography>
                <Typography variant="h4">{spaces.length}</Typography>
              </div>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box display="flex" alignItems="center">
              <ChatIcon color="info" sx={{ fontSize: 40, mr: 2 }} />
              <div>
                <Typography variant="body2">Total Conversations</Typography>
                <Typography variant="h4">{totalConversations}</Typography>
              </div>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box display="flex" alignItems="center">
              <AssessmentIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
              <div>
                <Typography variant="body2">Total Users</Typography>
                <Typography variant="h4">{totalUsers}</Typography>
              </div>
            </Box>
          </Paper>
        </Grid>
        
        {/* Spaces Overview */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>Team Spaces</Typography>
          <Grid container spacing={2}>
            {spaces.map((space) => (
              <Grid item xs={12} key={space.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{space.name}</Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      {space.description}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">Tools</Typography>
                        <Typography variant="body1">{space.tools.length}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">Users</Typography>
                        <Typography variant="body1">{space.users.length}</Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="textSecondary">Created</Typography>
                        <Typography variant="body1">{new Date().toLocaleDateString()}</Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
        
        {/* MCP Tools Overview */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>MCP Tools</Typography>
          <Grid container spacing={2}>
            {mcpTools.map((tool) => (
              <Grid item xs={12} sm={6} key={tool.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{tool.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Status: <span style={{ color: tool.status === 'active' ? 'green' : 'red' }}>{tool.status}</span>
                    </Typography>
                    <Typography variant="body2">
                      Used in: {tool.spaces.join(', ')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
