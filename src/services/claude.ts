import { Anthropic } from '@anthropic-ai/sdk';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

class ClaudeService {
  private anthropic: Anthropic | null = null;
  private apiKey: string | null = null;
  private model: string = 'claude-3-opus-20240229'; // Default model

  constructor() {
    this.apiKey = import.meta.env.VITE_CLAUDE_API_KEY || null;
    this.initialize();
  }

  private initialize() {
    if (this.apiKey) {
      this.anthropic = new Anthropic({
        apiKey: this.apiKey,
      });
    } else {
      console.warn('Claude API key not provided. Claude service will not function properly.');
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    this.initialize();
  }

  setModel(model: string) {
    this.model = model;
  }

  async sendMessage(messages: ChatMessage[], spaceId?: number): Promise<string> {
    if (!this.anthropic) {
      throw new Error('Claude client not initialized. API key may be missing.');
    }

    try {
      // Convert our messages to Anthropic's format
      const formattedMessages = this.formatMessagesForAPI(messages);

      // Create a system prompt that includes space context if available
      const systemPrompt = this.createSystemPrompt(spaceId);

      // Send the message to Claude API
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 4096,
        messages: formattedMessages,
        system: systemPrompt,
      });

      return response.content[0].text;
    } catch (error) {
      console.error('Error sending message to Claude:', error);
      throw error;
    }
  }

  async streamMessage(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    spaceId?: number
  ): Promise<void> {
    if (!this.anthropic) {
      throw new Error('Claude client not initialized. API key may be missing.');
    }

    try {
      // Convert our messages to Anthropic's format
      const formattedMessages = this.formatMessagesForAPI(messages);

      // Create a system prompt that includes space context if available
      const systemPrompt = this.createSystemPrompt(spaceId);

      // Send the message to Claude API with streaming enabled
      const stream = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 4096,
        messages: formattedMessages,
        system: systemPrompt,
        stream: true,
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.text) {
          onChunk(chunk.delta.text);
        }
      }
    } catch (error) {
      console.error('Error streaming message from Claude:', error);
      throw error;
    }
  }

  // Helper function to format messages for the Anthropic API
  private formatMessagesForAPI(messages: ChatMessage[]) {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  // Helper function to create a system prompt based on space context
  private createSystemPrompt(spaceId?: number): string {
    let basePrompt = "You are Claude, a helpful AI assistant integrated into a custom client application called 'Claude for Productiv'. ";
    
    // Add space context if available
    if (spaceId) {
      basePrompt += "You are currently in a specialized space with access to specific MCP tools tailored for this team's needs. ";
    }
    
    basePrompt += "Be helpful, concise, and professional in your responses.";
    
    return basePrompt;
  }
  
  // Method to integrate MCP tools with Claude
  async sendMessageWithMCPTools(
    messages: ChatMessage[], 
    tools: any[], 
    spaceId?: number
  ): Promise<string> {
    if (!this.anthropic) {
      throw new Error('Claude client not initialized. API key may be missing.');
    }

    try {
      // Convert our messages to Anthropic's format
      const formattedMessages = this.formatMessagesForAPI(messages);
      
      // Create a system prompt that includes space context if available
      const systemPrompt = this.createSystemPrompt(spaceId);
      
      // Format tools for Claude API according to Model Context Protocol
      const formattedTools = tools.map(tool => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema,
      }));
      
      // Send the message to Claude API with tools
      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 4096,
        messages: formattedMessages,
        system: systemPrompt,
        tools: formattedTools,
      });
      
      // Handle tool use response
      if (response.content[0].type === 'tool_use') {
        // Handle tool use implementation
        // This would interact with the MCP server
        console.log('Tool use requested:', response.content[0]);
        return 'Tool use implementation pending...';
      }
      
      return response.content[0].text;
    } catch (error) {
      console.error('Error sending message with MCP tools to Claude:', error);
      throw error;
    }
  }
}

export default new ClaudeService();
