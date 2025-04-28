import githubService from './github';

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

interface InstallOptions {
  name?: string;
  spaces?: string[];
  config?: Record<string, string>;
}

class MCPManager {
  private tools: MCPTool[] = [];
  
  constructor() {
    this.loadTools();
  }
  
  private loadTools() {
    // This would load tools from persistent storage in a real app
    // For now, we'll just use an empty array that gets populated as we add tools
    this.tools = [];
  }
  
  async installFromGitHub(repoUrl: string, options: InstallOptions = {}) {
    try {
      // Parse GitHub URL to get owner and repo
      const repoInfo = githubService.parseGitHubUrl(repoUrl);
      if (!repoInfo) {
        throw new Error('Invalid GitHub repository URL');
      }
      
      // Get repository information from GitHub
      const repo = await githubService.getRepoInfo(repoInfo.owner, repoInfo.repo);
      
      // Create a new MCP tool
      const newTool: MCPTool = {
        id: Date.now(), // Use timestamp as ID (in a real app, use a proper ID generator)
        name: options.name || repo.name,
        description: repo.description || '',
        source: 'github',
        sourceUrl: repoUrl,
        status: 'active',
        spaces: options.spaces || [],
        config: options.config || {},
      };
      
      // Add the tool to our list
      this.tools.push(newTool);
      
      // In a real app, we would save the tools list to persistent storage here
      
      // In a real app, we would also install the MCP server here, by:
      // 1. Cloning the repository
      // 2. Installing dependencies
      // 3. Setting up configuration
      // 4. Starting the server
      
      return newTool;
    } catch (error) {
      console.error('Error installing MCP tool from GitHub:', error);
      throw error;
    }
  }
  
  async uninstallTool(id: number) {
    try {
      // Find the tool
      const toolIndex = this.tools.findIndex(tool => tool.id === id);
      if (toolIndex === -1) {
        throw new Error(`MCP tool with ID ${id} not found`);
      }
      
      // Remove the tool from our list
      this.tools.splice(toolIndex, 1);
      
      // In a real app, we would save the tools list to persistent storage here
      
      // In a real app, we would also uninstall the MCP server here, by:
      // 1. Stopping the server
      // 2. Removing configuration
      // 3. Removing the server code
      
      return true;
    } catch (error) {
      console.error('Error uninstalling MCP tool:', error);
      throw error;
    }
  }
  
  async updateToolStatus(id: number, status: 'active' | 'inactive' | 'error') {
    try {
      // Find the tool
      const tool = this.tools.find(tool => tool.id === id);
      if (!tool) {
        throw new Error(`MCP tool with ID ${id} not found`);
      }
      
      // Update the status
      tool.status = status;
      
      // In a real app, we would save the tools list to persistent storage here
      
      // In a real app, we would also start or stop the MCP server based on the status
      
      return tool;
    } catch (error) {
      console.error('Error updating MCP tool status:', error);
      throw error;
    }
  }
  
  async updateToolConfig(id: number, config: Record<string, string>) {
    try {
      // Find the tool
      const tool = this.tools.find(tool => tool.id === id);
      if (!tool) {
        throw new Error(`MCP tool with ID ${id} not found`);
      }
      
      // Update the config
      tool.config = { ...tool.config, ...config };
      
      // In a real app, we would save the tools list to persistent storage here
      
      // In a real app, we would also update the MCP server configuration
      
      return tool;
    } catch (error) {
      console.error('Error updating MCP tool configuration:', error);
      throw error;
    }
  }
  
  async updateToolSpaces(id: number, spaces: string[]) {
    try {
      // Find the tool
      const tool = this.tools.find(tool => tool.id === id);
      if (!tool) {
        throw new Error(`MCP tool with ID ${id} not found`);
      }
      
      // Update the spaces
      tool.spaces = spaces;
      
      // In a real app, we would save the tools list to persistent storage here
      
      return tool;
    } catch (error) {
      console.error('Error updating MCP tool spaces:', error);
      throw error;
    }
  }
  
  getTools() {
    return this.tools;
  }
  
  getTool(id: number) {
    return this.tools.find(tool => tool.id === id);
  }
}

export default new MCPManager();
