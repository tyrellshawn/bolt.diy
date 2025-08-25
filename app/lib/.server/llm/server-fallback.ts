/**
 * Server fallback utilities for detecting when development servers haven't started
 * and providing prompts to start them for smaller models
 */

export interface ServerStatus {
  hasActiveServer: boolean;
  lastActionTime: number;
  lastStartCommand: string | null;
}

/**
 * Tracks server status to detect when a start command should be suggested
 */
export class ServerStatusTracker {
  private static _instance: ServerStatusTracker;
  private _serverStatus: Map<string, ServerStatus> = new Map();

  static getInstance(): ServerStatusTracker {
    if (!ServerStatusTracker._instance) {
      ServerStatusTracker._instance = new ServerStatusTracker();
    }

    return ServerStatusTracker._instance;
  }

  /**
   * Records that an action was performed (file creation/modification)
   */
  recordAction(sessionId: string): void {
    const status = this._serverStatus.get(sessionId) || {
      hasActiveServer: false,
      lastActionTime: 0,
      lastStartCommand: null,
    };

    status.lastActionTime = Date.now();
    this._serverStatus.set(sessionId, status);
  }

  /**
   * Records that a start command was executed
   */
  recordStartCommand(sessionId: string, command: string): void {
    const status = this._serverStatus.get(sessionId) || {
      hasActiveServer: false,
      lastActionTime: 0,
      lastStartCommand: null,
    };

    status.hasActiveServer = true;
    status.lastStartCommand = command;
    this._serverStatus.set(sessionId, status);
  }

  /**
   * Checks if a start command should be suggested based on recent activity
   */
  shouldSuggestStart(sessionId: string): boolean {
    const status = this._serverStatus.get(sessionId);

    if (!status) {
      return false;
    }

    const timeSinceLastAction = Date.now() - status.lastActionTime;
    const hasRecentActivity = timeSinceLastAction < 30000; // 30 seconds

    return hasRecentActivity && !status.hasActiveServer;
  }

  /**
   * Gets a suggested start command based on the session context
   */
  getSuggestedStartCommand(sessionId: string): string {
    const status = this._serverStatus.get(sessionId);

    if (status?.lastStartCommand) {
      return status.lastStartCommand;
    }

    // Default start commands based on common patterns
    return 'npm run dev';
  }

  /**
   * Resets server status (e.g., when server is detected as stopped)
   */
  resetServerStatus(sessionId: string): void {
    const status = this._serverStatus.get(sessionId);

    if (status) {
      status.hasActiveServer = false;
      this._serverStatus.set(sessionId, status);
    }
  }
}

/**
 * Generates a fallback prompt to remind the model to start the server
 */
export function generateServerStartReminder(suggestedCommand: string): string {
  return `
IMPORTANT REMINDER: The development server needs to be started to preview your application.

Please add a start action to run the development server:

<boltAction type="start">
${suggestedCommand}
</boltAction>

This will launch the preview so users can see the application running.
`.trim();
}

/**
 * Analyzes response content to detect if start commands are missing
 */
export function detectMissingStartCommand(responseContent: string): boolean {
  // Check if response contains file actions but no start action
  const hasFileActions = /<boltAction\s+type="file"/.test(responseContent);
  const hasShellActions = /<boltAction\s+type="shell"/.test(responseContent);
  const hasStartAction = /<boltAction\s+type="start"/.test(responseContent);

  // If there are file or shell actions but no start action, it might be missing
  return (hasFileActions || hasShellActions) && !hasStartAction;
}

/**
 * Extracts start commands from response content
 */
export function extractStartCommands(responseContent: string): string[] {
  const startActionRegex = /<boltAction\s+type="start"[^>]*>([\s\S]*?)<\/boltAction>/g;
  const commands: string[] = [];
  let match;

  while ((match = startActionRegex.exec(responseContent)) !== null) {
    const command = match[1].trim();

    if (command) {
      commands.push(command);
    }
  }

  return commands;
}
