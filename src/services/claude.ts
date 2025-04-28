import axios from 'axios';
import { Anthropic } from '@anthropic-ai/sdk';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ClaudeOptions {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
}

class ClaudeService {
  private apiKey: string | null = null;
  private client: Anthropic | null = null;
  private baseURL = 'https://api.anthropic.com';
  private apiVersion = '2023-06-01';
  private defaultOptions: ClaudeOptions = {
    model: 'claude-3-opus-20240229',
    temperature: 0.7,
    maxTokens: 4096,
  };

  constructor() {
    // Try to get API key from environment variables
    this.apiKey = import.meta.env.VITE_CLAUDE_API_KEY || null;
    
    if (this.apiKey) {
      this.client = new Anthropic({
        apiKey: this.apiKey,
      });
    } else {
      console.warn('Claude API key not found in environment variables.');
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new Anthropic({
      apiKey: this.apiKey,
    });
  }

  updateDefaultOptions(options: Partial<ClaudeOptions>) {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  async sendMessage(messages: ChatMessage[], options?: Partial<ClaudeOptions>): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Claude API key not set. Please provide an API key in the settings.');
    }

    const mergedOptions = { ...this.defaultOptions, ...options };
    
    try {
      // Using the Anthropic SDK for sending messages
      if (this.client) {
        const response = await this.client.messages.create({
          model: mergedOptions.model,
          messages: this.formatMessagesForAPI(messages),
          system: mergedOptions.systemPrompt,
          temperature: mergedOptions.temperature,
          max_tokens: mergedOptions.maxTokens,
        });
        
        return response.content[0].text;
      }
      
      // Fallback to direct API call if client isn't initialized
      const response = await axios.post(
        `${this.baseURL}/v1/messages`,
        {
          model: mergedOptions.model,
          messages: this.formatMessagesForAPI(messages),
          system: mergedOptions.systemPrompt,
          temperature: mergedOptions.temperature,
          max_tokens: mergedOptions.maxTokens,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': this.apiVersion,
          },
        }
      );

      return response.data.content[0].text;
    } catch (error) {
      console.error('Error sending message to Claude:', error);
      throw error;
    }
  }

  async streamMessage(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    options?: Partial<ClaudeOptions>
  ): Promise<void> {
    if (!this.apiKey) {
      throw new Error('Claude API key not set. Please provide an API key in the settings.');
    }

    const mergedOptions = { ...this.defaultOptions, ...options };
    
    try {
      // Using Anthropic SDK for streaming responses
      if (this.client) {
        const stream = await this.client.messages.create({
          model: mergedOptions.model,
          messages: this.formatMessagesForAPI(messages),
          system: mergedOptions.systemPrompt,
          temperature: mergedOptions.temperature,
          max_tokens: mergedOptions.maxTokens,
          stream: true,
        });

        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.text) {
            onChunk(chunk.delta.text);
          }
        }
        
        return;
      }
      
      // Fallback to direct API call if client isn't initialized
      const response = await axios.post(
        `${this.baseURL}/v1/messages`,
        {
          model: mergedOptions.model,
          messages: this.formatMessagesForAPI(messages),
          system: mergedOptions.systemPrompt,
          temperature: mergedOptions.temperature,
          max_tokens: mergedOptions.maxTokens,
          stream: true,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': this.apiVersion,
          },
          responseType: 'stream',
        }
      );

      const stream = response.data;
      
      return new Promise((resolve, reject) => {
        let buffer = '';
        
        stream.on('data', (chunk: Buffer) => {
          const chunkStr = chunk.toString();
          buffer += chunkStr;
          
          let newlineIndex;
          while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);
            
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                
                if (parsed.type === 'content_block_delta' && parsed.delta && parsed.delta.text) {
                  onChunk(parsed.delta.text);
                }
              } catch (e) {
                console.error('Error parsing JSON from stream:', e);
              }
            }
          }
        });
        
        stream.on('end', resolve);
        stream.on('error', reject);
      });
    } catch (error) {
      console.error('Error streaming message from Claude:', error);
      throw error;
    }
  }

  private formatMessagesForAPI(messages: ChatMessage[]) {
    return messages.map(message => ({
      role: message.role,
      content: [{ type: 'text', text: message.content }]
    }));
  }

  // Helper method to get available Claude models
  getAvailableModels() {
    return [
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most powerful model for complex tasks' },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', description: 'Balanced performance and speed' },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', description: 'Fastest model for simpler tasks' },
      { id: 'claude-3.5-sonnet-20240620', name: 'Claude 3.5 Sonnet', description: 'Enhanced reasoning capabilities' },
      { id: 'claude-3.7-sonnet-20250219', name: 'Claude 3.7 Sonnet', description: 'Latest model with extended knowledge' },
    ];
  }
}

export default new ClaudeService();
