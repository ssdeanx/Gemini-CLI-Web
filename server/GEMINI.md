# Gemini CLI UI - Server

This directory contains the core backend logic for the Gemini CLI UI.

**For more information, see the detailed documentation for each subdirectory:**

*   [Database](./database/GEMINI.md)
*   [Middleware](./middleware/GEMINI.md)
*   [Routes](./routes/GEMINI.md)

## File Overview

### `index.js`

-   **Purpose:** The main entry point for the Node.js server. It initializes the Express app, WebSocket server, and all API routes.
-   **Core Functionality:**
    -   **Express Server:** Handles all HTTP requests.
    -   **WebSocket Server (`ws`):** Manages real-time communication for the chat interface and interactive shell.
    -   **API Routes:** Defines endpoints for managing projects, sessions, files, and Git operations.
    -   **Static File Serving:** Serves the built React frontend.
    -   **Authentication:** Integrates JWT-based authentication middleware to protect routes.
    -   **File System Watcher:** Uses `chokidar` to watch for changes in the `~/.gemini/projects` directory and notifies clients of updates.
    -   **Shell Integration:** Provides an interactive terminal via `node-pty`.
    -   **Audio Transcription:** Includes an endpoint (`/api/transcribe`) that uses the OpenAI Whisper API to convert speech to text.

### `gemini-cli.js`

-   **Purpose:** Acts as a bridge between the web UI and the local `gemini` command-line tool.
-   **Core Functionality:**
    -   **Spawning Processes:** Uses `child_process.spawn` to run the `gemini` CLI with the necessary commands and options.
    -   **Real-time Output:** Captures `stdout` and `stderr` from the Gemini CLI and streams the output back to the frontend via WebSockets.
    -   **Session Management:** Works with `sessionManager.js` to build and pass conversation history to the CLI.
    -   **Process Control:** Manages active Gemini processes, allowing them to be aborted from the UI.
    -   **Image Handling:** Processes and provides image files to the Gemini CLI for vision-related tasks.

### `projects.js`

-   **Purpose:** Manages project-related data and metadata by interacting with the Gemini CLI's file structure.
-   **Core Functionality:**
    -   **Project Discovery:** Reads the `~/.gemini/projects` directory to find and list all available Gemini projects.
    -   **Session Parsing:** Parses `.jsonl` session files to extract project details, such as the actual working directory.
    -   **Display Names:** Generates user-friendly display names for projects, often by reading the `package.json` file.
    -   **Project Management:** Provides functions for renaming, deleting, and manually adding projects.

### `sessionManager.js`

-   **Purpose:** Manages the chat session history for the UI, providing a more structured way to handle conversations than the raw `.jsonl` files.
-   **Core Functionality:**
    -   **In-Memory Storage:** Keeps a map of all active sessions and their messages.
    -   **Persistence:** Saves session data to `.json` files in the `~/.gemini/sessions` directory.
    -   **Context Building:** Creates the conversation context that is passed to the `gemini` CLI, enabling it to have a memory of the ongoing conversation.
    -   **Session Operations:** Provides methods for creating, retrieving, and deleting sessions.
