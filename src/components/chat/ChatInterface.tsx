import { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  CircularProgress,
  Divider,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ReactMarkdown from 'react-markdown';
import claudeService, { ChatMessage } from '../../services/claude';
import { useMCPTools } from '../../context/MCPToolContext';

interface ChatInterfaceProps {
  spaceId?: number;
  initialMessages?: ChatMessage[];
  onMessageSent?: (message: ChatMessage) => void;
}

const ChatInterface = ({ spaceId, initialMessages = [], onMessageSent }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getToolsForSpace } = useMCPTools();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamedResponse]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message to the chat
    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Notify parent component if callback provided
    onMessageSent?.(userMessage);

    // Clear any previous streamed response
    setStreamedResponse('');

    try {
      // Get available MCP tools for the current space
      const availableTools = spaceId ? getToolsForSpace(
        // Get space name from context based on spaceId
        messages[0]?.content || 'default'
      ) : [];

      // Start streaming response
      await claudeService.streamMessage(
        [...messages, userMessage],
        (chunk) => {
          setStreamedResponse((prev) => prev + chunk);
        },
        spaceId
      );

      // After streaming is complete, add the assistant message to the messages array
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: streamedResponse,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setStreamedResponse('');

      // Notify parent component if callback provided
      onMessageSent?.(assistantMessage);
    } catch (error) {
      console.error('Error getting response from Claude:', error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error while processing your request. Please try again.',
        },
      ]);
      setStreamedResponse('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box display="flex" flexDirection="column" height="100%" sx={{ bgcolor: '#f8f9fa' }}>
      {/* Messages area */}
      <Box flex={1} p={2} overflow="auto" sx={{ maxHeight: 'calc(100vh - 200px)' }}>
        {messages.map((message, index) => (
          <Box 
            key={index} 
            mb={2} 
            display="flex" 
            justifyContent={message.role === 'user' ? 'flex-end' : 'flex-start'}
          >
            <Paper
              elevation={1}
              sx={{
                p: 2,
                maxWidth: '75%',
                bgcolor: message.role === 'user' ? '#e3f2fd' : 'white',
                borderRadius: 2,
              }}
            >
              <Typography variant="body1">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </Typography>
            </Paper>
          </Box>
        ))}

        {/* Streamed response display */}
        {streamedResponse && (
          <Box mb={2} display="flex" justifyContent="flex-start">
            <Paper
              elevation={1}
              sx={{
                p: 2,
                maxWidth: '75%',
                bgcolor: 'white',
                borderRadius: 2,
              }}
            >
              <Typography variant="body1">
                <ReactMarkdown>{streamedResponse}</ReactMarkdown>
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Loading indicator */}
        {isLoading && !streamedResponse && (
          <Box mb={2} display="flex" justifyContent="flex-start">
            <CircularProgress size={24} />
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input area */}
      <Box p={2} bgcolor="white">
        <Box display="flex" alignItems="center">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message here..."
            multiline
            maxRows={4}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            sx={{ mr: 1 }}
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            size="large"
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatInterface;
