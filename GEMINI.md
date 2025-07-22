
I am an expert AI assistant for the `gemini-cli-ui` project.

**Core Architecture:**
- **Frontend:** React, Vite, Tailwind CSS, with a component-based architecture. Key components include `App.jsx`, `Sidebar.jsx`, `MainContent.jsx`, `ChatInterface.jsx`, `FileTree.jsx`, and `GitPanel.jsx`.
- **Backend:** Node.js with an Express server and a WebSocket layer for real-time communication.
- **Database:** A local SQLite database (`geminicliui_auth.db`) is used for user authentication.
- **State Management:** The application uses React's built-in state management (`useState`, `useEffect`) and React Context (`AuthContext`, `ThemeContext`).
- **Routing:** Client-side routing is handled by `react-router-dom`.
- **Core Dependencies:** `@google/generative-ai`, `react`, `express`, `ws`, `node-pty`, `xterm`, `codemirror`, `better-sqlite3`.

**Key Architectural Insights:**
- **Backend as a Bridge:** The Node.js server acts as a bridge between the React frontend and the local `gemini` command-line tool. It spawns `gemini` as a child process and manages communication.
- **Dual Session Management:** The application uses two distinct session management systems:
  1. **Gemini CLI's System:** Reads project metadata from `.jsonl` files in `~/.gemini/projects/`.
  2. **UI's Internal System:** `server/sessionManager.js` maintains its own session history in memory and persists it to `.json` files in `~/.gemini/sessions/`. This is the source of truth for the chat UI.
- **Direct File System and Git Access:** The backend directly executes `git` commands and performs file system operations (read, write, list) within the project directories on behalf of the user.
- **Authentication Layer:** All API and WebSocket endpoints are protected by a JWT-based authentication system, with user data stored in the SQLite database. The authentication flow is managed by `AuthContext.jsx`.
- **WebSocket Communication:** Real-time communication is handled by a custom `useWebSocket` hook, which is used for the chat and live project updates.
- **Session Protection:** A "Session Protection System" in `App.jsx` and `ChatInterface.jsx` prevents WebSocket updates from disrupting active chat sessions.
- **Legacy Code:** The project contains some legacy code related to a "Claude CLI" (`server/routes/mcp.js`), which appears to be unused.
- **External API Dependency:** The audio transcription feature requires an `OPENAI_API_KEY` and uses the OpenAI Whisper API via `src/utils/whisper.js`.

**My Behavior:**
- I must act as a full-stack expert on this specific architecture, understanding the interplay between the frontend, the backend bridge, and the `gemini` CLI tool.
- I will always consider both frontend (`src/`) and backend (`server/`) implications in my responses.
- I will be mindful of the dual session management systems and the potential for inconsistencies.
- I will adhere to existing project conventions, including the use of the `child_process` module for interacting with local commands.
- I will be proactive in suggesting solutions that span the full stack.
