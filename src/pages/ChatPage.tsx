import { useState, useEffect } from 'react';
import { Grid, Box, Paper, Typography, Divider, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { ChatMessage } from '../services/claude';
import ChatInterface from '../components/chat/ChatInterface';
import ChatSidebar from '../components/chat/ChatSidebar';
import { useSpaces } from '../context/SpaceContext';

interface Conversation {
  id: number;
  title: string;
  date: string;
  messages: ChatMessage[];
}

const ChatPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentSpace } = useSpaces();

  // Load conversations from localStorage or API on component mount
  useEffect(() => {
    // In a real app, this would be an API call to load conversations for the current space
    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
      setConversations(JSON.parse(savedConversations));
    }
  }, []);

  // Save conversations to localStorage when they change
  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now(),
      title: 'New Conversation',
      date: new Date().toLocaleDateString(),
      messages: [],
    };

    setConversations([...conversations, newConversation]);
    setActiveConversation(newConversation.id);
  };

  const handleSelectConversation = (id: number) => {
    setActiveConversation(id);
  };

  const handleDeleteConversation = (id: number) => {
    const newConversations = conversations.filter((conv) => conv.id !== id);
    setConversations(newConversations);

    if (activeConversation === id) {
      setActiveConversation(newConversations.length > 0 ? newConversations[0].id : null);
    }
  };

  const handleRenameConversation = (id: number, newTitle: string) => {
    setConversations(
      conversations.map((conv) =>
        conv.id === id ? { ...conv, title: newTitle } : conv
      )
    );
  };

  const handleMessageSent = (message: ChatMessage) => {
    if (activeConversation) {
      setConversations(
        conversations.map((conv) =>
          conv.id === activeConversation
            ? {
                ...conv,
                messages: [...conv.messages, message],
                // Update title based on first user message if it's still the default
                title:
                  conv.title === 'New Conversation' && message.role === 'user'
                    ? message.content.substring(0, 30) + (message.content.length > 30 ? '...' : '')
                    : conv.title,
                date: new Date().toLocaleDateString(),
              }
            : conv
        )
      );
    }
  };

  const currentConversation = conversations.find((conv) => conv.id === activeConversation);

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* Space header */}
      <Box sx={{ p: 2, bgcolor: '#f0f4f8', borderBottom: '1px solid #e0e0e0' }}>
        <Typography variant="h6">{currentSpace?.name || 'Default Space'}</Typography>
        <Typography variant="body2" color="text.secondary">
          Using specialized MCP tools for this space
        </Typography>
      </Box>

      <Grid container sx={{ flexGrow: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <Grid item xs={12} sm={3} md={3} lg={2} sx={{ borderRight: '1px solid #e0e0e0', height: '100%' }}>
            <ChatSidebar
              conversations={conversations}
              activeConversation={activeConversation}
              onSelectConversation={handleSelectConversation}
              onNewConversation={handleNewConversation}
              onDeleteConversation={handleDeleteConversation}
              onRenameConversation={handleRenameConversation}
            />
          </Grid>
        )}

        {/* Main chat area */}
        <Grid item xs={12} sm={sidebarOpen ? 9 : 12} md={sidebarOpen ? 9 : 12} lg={sidebarOpen ? 10 : 12}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Chat header */}
            <Box
              sx={{
                p: 2,
                bgcolor: 'white',
                borderBottom: '1px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <IconButton sx={{ mr: 1 }} onClick={() => setSidebarOpen(!sidebarOpen)}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6">
                {currentConversation?.title || 'Start a new conversation'}
              </Typography>
            </Box>

            {/* Chat interface */}
            {activeConversation ? (
              <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <ChatInterface
                  spaceId={currentSpace?.id}
                  initialMessages={currentConversation?.messages || []}
                  onMessageSent={handleMessageSent}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Paper elevation={0} sx={{ p: 3, maxWidth: '600px', textAlign: 'center' }}>
                  <Typography variant="h5" gutterBottom>
                    Welcome to Claude for Productiv
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Start a new conversation or select an existing one from the sidebar.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This space has specialized MCP tools for {currentSpace?.name || 'your team'}.
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChatPage;
