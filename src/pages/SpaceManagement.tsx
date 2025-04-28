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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import BuildIcon from '@mui/icons-material/Build';
import { useSpaces } from '../context/SpaceContext';
import { useMCPTools } from '../context/MCPToolContext';

const SpaceManagement = () => {
  const { spaces, createSpace, updateSpace, deleteSpace, isLoading } = useSpaces();
  const { tools: mcpTools } = useMCPTools();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSpaceId, setEditingSpaceId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    users: [] as string[],
    tools: [] as string[],
  });

  // Available users and tools for selection
  const availableUsers = [
    'john.doe@example.com',
    'jane.smith@example.com',
    'mike.johnson@example.com',
    'sarah.williams@example.com',
    'david.brown@example.com',
    'emily.davis@example.com',
  ];

  const availableTools = mcpTools.map(tool => tool.name);

  const handleOpenDialog = (spaceId?: number) => {
    if (spaceId !== undefined) {
      const space = spaces.find(s => s.id === spaceId);
      if (space) {
        setEditingSpaceId(spaceId);
        setFormData({
          name: space.name,
          description: space.description,
          users: [...space.users],
          tools: [...space.tools],
        });
      }
    } else {
      setEditingSpaceId(null);
      setFormData({
        name: '',
        description: '',
        users: [],
        tools: [],
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string[]>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: typeof value === 'string' ? [value] : value }));
  };

  const handleSaveSpace = async () => {
    try {
      if (editingSpaceId !== null) {
        // Update existing space
        await updateSpace(editingSpaceId, formData);
      } else {
        // Create new space
        await createSpace(formData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving space:', error);
      // In a real app, show error message to user
    }
  };

  const handleDeleteSpace = async (id: number) => {
    try {
      await deleteSpace(id);
    } catch (error) {
      console.error('Error deleting space:', error);
      // In a real app, show error message to user
    }
  };

  return (
    <div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Space Management</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Space
        </Button>
      </Box>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {spaces.map((space) => (
            <Grid item xs={12} md={6} lg={4} key={space.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {space.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {space.description}
                  </Typography>
                  
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom display="flex" alignItems="center">
                      <GroupIcon fontSize="small" sx={{ mr: 1 }} />
                      Users ({space.users.length})
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {space.users.map((user) => (
                        <Chip key={user} label={user} size="small" />
                      ))}
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" gutterBottom display="flex" alignItems="center">
                      <BuildIcon fontSize="small" sx={{ mr: 1 }} />
                      Tools ({space.tools.length})
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {space.tools.map((tool) => (
                        <Chip key={tool} label={tool} size="small" color="primary" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog(space.id)}
                  >
                    Edit
                  </Button>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => handleDeleteSpace(space.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}

          {spaces.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  No spaces found. Create your first space to get started!
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Create/Edit Space Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingSpaceId !== null ? 'Edit Space' : 'Create New Space'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Space Name"
                fullWidth
                required
                value={formData.name}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="users-label">Assign Users</InputLabel>
                <Select
                  labelId="users-label"
                  id="users"
                  name="users"
                  multiple
                  value={formData.users}
                  onChange={handleSelectChange}
                  input={<OutlinedInput label="Assign Users" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {availableUsers.map((user) => (
                    <MenuItem key={user} value={user}>
                      {user}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="tools-label">Assign Tools</InputLabel>
                <Select
                  labelId="tools-label"
                  id="tools"
                  name="tools"
                  multiple
                  value={formData.tools}
                  onChange={handleSelectChange}
                  input={<OutlinedInput label="Assign Tools" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {availableTools.map((tool) => (
                    <MenuItem key={tool} value={tool}>
                      {tool}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveSpace} 
            variant="contained" 
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : editingSpaceId !== null ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SpaceManagement;
