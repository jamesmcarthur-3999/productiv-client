import axios from 'axios';
import mcpManager from './mcpManager';

interface MCPServer {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'inactive' | 'error';
  spaceIds: number[];
}

interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
  outputSchema?: any; 
}

interface MCPToolRequest {
  name: string;
  parameters: Record<string, any>;
}

interface MCPToolResponse {
  result: any;
  error?: string;
}

class MCPService {
  private servers: MCPServer[] = [];

  constructor() {
    this.loadServers();
  }

  /**
   * Load MCP servers from storage or configuration
   */
  private async loadServers() {
    // In a real implementation, this would load from the database or configuration
    // For now, we'll use a mock implementation
    const tools = mcpManager.getTools();
    
    this.servers = tools.map(tool => ({
      id: tool.id.toString(),
      name: tool.name,
      url: `http://localhost:3010/mcp/${tool.id}`, // Example URL format
      status: tool.status,
      spaceIds: tool.spaces.map(space => parseInt(space.replace(/\D/g, '')) || 0),
    }));
  }

  /**
   * Get all available MCP servers
   */
  getServers(): MCPServer[] {
    return this.servers;
  }

  /**
   * Get MCP servers for a specific space
   */
  getServersForSpace(spaceId: number): MCPServer[] {
    return this.servers.filter(server => 
      server.status === 'active' && server.spaceIds.includes(spaceId)
    );
  }

  /**
   * Get available MCP tools from a server
   */
  async getTools(serverId: string): Promise<MCPTool[]> {
    const server = this.servers.find(s => s.id === serverId);
    if (!server) {
      throw new Error(`MCP server with ID ${serverId} not found`);
    }

    if (server.status !== 'active') {
      throw new Error(`MCP server ${server.name} is not active`);
    }

    try {
      // In a real implementation, this would make an API call to the MCP server
      // For now, we'll return mock data based on the server name
      const toolName = server.name.toLowerCase();
      
      return [
        {
          name: `${toolName}_search`,
          description: `Search using ${server.name}`,
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of results',
                default: 10,
              },
            },
            required: ['query'],
          },
        },
        {
          name: `${toolName}_get`,
          description: `Get data from ${server.name}`,
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'ID of the item to retrieve',
              },
            },
            required: ['id'],
          },
        },
      ];
    } catch (error) {
      console.error(`Error fetching tools from MCP server ${server.name}:`, error);
      throw error;
    }
  }

  /**
   * Get all available MCP tools for a specific space
   */
  async getToolsForSpace(spaceId: number): Promise<{ serverId: string; tools: MCPTool[] }[]> {
    const servers = this.getServersForSpace(spaceId);
    const toolsPromises = servers.map(async server => {
      const tools = await this.getTools(server.id);
      return { 
        serverId: server.id,
        tools,
      };
    });
    
    return Promise.all(toolsPromises);
  }

  /**
   * Execute an MCP tool on a server
   */
  async executeTool(
    serverId: string, 
    toolRequest: MCPToolRequest
  ): Promise<MCPToolResponse> {
    const server = this.servers.find(s => s.id === serverId);
    if (!server) {
      throw new Error(`MCP server with ID ${serverId} not found`);
    }

    if (server.status !== 'active') {
      throw new Error(`MCP server ${server.name} is not active`);
    }

    try {
      // In a real implementation, this would make an API call to the MCP server
      // For MCP protocol, we follow the JSON-RPC 2.0 specification
      const response = await axios.post(server.url, {
        jsonrpc: '2.0',
        id: Date.now(),
        method: toolRequest.name,
        params: toolRequest.parameters,
      });

      if (response.data.error) {
        throw new Error(`MCP error ${response.data.error.code}: ${response.data.error.message}`);
      }

      return {
        result: response.data.result,
      };
    } catch (error) {
      console.error(`Error executing MCP tool ${toolRequest.name} on server ${server.name}:`, error);
      
      return {
        result: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Install a new MCP server
   */
  async installServer(
    name: string,
    url: string,
    spaceIds: number[]
  ): Promise<MCPServer> {
    // In a real implementation, this would install and configure the MCP server
    // For now, we'll just add it to our list
    const newServer: MCPServer = {
      id: Date.now().toString(),
      name,
      url,
      status: 'active',
      spaceIds,
    };
    
    this.servers.push(newServer);
    
    return newServer;
  }

  /**
   * Uninstall an MCP server
   */
  async uninstallServer(serverId: string): Promise<boolean> {
    const index = this.servers.findIndex(s => s.id === serverId);
    if (index === -1) {
      return false;
    }
    
    this.servers.splice(index, 1);
    return true;
  }

  /**
   * Update server status
   */
  updateServerStatus(
    serverId: string, 
    status: 'active' | 'inactive' | 'error'
  ): MCPServer | null {
    const server = this.servers.find(s => s.id === serverId);
    if (!server) {
      return null;
    }
    
    server.status = status;
    return server;
  }

  /**
   * Converts MCP tools to Claude API tool format
   */
  convertToolsToClaudeFormat(tools: MCPTool[]): any[] {
    return tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema,
    }));
  }
}

export default new MCPService();
