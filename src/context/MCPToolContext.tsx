import React, { createContext, useState, useEffect, useContext } from 'react';
import mcpManager from '../services/mcpManager';

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

interface MCPToolContextType {
  tools: MCPTool[];
  isLoading: boolean;
  error: string | null;
  installTool: (repoUrl: string, options?: {
    name?: string;
    spaces?: string[];
    config?: Record<string, string>;
  }) => Promise<MCPTool>;
  uninstallTool: (id: number) => Promise<boolean>;
  updateToolStatus: (id: number, status: 'active' | 'inactive' | 'error') => Promise<MCPTool>;
  updateToolConfig: (id: number, config: Record<string, string>) => Promise<MCPTool>;
  updateToolSpaces: (id: number, spaces: string[]) => Promise<MCPTool>;
  getToolsForSpace: (spaceName: string) => MCPTool[];
}

const MCPToolContext = createContext<MCPToolContextType>(null!);

export const useMCPTools = () => useContext(MCPToolContext);

export const MCPToolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tools on mount
  useEffect(() => {
    // In a real app, this would be an API call
    // For now, we'll load mock data
    const loadTools = async () => {
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const mockTools: MCPTool[] = [
          {
            id: 1,
            name: 'GitHub Integration',
            description: 'Provides tools to interact with GitHub repositories',
            source: 'github',
            sourceUrl: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
            status: 'active',
            spaces: ['Engineering'],
            config: {
              GITHUB_PERSONAL_ACCESS_TOKEN: '****************************',
            },
          },
          {
            id: 2,
            name: 'CRM Connector',
            description: 'Tools for interacting with CRM systems',
            source: 'github',
            sourceUrl: 'https://github.com/example/crm-connector',
            status: 'active',
            spaces: ['Sales', 'CSM'],
            config: {
              CRM_API_URL: 'https://api.crm.example.com',
              CRM_API_KEY: '****************************',
            },
          },
          {
            id: 3,
            name: 'Documentation Generator',
            description: 'Generate documentation from code, specs, or other sources',
            source: 'github',
            sourceUrl: 'https://github.com/example/doc-generator',
            status: 'active',
            spaces: ['Engineering'],
          },
          {
            id: 4,
            name: 'QBR Builder',
            description: 'Tools for creating and managing Quarterly Business Reviews',
            source: 'github',
            sourceUrl: 'https://github.com/internal/qbr-tools',
            status: 'active',
            spaces: ['CSM'],
          },
        ];

        setTools(mockTools);
      } catch (err) {
        setError('Failed to load MCP tools');
        console.error('Error loading MCP tools:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTools();
  }, []);

  const installTool = async (repoUrl: string, options?: {
    name?: string;
    spaces?: string[];
    config?: Record<string, string>;
  }): Promise<MCPTool> => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real app, this would be an API call to install the MCP tool
      const newTool: MCPTool = {
        id: Date.now(),
        name: options?.name || 'New MCP Tool',
        description: 'Description pending...',
        source: 'github',
        sourceUrl: repoUrl,
        status: 'active',
        spaces: options?.spaces || [],
        config: options?.config || {},
      };

      setTools((prev) => [...prev, newTool]);
      return newTool;
    } catch (err) {
      setError(`Failed to install MCP tool from ${repoUrl}`);
      console.error('Error installing MCP tool:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const uninstallTool = async (id: number): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In a real app, this would be an API call to uninstall the MCP tool
      setTools((prev) => prev.filter((tool) => tool.id !== id));
      return true;
    } catch (err) {
      setError(`Failed to uninstall MCP tool ${id}`);
      console.error('Error uninstalling MCP tool:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateToolStatus = async (id: number, status: 'active' | 'inactive' | 'error'): Promise<MCPTool> => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In a real app, this would be an API call to update the MCP tool status
      const updatedTools = tools.map((tool) =>
        tool.id === id ? { ...tool, status } : tool
      );

      setTools(updatedTools);
      const updatedTool = updatedTools.find((tool) => tool.id === id);
      if (!updatedTool) {
        throw new Error(`Tool with ID ${id} not found`);
      }
      return updatedTool;
    } catch (err) {
      setError(`Failed to update MCP tool status ${id}`);
      console.error('Error updating MCP tool status:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateToolConfig = async (id: number, config: Record<string, string>): Promise<MCPTool> => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In a real app, this would be an API call to update the MCP tool configuration
      const updatedTools = tools.map((tool) =>
        tool.id === id ? { ...tool, config: { ...tool.config, ...config } } : tool
      );

      setTools(updatedTools);
      const updatedTool = updatedTools.find((tool) => tool.id === id);
      if (!updatedTool) {
        throw new Error(`Tool with ID ${id} not found`);
      }
      return updatedTool;
    } catch (err) {
      setError(`Failed to update MCP tool configuration ${id}`);
      console.error('Error updating MCP tool configuration:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateToolSpaces = async (id: number, spaces: string[]): Promise<MCPTool> => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In a real app, this would be an API call to update the MCP tool spaces
      const updatedTools = tools.map((tool) =>
        tool.id === id ? { ...tool, spaces } : tool
      );

      setTools(updatedTools);
      const updatedTool = updatedTools.find((tool) => tool.id === id);
      if (!updatedTool) {
        throw new Error(`Tool with ID ${id} not found`);
      }
      return updatedTool;
    } catch (err) {
      setError(`Failed to update MCP tool spaces ${id}`);
      console.error('Error updating MCP tool spaces:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getToolsForSpace = (spaceName: string): MCPTool[] => {
    return tools.filter(
      (tool) => tool.status === 'active' && tool.spaces.includes(spaceName)
    );
  };

  const value = {
    tools,
    isLoading,
    error,
    installTool,
    uninstallTool,
    updateToolStatus,
    updateToolConfig,
    updateToolSpaces,
    getToolsForSpace,
  };

  return <MCPToolContext.Provider value={value}>{children}</MCPToolContext.Provider>;
};
