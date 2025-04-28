import { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  OutlinedInput,
  CircularProgress,
  Tabs,
  Tab,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useMCPTools } from '../context/MCPToolContext';
import { useSpaces } from '../context/SpaceContext';
import MCPToolCard from '../components/mcp/MCPToolCard';
import githubService from '../services/github';
import mcpService from '../services/mcpService';

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

const MCPManagement = () => {
  const { tools: mcpTools, installTool, uninstallTool, updateToolStatus, updateToolConfig, updateToolSpaces, isLoading, error } = useMCPTools();
  const { spaces } = useSpaces();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [editingTool, setEditingTool] = useState<any | null>(null);
  const [availableMCPTools, setAvailableMCPTools] = useState<any[]>([]);
  const [installationStep, setInstallationStep] = useState(0);
  const [validationStatus, setValidationStatus] = useState<{
    isValid: boolean;
    message: string;
  }>({ isValid: false, message: '' });
  
  // Form state
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
        // In a real app, this would fetch from GitHub or other repositories
        // For now, we'll use mock data
        const mockTools = [
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
            description: "Web and local search using Brave's Search API",
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
        ];
        
        setAvailableMCPTools(mockTools);
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
    setInstallationStep(0);
    
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
      
      // If editing an existing tool, skip to configuration step
      if (tool.id) {
        setInstallationStep(1);
      }
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
    setValidationStatus({ isValid: false, message: '' });
    setInstallationStep(0);
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
  
  const handleNextStep = async () => {
    // Validate current step before proceeding
    if (installationStep === 0) {
      // Validate repository URL
      if (!formData.sourceUrl) {
        setValidationStatus({
          isValid: false,
          message: 'Please enter a valid repository URL',
        });
        return;
      }
      
      try {
        setLoading(true);
        // In a real app, this would validate the repository
        // For now, we'll simulate validation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Auto-fill name and description if not yet provided
        if (!formData.name) {
          const urlParts = formData.sourceUrl.split('/');
          const repoName = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
          setFormData(prev => ({
            ...prev,
            name: repoName.charAt(0).toUpperCase() + repoName.slice(1).replace(/-/g, ' '),
            description: `MCP tool for ${repoName.replace(/-/g, ' ')}`,
          }));
        }
        
        setValidationStatus({
          isValid: true,
          message: 'Repository validated successfully!',
        });
        setInstallationStep(1);
      } catch (error) {
        setValidationStatus({
          isValid: false,
          message: 'Invalid repository URL or repository does not exist',
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Proceed to next step
      setInstallationStep(prev => prev + 1);
    }
  };
  
  const handlePrevStep = () => {
    setInstallationStep(prev => Math.max(0, prev - 1));
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
        
        // Register with MCP service
        await mcpService.installServer(
          formData.name,
          `http://localhost:3010/mcp/${Date.now()}`,
          formData.spaces.map(space => {
            const spaceObj = spaces.find(s => s.name === space);
            return spaceObj?.id || 0;
          }).filter(id => id !== 0)
        );
        
        setInstallationStatus({
          show: true,
          success: true,
          message: 'MCP tool installed successfully!',
        });
      }
      
      // Close dialog after successful installation
      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
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

  // Installation steps
  const steps = [
    'Select Repository',
    'Configure Tool',
    'Assign to Spaces',
    'Install & Test',
  ];

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
                  <MCPToolCard
                    tool={tool}
                    onEdit={() => handleOpenDialog(tool)}
                    onDelete={handleDeleteTool}
                    onStatusToggle={handleToolStatusToggle}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Browse and install MCP tools from the official catalog or GitHub repositories.
            These tools implement the Model Context Protocol (MCP) to extend Claude's capabilities.
          </Alert>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {availableMCPTools.map((tool, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Paper elevation={2} sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h6" gutterBottom>
                      {tool.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph sx={{ flexGrow: 1 }}>
                      {tool.description}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" mb={2}>
                      <GitHubIcon fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                        {tool.sourceUrl.split('/').slice(3).join('/')}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" gap={1} mb={2}>
                      {tool.official && (
                        <Typography variant="caption" sx={{ 
                          bgcolor: 'primary.main', 
                          color: 'white',
                          py: 0.5,
                          px: 1,
                          borderRadius: 1
                        }}>
                          Official
                        </Typography>
                      )}
                      {tool.category && (
                        <Typography variant="caption" sx={{ 
                          bgcolor: 'grey.200',
                          py: 0.5,
                          px: 1,
                          borderRadius: 1
                        }}>
                          {tool.category}
                        </Typography>
                      )}
                    </Box>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenDialog(tool)}
                      fullWidth
                    >
                      Install
                    </Button>
                  </Paper>
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
              Configure global settings for the MCP tool management system. 
              These settings apply to all installed MCP servers.
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
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="MCP Server Port Range"
                  defaultValue="3010-3050"
                  helperText="Port range for MCP servers"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Default Claude API Model"
                  defaultValue="claude-3-opus-20240229"
                  helperText="Claude model used for MCP integration"
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<RefreshIcon />}
                >
                  Restart All MCP Servers
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
          {/* Installation Steps */}
          <Stepper activeStep={installationStep} sx={{ mb: 4 }}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {installationStatus.show && (
            <Alert
              severity={installationStatus.success ? 'success' : 'error'}
              sx={{ mb: 2 }}
            >
              {installationStatus.message}
            </Alert>
          )}
          
          {/* Step 1: Select Repository */}
          {installationStep === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Select MCP Tool Repository
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Enter the URL of a GitHub repository containing an MCP tool. 
                The repository should follow the Model Context Protocol standards.
              </Typography>
              
              <Grid container spacing={2}>
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
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    name="sourceUrl"
                    label="GitHub Repository URL"
                    value={formData.sourceUrl}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    margin="normal"
                    placeholder="https://github.com/username/mcp-tool"
                    error={validationStatus.message !== '' && !validationStatus.isValid}
                    helperText={
                      validationStatus.message !== '' && !validationStatus.isValid
                        ? validationStatus.message
                        : ''
                    }
                  />
                </Grid>
              </Grid>
              
              {validationStatus.isValid && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {validationStatus.message}
                </Alert>
              )}
            </Box>
          )}
          
          {/* Step 2: Configure Tool */}
          {installationStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Configure MCP Tool
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Customize the name, description, and configuration parameters for this MCP tool.
              </Typography>
              
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
                        sx={{ flexGrow: 1 }}
                      />
                      <TextField
                        label="Value"
                        value={value}
                        onChange={(e) => handleConfigChange(key, e.target.value)}
                        type={key.toLowerCase().includes('key') || key.toLowerCase().includes('token') || key.toLowerCase().includes('secret') ? 'password' : 'text'}
                        sx={{ flexGrow: 1 }}
                      />
                      <Button 
                        color="error" 
                        variant="outlined"
                        onClick={() => handleRemoveConfigField(key)}
                      >
                        Remove
                      </Button>
                    </Box>
                  ))}
                  
                  <Button variant="outlined" onClick={handleAddConfigField}>
                    Add Parameter
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Step 3: Assign to Spaces */}
          {installationStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Assign to Spaces
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Select which team spaces should have access to this MCP tool.
              </Typography>
              
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
                        <Typography 
                          key={value} 
                          variant="caption" 
                          sx={{ 
                            bgcolor: 'primary.main', 
                            color: 'white',
                            py: 0.5,
                            px: 1,
                            borderRadius: 1,
                            mr: 0.5
                          }}
                        >
                          {value}
                        </Typography>
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
              
              {formData.spaces.length === 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  This MCP tool is not assigned to any spaces. Users will not be able to access it.
                </Alert>
              )}
            </Box>
          )}
          
          {/* Step 4: Install & Test */}
          {installationStep === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Install & Test MCP Tool
              </Typography>
              <Typography variant="body2" paragraph>
                Confirm the installation details below and install the MCP tool.
              </Typography>
              
              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Installation Summary:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Name:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{formData.name}</Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Repository:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">{formData.sourceUrl}</Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Spaces:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {formData.spaces.length > 0 
                        ? formData.spaces.join(', ') 
                        : 'None (not accessible to users)'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Config Parameters:</Typography>
                  </Grid>
                  <Grid item xs={8}>
                    <Typography variant="body2">
                      {Object.keys(formData.config).length > 0 
                        ? Object.keys(formData.config).join(', ') 
                        : 'None'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                The MCP tool will be installed and configured to work with Claude through the Model Context Protocol.
                This enables Claude to use the tool's capabilities when answering user queries in the assigned spaces.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancel
          </Button>
          
          {installationStep > 0 && (
            <Button onClick={handlePrevStep} disabled={loading}>
              Back
            </Button>
          )}
          
          {installationStep < steps.length - 1 ? (
            <Button
              onClick={handleNextStep}
              variant="contained"
              color="primary"
              disabled={loading || (installationStep === 0 && !formData.sourceUrl)}
              startIcon={loading && <CircularProgress size={20} />}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSaveTool}
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              Install Tool
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MCPManagement;
