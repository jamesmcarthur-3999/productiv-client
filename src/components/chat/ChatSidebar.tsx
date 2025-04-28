import { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import DoneIcon from '@mui/icons-material/Done';

interface Conversation {
  id: number;
  title: string;
  date: string;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConversation: number | null;
  onSelectConversation: (id: number) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: number) => void;
  onRenameConversation: (id: number, newTitle: string) => void;
}

const ChatSidebar = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
}: ChatSidebarProps) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, conversation: Conversation) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedConversation(conversation);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleDelete = () => {
    if (selectedConversation) {
      onDeleteConversation(selectedConversation.id);
    }
    handleMenuClose();
  };

  const handleRenameClick = () => {
    if (selectedConversation) {
      setNewTitle(selectedConversation.title);
      setRenameDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleRenameClose = () => {
    setRenameDialogOpen(false);
  };

  const handleRenameSubmit = () => {
    if (selectedConversation && newTitle.trim()) {
      onRenameConversation(selectedConversation.id, newTitle);
      handleRenameClose();
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', bgcolor: 'white', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Conversations</Typography>
        <IconButton color="primary" onClick={onNewConversation}>
          <AddIcon />
        </IconButton>
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {conversations.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No conversations yet.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click the + button to start a new one.
            </Typography>
          </Box>
        ) : (
          conversations.map((conversation) => (
            <ListItem
              key={conversation.id}
              disablePadding
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="more"
                  onClick={(e) => handleMenuOpen(e, conversation)}
                >
                  <MoreVertIcon />
                </IconButton>
              }
            >
              <ListItemButton
                selected={activeConversation === conversation.id}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <ListItemText
                  primary={conversation.title}
                  secondary={conversation.date}
                  primaryTypographyProps={{
                    noWrap: true,
                    style: { maxWidth: '180px' },
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>

      {/* Conversation menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleRenameClick}>
          <DoneIcon fontSize="small" sx={{ mr: 1 }} />
          Rename
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Rename dialog */}
      <Dialog open={renameDialogOpen} onClose={handleRenameClose}>
        <DialogTitle>Rename Conversation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Title"
            fullWidth
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRenameClose}>Cancel</Button>
          <Button onClick={handleRenameSubmit} color="primary">
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatSidebar;
