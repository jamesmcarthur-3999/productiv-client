import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
  FormControlLabel,
  Switch,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface MCPTool {
  id: number;
  name: string;
  description: string;
  source: string;
  sourceUrl: string;
  status: 'active' | 'inactive' | 'error';
  spaces: string[];
  config?: Record<string, string>;
}

interface MCPToolCardProps {
  tool: MCPTool;
  onEdit: (tool: MCPTool) => void;
  onDelete: (id: number) => void;
  onStatusToggle: (id: number, status: 'active' | 'inactive' | 'error') => void;
}

const MCPToolCard: React.FC<MCPToolCardProps> = ({
  tool,
  onEdit,
  onDelete,
  onStatusToggle,
}) => {
  const handleStatusToggle = () => {
    onStatusToggle(tool.id, tool.status === 'active' ? 'inactive' : 'active');
  };

  return (
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
        
        {tool.config && Object.keys(tool.config).length > 0 && (
          <>
            <Typography variant="subtitle2" gutterBottom>
              Configuration:
            </Typography>
            <Box>
              {Object.entries(tool.config).map(([key, value]) => (
                <Typography key={key} variant="body2" color="textSecondary">
                  {key}: {key.toLowerCase().includes('key') || key.toLowerCase().includes('token') 
                          ? '••••••••' 
                          : value}
                </Typography>
              ))}
            </Box>
          </>
        )}
      </CardContent>
      <CardActions>
        <FormControlLabel
          control={
            <Switch
              checked={tool.status === 'active'}
              onChange={handleStatusToggle}
              color="primary"
            />
          }
          label={tool.status === 'active' ? 'Enabled' : 'Disabled'}
        />
        <Button
          size="small"
          startIcon={<EditIcon />}
          onClick={() => onEdit(tool)}
        >
          Configure
        </Button>
        <IconButton color="error" size="small" onClick={() => onDelete(tool.id)}>
          <DeleteIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default MCPToolCard;
