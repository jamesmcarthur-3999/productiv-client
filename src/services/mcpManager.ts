import githubService from './github';
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { Client } from 'model-context-protocol/client';
import { StdioClientTransport } from 'model-context-protocol/client/stdio';

interface MCPTool {
  id: number;
  name: string;
  description: string;
  source: string;
  sourceUrl: string;
  status: 'active' | 'inactive' | 'error';
  spaces: string[];
  config?: Record<string, string>;
  processId?: number; // Process ID if running
  clientId?: string;   // Client ID for identification
}

interface InstallOptions {
  name?: string;
  spaces?: string[];
  config?: Record<string, string>;
}

interface MCPServerConfig {
  mcpServers: Record<string, {
    command: string;
    args: string[];
    env?: Record<string, string>;
  }>;
}

class MCPManager {
  private tools: MCPTool[] = [];
  private configPath: string;
  private serversPath: string;
  private activeClients: Map<string, Client> = new Map();
  private activeProcesses: Map<number, any> = new Map();
  
  constructor() {
    // In a real app, these would be configurable
    this.configPath = path.join(process.env.HOME || '', 'Library/Application Support/Claude for Productiv/config.json');
    this.serversPath = path.join(process.env.HOME || '', 'Library/Application Support/Claude for Productiv/servers');
    
    // Ensure directories exist
    this.ensureDirectories();
    this.loadTools();
  }
  
  private ensureDirectories() {
    const configDir = path.dirname(this.configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.serversPath)) {
      fs.mkdirSync(this.serversPath, { recursive: true });
    }
  }
  
  private loadTools() {
    try {
      // Load tools from config file
      if (fs.existsSync(this.configPath)) {
        const config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        
        if (config.tools && Array.isArray(config.tools)) {
          this.tools = config.tools;
        }
      } else {
        // Create default config file if it doesn't exist
        this.saveTools();
      }
    } catch (error) {
      console.error('Error loading MCP tools:', error);
      this.tools = [];
    }
  }
  
  private saveTools() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify({ tools: this.tools }, null, 2));
    } catch (error) {
      console.error('Error saving MCP tools:', error);
    }
  }
  
  private generateMCPConfig(): MCPServerConfig {
    // Generate MCP config for Claude Desktop
    const config: MCPServerConfig = { mcpServers: {} };
    
    // Only include active tools
    const activeTools = this.tools.filter(tool => tool.status === 'active');
    
    for (const tool of activeTools) {
      if (tool.clientId) {
        // Add tool to config
        config.mcpServers[tool.clientId] = {
          command: this.getToolCommand(tool),
          args: this.getToolArgs(tool),
          env: tool.config,
        };
      }
    }
    
    return config;
  }
  
  private getToolCommand(tool: MCPTool): string {
    // Determine the appropriate command based on tool source and type
    if (tool.source === 'github') {
      // For GitHub-based tools, we use npx for JavaScript/TypeScript and uvx for Python
      if (tool.sourceUrl.includes('/servers/')) {
        // For official MCP servers
        if (tool.sourceUrl.includes('/src/')) {
          const serverName = tool.sourceUrl.split('/src/')[1];
          
          // Determine if it's a Python or TypeScript server based on the repository structure
          try {
            // Check if this is a Python server
            const pythonPackageName = `mcp-server-${serverName}`;
            return 'uvx';
          } catch (error) {
            // Assume TypeScript if not Python
            return 'npx';
          }
        }
      }
      
      // Default to npx for other GitHub repositories
      return 'npx';
    }
    
    // Default to node for local JavaScript projects
    return 'node';
  }
  
  private getToolArgs(tool: MCPTool): string[] {
    // Build appropriate args based on the tool source and type
    if (tool.source === 'github') {
      if (tool.sourceUrl.includes('/servers/')) {
        // For official MCP servers
        if (tool.sourceUrl.includes('/src/')) {
          const serverName = tool.sourceUrl.split('/src/')[1];
          
          // Determine if it's a Python or TypeScript server
          try {
            // Check if this is a Python server
            const pythonPackageName = `mcp-server-${serverName}`;
            return [pythonPackageName];
          } catch (error) {
            // Assume TypeScript if not Python
            return ['-y', `@modelcontextprotocol/server-${serverName}`];
          }
        }
      }
      
      // For non-official GitHub repositories, use the repo URL
      const repoInfo = githubService.parseGitHubUrl(tool.sourceUrl);
      if (repoInfo) {
        return ['-y', `${repoInfo.owner}/${repoInfo.repo}`];
      }
    }
    
    // For local tools, just use the path to the local script
    return [path.join(this.serversPath, tool.id.toString(), 'index.js')];
  }
  
  async installFromGitHub(repoUrl: string, options: InstallOptions = {}): Promise<MCPTool> {
    try {
      // Parse GitHub URL to get owner and repo
      const repoInfo = githubService.parseGitHubUrl(repoUrl);
      if (!repoInfo) {
        throw new Error('Invalid GitHub repository URL');
      }
      
      // Get repository information from GitHub
      const repo = await githubService.getRepoInfo(repoInfo.owner, repoInfo.repo);
      
      // Create a client ID (unique identifier for the tool)
      const clientId = repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      // Create a new MCP tool
      const newTool: MCPTool = {
        id: Date.now(),
        name: options.name || repo.name,
        description: repo.description || '',
        source: 'github',
        sourceUrl: repoUrl,
        status: 'active',
        spaces: options.spaces || [],
        config: options.config || {},
        clientId,
      };
      
      // Add the tool to our list
      this.tools.push(newTool);
      
      // Save the updated tools list
      this.saveTools();
      
      // Update the Claude Desktop config file
      this.updateClaudeConfig();
      
      // Test the connection to make sure the tool is working
      await this.testMCPConnection(newTool);
      
      return newTool;
    } catch (error) {
      console.error('Error installing MCP tool from GitHub:', error);
      throw error;
    }
  }
  
  private async testMCPConnection(tool: MCPTool): Promise<boolean> {
    try {
      const command = this.getToolCommand(tool);
      const args = this.getToolArgs(tool);
      
      // Create a transport to test the connection
      const transport = new StdioClientTransport({
        command,
        args,
        env: tool.config,
      });
      
      // Create a client to test the connection
      const client = new Client({
        name: 'mcp-tool-tester',
        version: '1.0.0',
      });
      
      // Connect to the MCP server
      await client.connect(transport);
      
      // Disconnect after successful test
      await client.close();
      
      return true;
    } catch (error) {
      console.error(`Error testing MCP connection for ${tool.name}:`, error);
      // Update tool status to error
      tool.status = 'error';
      this.saveTools();
      throw error;
    }
  }
  
  private updateClaudeConfig() {
    // Update the Claude Desktop config file with the new MCP servers
    try {
      const configDir = path.dirname(this.configPath);
      const claudeConfigPath = path.join(configDir, 'claude_desktop_config.json');
      
      // Generate the MCP config
      const mcpConfig = this.generateMCPConfig();
      
      // Write the config file
      fs.writeFileSync(claudeConfigPath, JSON.stringify(mcpConfig, null, 2));
    } catch (error) {
      console.error('Error updating Claude Desktop config:', error);
      throw error;
    }
  }
  
  async startTool(id: number) {
    try {
      const tool = this.tools.find(tool => tool.id === id);
      if (!tool) {
        throw new Error(`MCP tool with ID ${id} not found`);
      }
      
      // Only start if the tool is not already running
      if (tool.processId && this.activeProcesses.has(tool.processId)) {
        return tool;
      }
      
      // Get the command and args
      const command = this.getToolCommand(tool);
      const args = this.getToolArgs(tool);
      
      // Spawn the process
      const process = spawn(command, args, {
        env: { ...process.env, ...tool.config },
        detached: true,
        stdio: 'ignore',
      });
      
      // Store the process ID
      tool.processId = process.pid;
      this.activeProcesses.set(process.pid, process);
      
      // Update the tool status
      tool.status = 'active';
      
      // Save the updated tools list
      this.saveTools();
      
      // Create a transport to the MCP server
      const transport = new StdioClientTransport({
        command,
        args,
        env: tool.config,
      });
      
      // Create a client to the MCP server
      const client = new Client({
        name: 'mcp-tool-manager',
        version: '1.0.0',
      });
      
      // Connect to the MCP server
      await client.connect(transport);
      
      // Store the client
      this.activeClients.set(tool.clientId || '', client);
      
      return tool;
    } catch (error) {
      console.error(`Error starting MCP tool with ID ${id}:`, error);
      throw error;
    }
  }
  
  async stopTool(id: number) {
    try {
      const tool = this.tools.find(tool => tool.id === id);
      if (!tool) {
        throw new Error(`MCP tool with ID ${id} not found`);
      }
      
      // Close the client if it exists
      if (tool.clientId && this.activeClients.has(tool.clientId)) {
        const client = this.activeClients.get(tool.clientId);
        await client?.close();
        this.activeClients.delete(tool.clientId);
      }
      
      // Kill the process if it exists
      if (tool.processId && this.activeProcesses.has(tool.processId)) {
        const process = this.activeProcesses.get(tool.processId);
        process.kill();
        this.activeProcesses.delete(tool.processId);
      }
      
      // Update the tool status
      tool.status = 'inactive';
      tool.processId = undefined;
      
      // Save the updated tools list
      this.saveTools();
      
      // Update the Claude Desktop config file
      this.updateClaudeConfig();
      
      return tool;
    } catch (error) {
      console.error(`Error stopping MCP tool with ID ${id}:`, error);
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
      
      const tool = this.tools[toolIndex];
      
      // Stop the tool if it's running
      if (tool.status === 'active') {
        await this.stopTool(id);
      }
      
      // Remove the tool from our list
      this.tools.splice(toolIndex, 1);
      
      // Save the updated tools list
      this.saveTools();
      
      // Update the Claude Desktop config file
      this.updateClaudeConfig();
      
      // Remove the tool directory if it exists
      const toolDir = path.join(this.serversPath, id.toString());
      if (fs.existsSync(toolDir)) {
        fs.rmSync(toolDir, { recursive: true, force: true });
      }
      
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
      
      // If changing from inactive to active, start the tool
      if (tool.status === 'inactive' && status === 'active') {
        return this.startTool(id);
      }
      
      // If changing from active to inactive, stop the tool
      if (tool.status === 'active' && status === 'inactive') {
        return this.stopTool(id);
      }
      
      // Otherwise, just update the status
      tool.status = status;
      
      // Save the updated tools list
      this.saveTools();
      
      // Update the Claude Desktop config file
      this.updateClaudeConfig();
      
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
      
      // Was the tool active?
      const wasActive = tool.status === 'active';
      
      // If the tool is active, stop it first
      if (wasActive) {
        await this.stopTool(id);
      }
      
      // Update the config
      tool.config = { ...tool.config, ...config };
      
      // Save the updated tools list
      this.saveTools();
      
      // Update the Claude Desktop config file
      this.updateClaudeConfig();
      
      // If the tool was active, restart it
      if (wasActive) {
        await this.startTool(id);
      }
      
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
      
      // Save the updated tools list
      this.saveTools();
      
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
  
  // Get tools for a specific space
  getToolsForSpace(space: string) {
    return this.tools.filter(tool => 
      tool.status === 'active' && tool.spaces.includes(space)
    );
  }
  
  // Check if all tools are working properly
  async checkToolsHealth() {
    const results = [];
    
    for (const tool of this.tools) {
      if (tool.status === 'active') {
        try {
          await this.testMCPConnection(tool);
          results.push({ id: tool.id, name: tool.name, healthy: true });
        } catch (error) {
          results.push({ id: tool.id, name: tool.name, healthy: false, error });
        }
      } else {
        results.push({ id: tool.id, name: tool.name, healthy: null, status: tool.status });
      }
    }
    
    return results;
  }
}

export default new MCPManager();
