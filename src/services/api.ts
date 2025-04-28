import axios from 'axios';

// Create a base axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Types for API responses
export interface Space {
  id: number;
  name: string;
  description: string;
  users: string[];
  tools: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MCPTool {
  id: number;
  name: string;
  description: string;
  source: string;
  sourceUrl: string;
  status: 'active' | 'inactive' | 'error';
  spaces: string[];
  config?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  spaces: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: number;
  title: string;
  spaceId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface Message {
  id: number;
  conversationId: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Space API functions
export const SpaceAPI = {
  getAll: () => api.get<Space[]>('/spaces'),
  getById: (id: number) => api.get<Space>(`/spaces/${id}`),
  create: (space: Partial<Space>) => api.post<Space>('/spaces', space),
  update: (id: number, space: Partial<Space>) => api.put<Space>(`/spaces/${id}`, space),
  delete: (id: number) => api.delete(`/spaces/${id}`),
};

// MCP Tool API functions
export const MCPToolAPI = {
  getAll: () => api.get<MCPTool[]>('/mcp-tools'),
  getById: (id: number) => api.get<MCPTool>(`/mcp-tools/${id}`),
  create: (tool: Partial<MCPTool>) => api.post<MCPTool>('/mcp-tools', tool),
  update: (id: number, tool: Partial<MCPTool>) => api.put<MCPTool>(`/mcp-tools/${id}`, tool),
  delete: (id: number) => api.delete(`/mcp-tools/${id}`),
  toggleStatus: (id: number, status: 'active' | 'inactive') => api.patch<MCPTool>(`/mcp-tools/${id}/status`, { status }),
  installFromGitHub: (repoUrl: string, config?: Record<string, string>) => 
    api.post<MCPTool>('/mcp-tools/install', { repoUrl, config }),
};

// User API functions
export const UserAPI = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  create: (user: Partial<User>) => api.post<User>('/users', user),
  update: (id: number, user: Partial<User>) => api.put<User>(`/users/${id}`, user),
  delete: (id: number) => api.delete(`/users/${id}`),
  getCurrentUser: () => api.get<User>('/users/me'),
};

// Conversation API functions
export const ConversationAPI = {
  getAll: (spaceId?: number) => {
    const params = spaceId ? { spaceId } : {};
    return api.get<Conversation[]>('/conversations', { params });
  },
  getById: (id: number) => api.get<Conversation>(`/conversations/${id}`),
  create: (conversation: Partial<Conversation>) => api.post<Conversation>('/conversations', conversation),
  update: (id: number, conversation: Partial<Conversation>) => api.put<Conversation>(`/conversations/${id}`, conversation),
  delete: (id: number) => api.delete(`/conversations/${id}`),
  addMessage: (conversationId: number, message: Omit<Message, 'id' | 'conversationId' | 'timestamp'>) => 
    api.post<Message>(`/conversations/${conversationId}/messages`, message),
};

// Auth API functions
export const AuthAPI = {
  login: (username: string, password: string) => api.post<{token: string, user: User}>('/auth/login', { username, password }),
  logout: () => api.post('/auth/logout'),
  register: (user: Partial<User>) => api.post<User>('/auth/register', user),
};

// Claude API integration
export const ClaudeAPI = {
  sendMessage: (message: string, conversationId?: string, spaceId?: number) => 
    api.post('/claude/messages', { message, conversationId, spaceId }),
};

export default api;
