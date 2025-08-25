import { PipedreamClient } from "@pipedream/sdk";

export interface MCPServer {
  id: string;
  name: string;
  description: string;
  app: string; // Pipedream app slug
  icon: string; // React-icons component name
  connected: boolean;
}

export interface ConnectTokenResponse {
  token: string;
  expiresAt: string;
  connectLinkUrl: string;
}

export interface AccountConnectionResponse {
  id: string;
  name: string;
  app: string;
  status: string;
  connectedAt: string;
}

class PipedreamService {
  private client: PipedreamClient | null = null;
  
  constructor() {
    // Don't initialize client in constructor to avoid external user ID error
  }

  // Initialize client when needed - for frontend, we don't need credentials
  private initializeClient(): PipedreamClient {
    if (!this.client && typeof window !== 'undefined') {
      // For frontend usage, initialize without credentials
      this.client = new PipedreamClient();
    }
    if (!this.client) {
      throw new Error('Pipedream client could not be initialized');
    }
    return this.client;
  }

  // Generate external user ID (in real app, this would be your user's ID)
  generateExternalUserId(): string {
    return crypto.randomUUID();
  }

  // Generate connect token (this would typically be called from your backend)
  async generateConnectToken(externalUserId: string): Promise<ConnectTokenResponse | null> {
    try {
      if (!externalUserId || externalUserId.trim() === '') {
        throw new Error('External user ID cannot be blank');
      }
      
      const response = await fetch('/api/pipedream/connect-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          external_user_id: externalUserId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate connect token');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating connect token:', error);
      return null;
    }
  }

  // Connect account using Pipedream SDK
  connectAccount(
    app: string, 
    token: string,
    onSuccess?: (account: AccountConnectionResponse) => void,
    onError?: (error: Error) => void
  ): void {
    try {
      const client = this.initializeClient();
      console.log(`🔄 Initiating connection for ${app}...`);
      
      // Use the exact pattern from Pipedream docs
      client.connectAccount({
        app: app, 
        token: token, 
        onSuccess: (account) => {
          console.log(`✅ Account successfully connected ${app}:`, account);
          onSuccess?.(account);
        },
        onError: (err) => {
          console.error(`❌ Connection error: ${err.message}`);
          onError?.(err);
        }
      });
    } catch (error) {
      console.error(`❌ Failed to connect ${app}:`, error);
      onError?.(error as Error);
    }
  }

  // Get connect link URL for redirect-based connection
  getConnectLinkUrl(connectLinkUrl: string, app: string): string {
    const url = new URL(connectLinkUrl);
    url.searchParams.set('app', app);
    return url.toString();
  }

  // Simulate backend API call to check connection status
  async checkConnectionStatus(app: string, externalUserId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/pipedream/connection-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app,
          external_user_id: externalUserId,
        }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.connected || false;
    } catch (error) {
      console.error('Error checking connection status:', error);
      return false;
    }
  }
}

// Major MCP servers available through Pipedream
export const MAJOR_MCP_SERVERS: MCPServer[] = [
  {
    id: "google-sheets",
    name: "Google Sheets",
    description: "Connect to Google Sheets to read, write, and manipulate spreadsheet data. Perfect for data analysis and reporting workflows.",
    app: "google_sheets",
    icon: "SiGooglesheets",
    connected: false
  },
  {
    id: "github",
    name: "GitHub",
    description: "Integrate with GitHub for repository management, issue tracking, and code collaboration workflows.",
    app: "github", 
    icon: "SiGithub",
    connected: false
  },
  {
    id: "notion",
    name: "Notion",
    description: "Connect to Notion for content management, database operations, and team collaboration features.",
    app: "notion",
    icon: "SiNotion", 
    connected: false
  },
  {
    id: "gmail",
    name: "Gmail",
    description: "Access Gmail for email automation, message processing, and communication workflows.",
    app: "gmail",
    icon: "SiGmail",
    connected: false
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "Integrate with OpenAI for AI-powered text generation, chat completions, and language processing.",
    app: "openai",
    icon: "SiOpenai",
    connected: false
  },
  {
    id: "slack",
    name: "Slack",
    description: "Connect to Slack for team communication, channel management, and notification workflows.",
    app: "slack",
    icon: "SiSlack",
    connected: false
  },
  {
    id: "linear",
    name: "Linear",
    description: "Integrate with Linear for issue tracking, project management, and development workflow automation.",
    app: "linear",
    icon: "SiLinear",
    connected: false
  },
  {
    id: "airtable",
    name: "Airtable",
    description: "Connect to Airtable for database operations, record management, and collaborative data workflows.",
    app: "airtable",
    icon: "SiAirtable", 
    connected: false
  }
];

export const pipedreamService = new PipedreamService();