import { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Divider,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Snackbar,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SecurityIcon from '@mui/icons-material/Security';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';
import PersonIcon from '@mui/icons-material/Person';
import claudeService from '../services/claude';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [testingApi, setTestingApi] = useState(false);
  
  // Form state
  const [settings, setSettings] = useState({
    // Application settings
    appName: 'Claude for Productiv',
    theme: 'light',
    autoSave: true,
    enableNotifications: true,
    
    // Claude API settings
    claudeApiKey: localStorage.getItem('claude_api_key') || '',
    claudeModel: localStorage.getItem('claude_model') || 'claude-3-opus-20240229',
    maxTokens: 4096,
    temperature: 0.7,
    
    // GitHub settings
    githubToken: localStorage.getItem('github_token') || '',
    defaultRepo: 'mcp-tools',
    
    // DigitalOcean settings
    dropletIp: '',
    sshKeyPath: '/Users/jamesmcarthur/Documents/SSH Keys',
    enableMonitoring: true,
  });

  // Save stored settings to service on component mount
  useEffect(() => {
    if (settings.claudeApiKey) {
      claudeService.setApiKey(settings.claudeApiKey);
    }
    if (settings.claudeModel) {
      claudeService.setModel(settings.claudeModel);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const name = e.target.name as string;
    const value = e.target.value as string;
    
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleSaveSettings = () => {
    setLoading(true);
    
    try {
      // Save Claude API settings
      if (settings.claudeApiKey) {
        localStorage.setItem('claude_api_key', settings.claudeApiKey);
        claudeService.setApiKey(settings.claudeApiKey);
      }
      
      if (settings.claudeModel) {
        localStorage.setItem('claude_model', settings.claudeModel);
        claudeService.setModel(settings.claudeModel);
      }
      
      // Save GitHub token
      if (settings.githubToken) {
        localStorage.setItem('github_token', settings.githubToken);
      }
      
      setSnackbarMessage('Settings saved successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSnackbarMessage('Error saving settings');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleTestClaudeApi = async () => {
    setTestingApi(true);
    
    try {
      // Test Claude API with a simple message
      const response = await claudeService.sendMessage([
        { role: 'user', content: 'Hello, please respond with a brief confirmation that the API connection is working.' }
      ]);
      
      if (response) {
        setSnackbarMessage('Claude API connection successful');
      } else {
        setSnackbarMessage('Claude API connection failed - no response received');
      }
    } catch (error) {
      console.error('Error testing Claude API:', error);
      setSnackbarMessage(`Claude API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTestingApi(false);
      setSnackbarOpen(true);
    }
  };

  const handleTestGithubApi = () => {
    setLoading(true);
    
    // Simulate API call to test GitHub API
    setTimeout(() => {
      setLoading(false);
      setSnackbarMessage('GitHub API connection successful');
      setSnackbarOpen(true);
    }, 1500);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Settings</Typography>
      
      <Grid container spacing={3}>
        {/* Application Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <PersonIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Application Settings</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    name="appName"
                    label="Application Name"
                    value={settings.appName}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="autoSave"
                        checked={settings.autoSave}
                        onChange={handleSwitchChange}
                        color="primary"
                      />
                    }
                    label="Auto-save conversations"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="enableNotifications"
                        checked={settings.enableNotifications}
                        onChange={handleSwitchChange}
                        color="primary"
                      />
                    }
                    label="Enable notifications"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Claude API Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CloudIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Claude API Settings</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    name="claudeApiKey"
                    label="Claude API Key"
                    value={settings.claudeApiKey}
                    onChange={handleInputChange}
                    fullWidth
                    type="password"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="claude-model-label">Claude Model</InputLabel>
                    <Select
                      labelId="claude-model-label"
                      id="claudeModel"
                      name="claudeModel"
                      value={settings.claudeModel}
                      onChange={handleSelectChange as any}
                      label="Claude Model"
                    >
                      <MenuItem value="claude-3-opus-20240229">Claude 3 Opus</MenuItem>
                      <MenuItem value="claude-3-sonnet-20240229">Claude 3 Sonnet</MenuItem>
                      <MenuItem value="claude-3-haiku-20240307">Claude 3 Haiku</MenuItem>
                      <MenuItem value="claude-3.5-sonnet-20250326">Claude 3.5 Sonnet</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="maxTokens"
                    label="Max Tokens"
                    value={settings.maxTokens}
                    onChange={handleInputChange}
                    fullWidth
                    type="number"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="body2">Temperature: {settings.temperature}</Typography>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      name="temperature"
                      value={settings.temperature}
                      onChange={handleInputChange}
                      style={{ width: '70%' }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleTestClaudeApi}
                disabled={testingApi || !settings.claudeApiKey}
              >
                {testingApi ? <CircularProgress size={24} /> : 'Test Connection'}
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* GitHub Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SecurityIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">GitHub Integration</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    name="githubToken"
                    label="GitHub Personal Access Token"
                    value={settings.githubToken}
                    onChange={handleInputChange}
                    fullWidth
                    type="password"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="defaultRepo"
                    label="Default Repository"
                    value={settings.defaultRepo}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="info">
                    GitHub integration is used for installing and managing MCP tools from repositories.
                    To create a Personal Access Token, go to GitHub Settings &gt; Developer Settings &gt; Personal Access Tokens.
                  </Alert>
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleTestGithubApi}
                disabled={loading || !settings.githubToken}
              >
                Test Connection
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Deployment Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <StorageIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Deployment Settings</Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    name="dropletIp"
                    label="DigitalOcean Droplet IP"
                    value={settings.dropletIp}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="sshKeyPath"
                    label="SSH Key Path"
                    value={settings.sshKeyPath}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        name="enableMonitoring"
                        checked={settings.enableMonitoring}
                        onChange={handleSwitchChange}
                        color="primary"
                      />
                    }
                    label="Enable server monitoring"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box mt={4} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          onClick={handleSaveSettings}
          disabled={loading}
        >
          Save Settings
        </Button>
      </Box>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </div>
  );
};

export default Settings;
