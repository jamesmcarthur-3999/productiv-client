import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SpaceManagement from './pages/SpaceManagement';
import MCPManagement from './pages/MCPManagement';
import Settings from './pages/Settings';
import ChatPage from './pages/ChatPage';

// Components
import MainLayout from './components/layouts/MainLayout';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { SpaceProvider } from './context/SpaceContext';
import { MCPToolProvider } from './context/MCPToolContext';

// Theme configuration
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1B67B2',
    },
    secondary: {
      main: '#568C1C',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SpaceProvider>
          <MCPToolProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="spaces" element={<SpaceManagement />} />
                  <Route path="chat" element={<ChatPage />} />
                  <Route path="mcp" element={<MCPManagement />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
              </Routes>
            </Router>
          </MCPToolProvider>
        </SpaceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
