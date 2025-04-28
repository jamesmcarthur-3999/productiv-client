// MCP Tool utility functions

/**
 * Represents the configuration for an MCP tool
 */
interface MCPToolConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

/**
 * Generates Claude Desktop compatible MCP server configuration
 * for a JSON config file
 * 
 * @param tools - Object with tool name keys and configuration values
 * @returns Formatted JSON string with proper indentation
 */
export const generateMCPConfig = (tools: Record<string, MCPToolConfig>): string => {
  const config = {
    mcpServers: tools,
  };
  
  return JSON.stringify(config, null, 2);
};

/**
 * Parses GitHub URL to extract owner and repo information
 * 
 * @param url - GitHub repository URL
 * @returns Object with owner and repo properties, or null if invalid URL
 */
export const parseGitHubUrl = (url: string): { owner: string; repo: string } | null => {
  try {
    const githubRegex = /github\.com\/([\w.-]+)\/([\w.-]+)(?:\.git|\/?|$)/;
    const match = url.match(githubRegex);
    
    if (match && match.length >= 3) {
      return {
        owner: match[1],
        repo: match[2],
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing GitHub URL:', error);
    return null;
  }
};

/**
 * Creates shell command for installing an MCP tool
 * 
 * @param tool - Configuration for the MCP tool
 * @returns Command string to be executed in a shell
 */
export const createInstallCommand = (tool: MCPToolConfig): string => {
  let command = `${tool.command} ${tool.args.join(' ')}`;
  
  if (tool.env) {
    const envVars = Object.entries(tool.env)
      .map(([key, value]) => `${key}=${value}`)
      .join(' ');
    
    command = `${envVars} ${command}`;
  }
  
  return command;
};

/**
 * Validates an MCP tool repository to ensure it has required files and structure
 * 
 * @param repoFiles - List of file paths in the repository
 * @returns Object with validation result and any errors
 */
export const validateMCPRepository = (repoFiles: string[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check for package.json or other required files
  if (!repoFiles.includes('package.json') && !repoFiles.includes('index.js')) {
    errors.push('Repository must contain package.json or index.js');
  }
  
  // Check for README or documentation
  if (!repoFiles.some(file => file.toLowerCase().includes('readme'))) {
    errors.push('Repository should include a README file');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Checks if a port is available for use by an MCP server
 * 
 * @param port - Port number to check
 * @returns Promise resolving to true if port is available, false if in use
 */
export const isPortAvailable = async (port: number): Promise<boolean> => {
  // In a real application, this would check if a port is in use
  // For this simplified implementation, we'll just return true
  return true;
};

/**
 * Generates a random available port for an MCP server
 * 
 * @param min - Minimum port number (default: 3000)
 * @param max - Maximum port number (default: 9000)
 * @returns Promise resolving to available port number
 */
export const getRandomPort = async (min: number = 3000, max: number = 9000): Promise<number> => {
  const port = Math.floor(Math.random() * (max - min + 1)) + min;
  
  if (await isPortAvailable(port)) {
    return port;
  }
  
  return getRandomPort(min, max); // Try again with a different port
};
