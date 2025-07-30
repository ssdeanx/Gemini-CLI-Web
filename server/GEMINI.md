# Gemini CLI UI - Server Architecture

This directory contains the core backend logic for the Gemini CLI UI. The server is a Node.js application that acts as a bridge between the React frontend and the local user environment, providing APIs for file system access, Git operations, and interaction with the `gemini` command-line tool.

## Core Responsibilities

*   **API Server:** Exposes a RESTful API for the frontend to manage projects, sessions, files, and Git repositories.
*   **WebSocket Gateway:** Provides real-time, bidirectional communication for the chat interface, interactive shell, and live project updates.
*   **Gemini CLI Bridge:** Spawns and manages the `gemini` CLI as a child process, handling command execution, I/O streaming, and session context.
*   **Authentication Layer:** Secures all endpoints using a JWT-based authentication system powered by a local SQLite database.
*   **Session Management:** Implements a dual-session system to maintain both UI-specific chat history and interact with the Gemini CLI's native session files.

## Architecture Diagram

```mermaid
graph TD
    subgraph Frontend
        A[React App]
    end

    subgraph Backend (Node.js)
        B[Express Server] --> C{API Routes}
        C --> D[Auth Middleware]
        C --> E[Git Routes]
        C --> F[Project/Session Routes]
        C --> G[File System Routes]

        H[WebSocket Server] --> I[Chat Handler]
        H --> J[Shell Handler]

        I --> K[Gemini CLI Bridge]
        J --> L[Interactive Shell]

        K --> M[Session Manager]
        F --> M
        F --> N[Project Manager]

        D --> O[SQLite DB]
    end

    subgraph Local System
        P[Gemini CLI Process]
        Q[User Files & Git Repo]
        R[~/.gemini/]
    end

    A -- HTTP/S --> B
    A -- WebSocket --> H

    E -- git commands --> Q
    G -- fs operations --> Q
    L -- spawns --> Q

    K -- spawns --> P
    N -- reads --> R
    M -- R/W --> R
```

## File & Directory Overview

### `index.js`

This is the main entry point for the Node.js server. It initializes the Express app, the WebSocket server, and all API routes.

*   **Express & Middleware:** Sets up an Express server with `cors` and `express.json()` middleware. It also integrates a custom middleware for API key validation (`validateApiKey`) if configured.
*   **Static File Serving:** Serves the built React frontend from the `../dist` directory.
*   **API Routes:** Mounts routers for authentication (`/api/auth`), Git operations (`/api/git`), and MCP server management (`/api/mcp`). It also defines core API endpoints for managing projects, sessions, and files.
*   **WebSocket Server (`ws`):** Initializes a single WebSocket server that handles multiple paths (`/ws` for chat, `/shell` for the interactive terminal). It uses `authenticateWebSocket` middleware to secure connections.
*   **File System Watcher (`chokidar`):** Monitors the `~/.gemini/projects` directory for changes (new sessions, etc.) and broadcasts `projects_updated` messages to all connected clients via WebSockets, ensuring the UI stays in sync.
*   **Shell Integration (`node-pty`):** Provides a fully interactive terminal experience for the frontend by spawning a shell process and relaying input/output over the `/shell` WebSocket connection.
*   **Audio Transcription:** Includes an endpoint (`/api/transcribe`) that uses the OpenAI Whisper API to convert speech to text, with optional AI-powered enhancement for generating clearer prompts or instructions.

### `gemini-cli.js`

This module is the heart of the backend's interaction with the local `gemini` CLI. It acts as a sophisticated bridge, enabling the web UI to execute complex, multi-step workflows.

*   **Process Spawning:** Uses `child_process.spawn` to run the `gemini` CLI tool with the necessary commands, flags, and options passed from the frontend.
*   **Real-time Output Streaming:** Captures `stdout` and `stderr` from the `gemini` process and streams the output back to the frontend via WebSockets in real-time, allowing users to see the agent's progress.
*   **Contextual Prompt Building:** Works with `sessionManager.js` to build a conversation history context that is passed to the CLI with each command, enabling long-horizon reasoning.
*   **Process Management:** Tracks active `gemini` processes in a `Map`, allowing them to be aborted from the UI via the `abortGeminiSession` function.
*   **Image Handling:** Manages temporary image files for Gemini's vision capabilities. It saves base64-encoded images from the frontend to temporary files and passes their paths to the `gemini` CLI.
*   **Specification Generation:** Exports a `getGeminiSpec` function that utilizes the CLI to generate feature specifications based on a given context.

### `projects.js`

This module is responsible for all project-related data and metadata management. It interacts directly with the Gemini CLI's file structure in `~/.gemini/projects`.

*   **Project Discovery & Parsing:** Reads the `~/.gemini/projects` directory to find all available projects. It parses the `.jsonl` session files within each project to extract critical metadata, most importantly the actual working directory (`cwd`) of the project.
*   **Directory Extraction:** Implements a robust `extractProjectDirectory` function that intelligently determines the correct project path from session data, with caching for performance.
*   **Display Name Generation:** Generates user-friendly display names for projects, preferring the `name` from a project's `package.json` file and falling back to a shortened path format.
*   **Project Management:** Provides functions for renaming (`renameProject`), deleting (`deleteProject`), and manually adding (`addProjectManually`) projects by updating a central `~/.gemini/project-config.json` file.

### `sessionManager.js`

This module manages the chat session history specifically for the web UI, providing a more structured and persistent conversation store. This creates a "dual session" system to decouple the UI's state from the CLI's state.

*   **Dual Session System:**
    *   **UI Sessions:** Manages conversations in a structured format, persisting them to individual `.json` files in `~/.gemini/sessions/`. This ensures a reliable and fast-loading chat history for the frontend.
    *   **CLI Sessions:** Interacts with the CLI's native `.jsonl` files (via `projects.js`) to understand project structure but relies on its own `.json` files for displaying chat content.
*   **In-Memory & Persistent Storage:** Keeps an in-memory `Map` of all active UI sessions and their messages for quick access, while writing to `.json` files for persistence.
*   **Context Building:** Provides the `buildConversationContext` method, which constructs the conversational history string passed to `gemini-cli.js`. This is the key mechanism that gives the CLI "memory" of the UI chat.
*   **Session Lifecycle:** Provides methods for creating, retrieving, adding messages to, and deleting UI sessions.

### `database/`

*   **`db.js`:** Configures and initializes the connection to a local SQLite database (`geminicliui_auth.db`) using `better-sqlite3`. It exports the database connection instance (`db`) and a `userDb` object containing all user-related database operations (e.g., `createUser`, `getUserByUsername`).
*   **`init.sql`:** Contains the SQL schema for the authentication database. It defines the `geminicliui_users` table, which stores user credentials for the UI's authentication system.

### `middleware/`

*   **`auth.js`:** Contains all authentication-related middleware.
    *   `validateApiKey`: An optional middleware to protect the API with a static API key.
    *   `authenticateToken`: A JWT middleware that verifies the `Authorization` header for all protected API routes.
    *   `generateToken`: A function to create JWTs upon successful login or registration.
    *   `authenticateWebSocket`: A function to verify the JWT passed in the query parameters of a WebSocket connection request.

### `routes/`

*   **`auth.js`:** Defines the public-facing authentication endpoints:
    *   `GET /api/auth/status`: Checks if a user account has been created.
    *   `POST /api/auth/register`: Creates the initial user account (only if no users exist).
    *   `POST /api/auth/login`: Authenticates a user and returns a JWT.
*   **`git.js`:** Provides a comprehensive set of API endpoints for interacting with Git repositories within a project. It uses `child_process.exec` to run `git` commands.
    *   **Security:** All routes are protected and require a valid project context. It uses internal helper functions like `getActualProjectPath` and `validateGitRepository` to ensure operations are safe and targeted to the correct directory.
    *   **Endpoints:** Includes `status`, `diff`, `commit`, `branch` management, `fetch`, `pull`, and `push`.
*   **`mcp.js`:** Contains legacy API routes for interacting with the **Claude CLI** (not Gemini) for Multi-Cloud Provider (MCP) server management. This functionality appears to be separate from the core Gemini integration.