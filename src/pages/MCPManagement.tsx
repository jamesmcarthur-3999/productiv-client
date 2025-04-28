import { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  OutlinedInput,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Alert,
  FormControlLabel,
  Switch,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import GitHubIcon from '@mui/icons-material/GitHub';
import StorageIcon from '@mui/icons-material/Storage';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useMCPTools } from '../context/MCPToolContext';
import { useSpaces } from '../context/SpaceContext';
import githubService from '../services/github';
import mcpManager from '../services/mcpManager';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`mcp-tabpanel-${index}`}
      aria-labelledby={`mcp-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface HealthCheckResult {
  id: number;
  name: string;
  healthy: boolean | null;
  error?: any;
  status?: string;
}

const MCPManagement = () => {
  const { tools: mcpTools, installTool, uninstallTool, updateToolStatus, updateToolConfig, updateToolSpaces, isLoading, error } = useMCPTools();
  const { spaces } = useSpaces();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [healthCheckLoading, setHealthCheckLoading] = useState(false);
  const [healthCheckResults, setHealthCheckResults] = useState<HealthCheckResult[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [editingTool, setEditingTool] = useState<any | null>(null);
  const [availableMCPTools, setAvailableMCPTools] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    source: 'github',
    sourceUrl: '',
    spaces: [] as string[],
    config: {} as Record<string, string>,
  });
  const [installationStatus, setInstallationStatus] = useState<{
    show: boolean;
    success?: boolean;
    message: string;
  }>({
    show: false,
    message: '',
  });

  // Load available MCP tools from GitHub
  useEffect(() => {
    const loadAvailableTools = async () => {
      try {
        setLoading(true);
        
        // Attempt to fetch from GitHub API
        try {
          // You would replace this with a call to the GitHub API to fetch the 
          // modelcontextprotocol/servers repository contents
          const repoContents = await githubService.getRepositoryContents(
            'modelcontextprotocol', 
            'servers', 
            'src'
          );
          
          // Map repository contents to available tools
          if (Array.isArray(repoContents)) {
            const serverTools = repoContents
              .filter((item: any) => item.type === 'dir')
              .map((dir: any) => ({
                name: dir.name.charAt(0).toUpperCase() + dir.name.slice(1).replace(/-/g, ' '),
                description: `Official MCP server for ${dir.name}`,
                source: 'github',
                sourceUrl: `https://github.com/modelcontextprotocol/servers/tree/main/src/${dir.name}`,
                official: true,
                category: 'Official',
              }));
            
            setAvailableMCPTools(serverTools);
          }
        } catch (error) {
          console.error('Error fetching from GitHub, using local data:', error);
          // Fallback to static data if GitHub API fails
          const staticTools = [
            {
              name: 'Postgres Database',
              description: 'Read-only database access with schema inspection capabilities',
              source: 'github',
              sourceUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres',
              official: true,
              category: 'Database',
            },
            {
              name: 'Brave Search',
              description: 'Web and local search using Brave\'s Search API',
              source: 'github',
              sourceUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search',
              official: true,
              category: 'Search',
            },
            {
              name: 'Google Drive',
              description: 'File access and search capabilities for Google Drive',
              source: 'github',
              sourceUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive',
              official: true,
              category: 'File Storage',
            },
            {
              name: 'Filesystem',
              description: 'Secure file operations with configurable access controls',
              source: 'github',
              sourceUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
              official: true,
              category: 'File Storage',
            },
            {
              name: 'Slack',
              description: 'Channel management and messaging capabilities',
              source: 'github',
              sourceUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/slack',
              official: true,
              category: 'Communications',
            },
            {
              name: 'GitHub',
              description: 'Repository management, file operations, and GitHub API integration',
              source: 'github',
              sourceUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
              official: true,
              category: 'Development',
            },
            {
              name: 'Memory',
              description: 'Knowledge graph-based persistent memory system',
              source: 'github',
              sourceUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/memory',
              official: true,
              category: 'AI Utility',
            },
            {
              name: 'Time',
              description: 'Time and timezone conversion capabilities',
              source: 'github',
              sourceUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/time',
              official: true,
              category: 'Utility',
            },
          ];
          
          setAvailableMCPTools(staticTools);
        }
      } catch (err) {
        console.error('Error loading available MCP tools:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAvailableTools();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (tool?: any) => {
    if (tool) {
      setEditingTool(tool);
      setFormData({
        name: tool.name,
        description: tool.description,
        source: tool.source,
        sourceUrl: tool.sourceUrl || '',
        spaces: [...(tool.spaces || [])],
        config: tool.config ? { ...tool.config } : {},
      });
    } else {
      setEditingTool(null);
      setFormData({
        name: '',
        description: '',
        source: 'github',
        sourceUrl: '',
        spaces: [],
        config: {},
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setInstallationStatus({ show: false, message: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string[]>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: typeof value === 'string' ? [value] : value }));
  };

  const handleSourceTypeChange = (e: SelectChangeEvent) => {
    setFormData((prev) => ({ ...prev, source: e.target.value }));
  };

  const handleConfigChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value,
      },
    }));
  };

  const handleAddConfigField = () => {
    setFormData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [`KEY_${Object.keys(prev.config).length + 1}`]: '',
      },
    }));
  };

  const handleRemoveConfigField = (key: string) => {
    const newConfig = { ...formData.config };
    delete newConfig[key];
    setFormData((prev) => ({ ...prev, config: newConfig }));
  };

  const handleSaveTool = async () => {
    setLoading(true);
    try {
      if (editingTool && editingTool.id) {
        // Update existing tool
        if (formData.spaces.length > 0) {
          await updateToolSpaces(editingTool.id, formData.spaces);
        }
        if (Object.keys(formData.config).length > 0) {
          await updateToolConfig(editingTool.id, formData.config);
        }
        setInstallationStatus({
          show: true,
          success: true,
          message: 'MCP tool updated successfully!',
        });
      } else {
        // Install new tool
        await installTool(formData.sourceUrl, {
          name: formData.name,
          spaces: formData.spaces,
          config: formData.config,
        });
        setInstallationStatus({
          show: true,
          success: true,
          message: 'MCP tool installed successfully!',
        });
      }
    } catch (err) {
      console.error('Error saving MCP tool:', err);
      setInstallationStatus({
        show: true,
        success: false,
        message: `Error: ${err instanceof Error ? err.message : 'Unknown error occurred'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTool = async (id: number) => {
    try {
      setLoading(true);
      await uninstallTool(id);
      setLoading(false);
    } catch (err) {
      console.error('Error deleting MCP tool:', err);
      setLoading(false);
    }
  };

  const handleToolStatusToggle = async (id: number, currentStatus: 'active' | 'inactive' | 'error') => {
    try {
      await updateToolStatus(id, currentStatus === 'active' ? 'inactive' : 'active');
    } catch (err) {
      console.error('Error toggling MCP tool status:', err);
    }
  };

  const handleRunHealthCheck = async () => {
    setHealthCheckLoading(true);
    try {
      const results = await mcpManager.checkToolsHealth();
      setHealthCheckResults(results);
    } catch (error) {
      console.error('Error running health check:', error);
    } finally {
      setHealthCheckLoading(false);
    }
  };

  const getHealthCheckStatus = (results: HealthCheckResult[]) => {
    if (results.length === 0) return { total: 0, healthy: 0, percentage: 0 };
    
    const activeTools = results.filter(r => r.healthy !== null);
    const healthyTools = results.filter(r => r.healthy === true);
    
    return {
      total: activeTools.length,
      healthy: healthyTools.length,
      percentage: activeTools.length > 0 ? Math.round((healthyTools.length / activeTools.length) * 100) : 0
    };
  };

  const healthStatus = getHealthCheckStatus(healthCheckResults);

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">MCP Tool Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add MCP Tool
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {healthCheckResults.length > 0 && (
        <Box mb={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <HealthAndSafetyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">MCP Tool Health</Typography>
                <Box ml="auto">
                  <Chip 
                    label={`${healthStatus.healthy}/${healthStatus.total} Tools Healthy (${healthStatus.percentage}%)`}
                    color={healthStatus.percentage === 100 ? "success" : healthStatus.percentage > 50 ? "warning" : "error"}
                  />
                </Box>
              </Box>
              
              <LinearProgress 
                variant="determinate" 
                value={healthStatus.percentage} 
                color={healthStatus.percentage === 100 ? "success" : healthStatus.percentage > 50 ? "warning" : "error"}
                sx={{ mb: 2, height: 10, borderRadius: 5 }}
              />
              
              <Grid container spacing={1}>
                {healthCheckResults.map((result) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={result.id}>
                    <Chip
                      icon={result.healthy === true ? <CheckCircleOutlineIcon /> : 
                            result.healthy === false ? <ErrorOutlineIcon /> : null}
                      label={result.name}
                      color={result.healthy === true ? "success" : 
                             result.healthy === false ? "error" : "default"}
                      variant="outlined"
                      sx={{ width: '100%', justifyContent: 'flex-start' }}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
            <CardActions>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={handleRunHealthCheck}
                disabled={healthCheckLoading}
                startIcon={healthCheckLoading ? <CircularProgress size={18} /> : <RefreshIcon />}
              >
                Refresh Health Check
              </Button>
            </CardActions>
          </Card>
        </Box>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Installed Tools" />
          <Tab label="Available Tools" />
          <Tab label="Settings" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={healthCheckLoading ? <CircularProgress size={18} /> : <HealthAndSafetyIcon />}
              onClick={handleRunHealthCheck}
              disabled={healthCheckLoading || mcpTools.length === 0}
            >
              Run Health Check
            </Button>
          </Box>

          {isLoading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : mcpTools.length === 0 ? (
            <Box p={4} textAlign="center">
              <Typography variant="h6" color="textSecondary" gutterBottom>
                No MCP tools installed
              </Typography>
              <Typography variant="body1" color="textSecondary" paragraph>
                Install tools from the "Available Tools" tab or by clicking the "Add MCP Tool" button.
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setTabValue(1)}
                startIcon={<AddIcon />}
              >
                Browse Available Tools
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {mcpTools.map((tool) => (
                <Grid item xs={12} md={6} lg={4} key={tool.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="h6">{tool.name}</Typography>
                        <Box>
                          {tool.status === 'active' ? (
                            <Chip
                              icon={<CheckCircleOutlineIcon />}
                              label="Active"
                              size="small"
                              color="success"
                            />
                          ) : tool.status === 'error' ? (
                            <Chip
                              icon={<ErrorOutlineIcon />}
                              label="Error"
                              size="small"
                              color="error"
                            />
                          ) : (
                            <Chip label="Inactive" size="small" color="default" />
                          )}
                        </Box>
                      </Box>

                      <Typography variant="body2" color="textSecondary" paragraph>
                        {tool.description}
                      </Typography>

                      <Box mb={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          Source: {tool.source === 'github' ? 'GitHub' : 'Local'}
                        </Typography>
                        {tool.sourceUrl && (
                          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                            {tool.sourceUrl}
                          </Typography>
                        )}
                      </Box>

                      <Typography variant="subtitle2" gutterBottom>
                        Assigned to Spaces:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                        {tool.spaces.length > 0 ? (
                          tool.spaces.map((space: string) => (
                            <Chip key={space} label={space} size="small" />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Not assigned to any spaces
                          </Typography>
                        )}
                      </Box>
                      
                      {tool.processId && (
                        <Box mt={2}>
                          <Chip 
                            icon={<StorageIcon />} 
                            label={`Process ID: ${tool.processId}`} 
                            size="small" 
                            color="info" 
                            variant="outlined"
                          />
                        </Box>
                      )}
                    </CardContent>
                    <CardActions>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={tool.status === 'active'}
                            onChange={() => handleToolStatusToggle(tool.id, tool.status)}
                            color="primary"
                          />
                        }
                        label={tool.status === 'active' ? 'Enabled' : 'Disabled'}
                      />
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(tool)}
                      >
                        Configure
                      </Button>
                      <IconButton 
                        color="error" 
                        size="small" 
                        onClick={() => handleDeleteTool(tool.id)}
                        aria-label="delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Browse and install MCP tools from our catalog or GitHub repositories.
          </Alert>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {availableMCPTools.map((tool, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {tool.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" paragraph>
                        {tool.description}
                      </Typography>
                      <Box display="flex" alignItems="center" mb={1}>
                        <GitHubIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                          {tool.sourceUrl.split('/').slice(3).join('/')}
                        </Typography>
                      </Box>
                      {tool.official && <Chip label="Official" size="small" color="primary" sx={{ mr: 1 }} />}
                      {tool.category && <Chip label={tool.category} size="small" />}
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => handleOpenDialog(tool)}
                      >
                        Install
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              MCP Server Configuration
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Configure global settings for the MCP tool management system, including SSH keys, default installation paths, and logging options.
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Default MCP Server Path"
                  defaultValue="/usr/local/bin/mcp-servers/"
                  helperText="Base directory for MCP server installations"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SSH Key Path"
                  defaultValue="/Users/jamesmcarthur/Documents/SSH Keys"
                  helperText="Path to SSH keys for remote deployments"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Enable detailed logging"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Automatically check for updates"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch />}
                  label="Require authentication for each MCP tool"
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" color="primary">
                  Save Settings
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </TabPanel>
      </Paper>

      {/* MCP Tool Installation/Configuration Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTool && editingTool.id ? 'Edit MCP Tool' : 'Install MCP Tool'}
        </DialogTitle>
        <DialogContent dividers>
          {installationStatus.show && (
            <Alert
              severity={installationStatus.success ? 'success' : 'error'}
              sx={{ mb: 2 }}
            >
              {installationStatus.message}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Tool Name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="source-label">Source Type</InputLabel>
                <Select
                  labelId="source-label"
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleSourceTypeChange}
                  label="Source Type"
                >
                  <MenuItem value="github">
                    <Box display="flex" alignItems="center">
                      <GitHubIcon fontSize="small" sx={{ mr: 1 }} />
                      GitHub Repository
                    </Box>
                  </MenuItem>
                  <MenuItem value="local">
                    <Box display="flex" alignItems="center">
                      <StorageIcon fontSize="small" sx={{ mr: 1 }} />
                      Local Directory
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="sourceUrl"
                label={formData.source === 'github' ? 'GitHub Repository URL' : 'Local Directory Path'}
                value={formData.sourceUrl}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="spaces-label">Assign to Spaces</InputLabel>
                <Select
                  labelId="spaces-label"
                  id="spaces"
                  name="spaces"
                  multiple
                  value={formData.spaces}
                  onChange={handleSelectChange}
                  input={<OutlinedInput label="Assign to Spaces" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {spaces.map((space) => (
                    <MenuItem key={space.id} value={space.name}>
                      {space.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Configuration Parameters
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Add environment variables and configuration parameters for the MCP tool.
              </Typography>

              {Object.keys(formData.config).length === 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  No configuration parameters defined. Click "Add Parameter" to add one.
                </Alert>
              )}

              {Object.entries(formData.config).map(([key, value]) => (
                <Box key={key} display="flex" alignItems="center" gap={2} mb={2}>
                  <TextField
                    label="Parameter Name"
                    value={key}
                    onChange={(e) => {
                      const newConfig = { ...formData.config };
                      const newValue = newConfig[key];
                      delete newConfig[key];
                      newConfig[e.target.value] = newValue;
                      setFormData(prev => ({ ...prev, config: newConfig }));
                    }}
                    sx={{ flexGrow: 1 }}
                  />
                  <TextField
                    label="Value"
                    value={value}
                    onChange={(e) => handleConfigChange(key, e.target.value)}
                    type={key.toLowerCase().includes('key') || key.toLowerCase().includes('token') || key.toLowerCase().includes('secret') ? 'password' : 'text'}
                    sx={{ flexGrow: 1 }}
                  />
                  <IconButton color="error" onClick={() => handleRemoveConfigField(key)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}

              <Button variant="outlined" onClick={handleAddConfigField}>
                Add Parameter
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveTool}
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {editingTool && editingTool.id ? 'Update' : 'Install'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MCPManagement;
