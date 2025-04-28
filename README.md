# Claude for Productiv

A custom Claude client application designed to provide team-specific AI capabilities through a space-based architecture. This application allows different teams (CSM, Sales, Engineering, etc.) to access Claude with specialized MCP tools tailored to their specific needs, all managed centrally through an intuitive GUI that integrates with GitHub for MCP tool installation.

## Features

- Space-based architecture for team-specific AI workflows
- Centralized MCP tool management with GitHub integration
- Admin console for system configuration
- User-based access control
- Team-specific conversation history and context

## Architecture

The system architecture consists of four primary layers:

1. **Frontend Application (User Interface Layer)**
   - React/TypeScript web application
   - Space selection and management
   - Claude chat interface with MCP tool integration
   - Admin console for system configuration

2. **Backend Services**
   - User authentication and authorization
   - Space management and configuration
   - MCP server registry and management
   - API gateway for Claude and MCP interactions

3. **Integration Layer**
   - Claude API integration
   - GitHub API for MCP tool installation
   - MCP server communication protocols
   - API connectors for various services

4. **External Services**
   - Claude API (Anthropic)
   - GitHub repositories (public and private)
   - MCP servers (installed and managed)
   - Additional services as needed

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Access to Claude API
- GitHub account for MCP tool repositories

### Installation

```bash
# Clone the repository
git clone https://github.com/jamesmcarthur-3999/productiv-client.git
cd productiv-client

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys and configuration

# Start the development server
npm run dev
```

## License

This project is private and proprietary.
