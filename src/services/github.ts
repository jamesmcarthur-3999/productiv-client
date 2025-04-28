import { Octokit } from '@octokit/rest';

interface MCPTool {
  name: string;
  description: string;
  repoUrl: string;
  installInstructions?: string;
  configOptions?: string[];
}

class GitHubService {
  private octokit: Octokit | null = null;
  private token: string | null = null;

  constructor() {
    this.token = import.meta.env.VITE_GITHUB_TOKEN || null;
    this.initialize();
  }

  private initialize() {
    if (this.token) {
      this.octokit = new Octokit({ auth: this.token });
    } else {
      console.warn('GitHub token not provided. GitHub service will not function properly.');
    }
  }

  setToken(token: string) {
    this.token = token;
    this.initialize();
  }

  async searchMCPTools(query: string = 'topic:mcp-server') {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized. Token may be missing.');
    }

    try {
      const response = await this.octokit.search.repos({
        q: query,
        sort: 'updated',
        order: 'desc',
        per_page: 100,
      });

      return response.data.items.map(repo => ({
        name: repo.name,
        description: repo.description || '',
        repoUrl: repo.html_url,
        owner: repo.owner?.login || '',
        stars: repo.stargazers_count,
        lastUpdated: repo.updated_at,
      }));
    } catch (error) {
      console.error('Error searching GitHub repositories:', error);
      throw error;
    }
  }

  async getOfficialMCPServers() {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized. Token may be missing.');
    }

    try {
      const response = await this.octokit.repos.getContent({
        owner: 'modelcontextprotocol',
        repo: 'servers',
        path: 'src',
      });

      if (!Array.isArray(response.data)) {
        throw new Error('Expected an array of content items');
      }

      return response.data.map(item => ({
        name: item.name,
        path: item.path,
        url: item.html_url,
        type: 'directory',
      }));
    } catch (error) {
      console.error('Error getting official MCP servers:', error);
      throw error;
    }
  }

  async getRepositoryContents(owner: string, repo: string, path: string = '') {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized. Token may be missing.');
    }

    try {
      const response = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
      });

      return response.data;
    } catch (error) {
      console.error('Error getting repository contents:', error);
      throw error;
    }
  }

  async getRepoInfo(owner: string, repo: string) {
    if (!this.octokit) {
      throw new Error('GitHub client not initialized. Token may be missing.');
    }

    try {
      const response = await this.octokit.repos.get({
        owner,
        repo,
      });

      return response.data;
    } catch (error) {
      console.error('Error getting repository info:', error);
      throw error;
    }
  }

  parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    try {
      const githubRegex = /github\.com\/([\w.-]+)\/([\w.-]+)(?:\.git|\/?)$/;
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
  }
}

export default new GitHubService();
