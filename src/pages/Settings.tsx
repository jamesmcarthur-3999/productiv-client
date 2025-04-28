import { useState } from 'react';
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
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SecurityIcon from '@mui/icons-material/Security';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';
import PersonIcon from '@mui/icons-material/Person';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Form state
  const [settings, setSettings] = useState({
    // Application settings
    appName: 'Claude for Productiv',
    theme: 'light',
    autoSave: true,
    enableNotifications: true,
    
    // Claude API settings
    claudeApiKey: '************************************',
    claudeModel: 'claude-3-opus-20240229',
    maxTokens: 4096,
    temperature: 0.7,
    
    // GitHub settings
    githubToken: '************************************',
    defaultRepo: 'mcp-tools',
    
    // DigitalOcean settings
    dropletIp: '',
    sshKeyPath: '/Users/jamesmcarthur/Documents/SSH Keys',
    enableMonitoring: true,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleSaveSettings = () => {
    setLoading(true);
    
    // Simulate API call to save settings
    setTimeout(() => {
      setLoading(false);
      setSnackbarMessage('Settings saved successfully');
      setSnackbarOpen(true);
    }, 1500);
  };

  const handleTestClaudeApi = () => {
    setLoading(true);
    
    // Simulate API call to test Claude API
    setTimeout(() => {
      setLoading(false);
      setSnackbarMessage('Claude API connection successful');
      setSnackbarOpen(true);
    }, 1500);
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
                  <TextField
                    name="claudeModel"
                    label="Claude Model"
                    value={settings.claudeModel}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    select
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                    <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                    <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                  </TextField>
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
                disabled={loading}
              >
                Test Connection
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
                  </Alert>
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleTestGithubApi}
                disabled={loading}
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
