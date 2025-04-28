import { useState, useEffect } from 'react';
import { Grid, Box, Paper, Typography, Divider, IconButton, Chip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import BuildIcon from '@mui/icons-material/Build';
import { ChatMessage } from '../services/claude';
import mcpService from '../services/mcpService';
import ChatInterface from '../components/chat/ChatInterface';
import ChatSidebar from '../components/chat/ChatSidebar';
import { useSpaces } from '../context/SpaceContext';
import { useMCPTools } from '../context/MCPToolContext';

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
  const [availableMCPTools, setAvailableMCPTools] = useState<any[]>([]);
  const [activeMCPTools, setActiveMCPTools] = useState<string[]>([]);
  const { currentSpace } = useSpaces();
  const { getToolsForSpace } = useMCPTools();

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

  // Load available MCP tools for the current space
  useEffect(() => {
    const loadMCPTools = async () => {
      if (!currentSpace) return;
      
      try {
        // Get MCP tools from the service
        const toolsData = await mcpService.getToolsForSpace(currentSpace.id);
        setAvailableMCPTools(toolsData.flatMap(data => data.tools));
        
        // Get active tools from MCP Tool context
        const activeTools = getToolsForSpace(currentSpace.name)
          .filter(tool => tool.status === 'active')
          .map(tool => tool.name);
        
        setActiveMCPTools(activeTools);
      } catch (error) {
        console.error('Error loading MCP tools:', error);
      }
    };
    
    loadMCPTools();
  }, [currentSpace, getToolsForSpace]);

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
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
            Available MCP Tools:
          </Typography>
          {activeMCPTools.length > 0 ? (
            activeMCPTools.map((tool, index) => (
              <Chip
                key={index}
                size="small"
                label={tool}
                icon={<BuildIcon fontSize="small" />}
                color="primary"
                variant="outlined"
                sx={{ mr: 1 }}
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No active MCP tools for this space
            </Typography>
          )}
        </Box>
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
                  {availableMCPTools.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Available MCP Tools:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mt: 1 }}>
                        {availableMCPTools.map((tool, index) => (
                          <Chip
                            key={index}
                            size="small"
                            label={tool.name}
                            icon={<BuildIcon fontSize="small" />}
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
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
