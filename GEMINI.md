# Gemini CLI Web UI Architecture

**Overview:**
The Gemini CLI Web UI is a full-stack application designed to provide a rich, interactive web interface for the Gemini Command Line Interface (CLI) tool. It acts as a bridge, enabling users to interact with the Gemini CLI, manage projects, edit files, and track Git changes directly from their browser. The architecture emphasizes real-time communication, robust authentication, and a modular component structure for maintainability and scalability.

**Quick Links:**

*   [Backend Architecture](./server/GEMINI.md)
*   [Frontend Architecture](./src/GEMINI.md)
*   [Configuration](./documentation/configuration.md)
*   [Checkpointing](./documentation/checkpointing.md)
*   [Deployment](./documentation/deployment.md)
*   [Extensions](./documentation/extension.md)
*   [Keyboard Shortcuts](./documentation/keyboard-shortcuts.md)
*   [Memory Import Processor](./documentation/memport.md)
*   [Proxy Script](./documentation/proxy-script.md)
*   [Sandboxing](./documentation/sandbox.md)
*   [Telemetry](./documentation/telemetry.md)
*   [Tools API](./documentation/tools-api.md)
*   [Troubleshooting](./documentation/troubleshooting.md)

## Architecture Diagram

```mermaid
graph TD
    subgraph User
        A[User]
    end

    subgraph Browser (Frontend)
        subgraph "React UI Components"
            App(App.jsx)
            MainContent(MainContent.jsx)
            Sidebar(Sidebar.jsx)
            ChatInterface(ChatInterface.jsx)
            EditorTab(EditorTab.jsx)
            GitPanel(GitPanel.jsx)
            Shell(Shell.jsx)
            ChatSidebar(ChatSidebar.jsx)
            CodeEditor(CodeEditor.jsx)
            CodeTabs(CodeTabs.jsx)
            DarkModeToggle(DarkModeToggle.jsx)
            EditorFileTree(EditorFileTree.jsx)
            ErrorBoundary(ErrorBoundary.jsx)
            FileTree(FileTree.jsx)
            GeminiLogo(GeminiLogo.jsx)
            GeminiStatus(GeminiStatus.jsx)
            ImageViewer(ImageViewer.jsx)
            LoginForm(LoginForm.jsx)
            MicButton(MicButton.jsx)
            MobileNav(MobileNav.jsx)
            NewCodeEditor(NewCodeEditor.jsx)
            ProtectedRoute(ProtectedRoute.jsx)
            QuickSettingsPanel(QuickSettingsPanel.jsx)
            SetupForm(SetupForm.jsx)
            TodoList(TodoList.jsx)
            ToolsSettings(ToolsSettings.jsx)
            SpecDesign(SpecDesign.jsx)
            ProgressIndicator(ProgressIndicator.jsx)
            ThinkingIndicator(ThinkingIndicator.jsx)
            badge(badge.jsx)
            button(button.jsx)
            input(input.jsx)
            scroll_area(scroll-area.jsx)
        end
        subgraph "Contexts"
            AuthContext(AuthContext.jsx)
            ThemeContext(ThemeContext.jsx)
            SettingsContext(SettingsContext.jsx)
        end
        subgraph "Hooks"
            useWebSocket(useWebSocket.js)
            useAudioRecorder(useAudioRecorder.js)
            useVersionCheck(useVersionCheck.js)
        end
        subgraph "Utils"
            api(api.js)
            notificationSound(notificationSound.js)
            whisper(whisper.js)
            lib_utils(utils.js)
        end
    end

    subgraph "Node.js Server (Backend)"
        ExpressServer(Express Server)
        WebSocketServer(WebSocket Server)
        GeminiCLIBridg(Gemini CLI Bridge)
        SessionManager(Session Manager)
        AuthLayer(Auth Layer)
        GitAPI(Git API)
    end

    subgraph "Local System"
        GeminiCLIProcess(Gemini CLI Process)
        ProjectFiles(Project Files)
        GitRepository(Git Repository)
        SQLiteDB(SQLite DB)
        GeminiConfigFiles(gemini config files)
    end

    subgraph "External Services"
        OpenAIWhisperAPI(OpenAI Whisper API)
    end

    A -- Interacts --> App

    App --> MainContent
    App --> Sidebar
    App --> DarkModeToggle
    App --> ErrorBoundary
    App --> MobileNav
    App --> ProtectedRoute
    App --> useVersionCheck

    MainContent --> ChatInterface
    MainContent --> EditorTab
    MainContent --> GitPanel
    MainContent --> Shell
    MainContent --> ChatSidebar
    MainContent --> ImageViewer
    MainContent --> TodoList
    MainContent --> SpecDesign

    Sidebar --> FileTree
    Sidebar --> GeminiLogo
    Sidebar --> QuickSettingsPanel
    Sidebar --> ToolsSettings
    Sidebar --> api

    ChatInterface --> CodeEditor
    ChatInterface --> GeminiStatus
    ChatInterface --> MicButton
    ChatInterface --> useWebSocket
    ChatInterface --> api
    ChatInterface --> notificationSound

    EditorTab --> CodeTabs
    EditorTab --> EditorFileTree
    EditorTab --> NewCodeEditor

    SpecDesign --> ProgressIndicator
    SpecDesign --> ThinkingIndicator

    AuthContext --> LoginForm
    AuthContext --> SetupForm

    MicButton --> useAudioRecorder
    useAudioRecorder --> whisper

    App --> AuthContext
    App --> ThemeContext
    App --> SettingsContext
    App --> useWebSocket

    api --> ExpressServer
    useWebSocket --> WebSocketServer

    ExpressServer --> GeminiCLIBridg
    WebSocketServer --> GeminiCLIBridg
    ExpressServer --> AuthLayer
    ExpressServer --> GitAPI
    ExpressServer --> ProjectFiles
    ExpressServer --> OpenAIWhisperAPI

    GeminiCLIBridg --> SessionManager
    GeminiCLIBridg --> GeminiCLIProcess

    AuthLayer --> SQLiteDB
    GitAPI --> GitRepository
    SessionManager --> GeminiConfigFiles
    GeminiCLIProcess --> ProjectFiles
end
```

## Tools

### `lotuswisdom`

-   **Purpose:** A tool for problem-solving using the Lotus Sutra's wisdom framework.
-   **How it works:** This tool helps analyze problems through multiple approaches while recognizing inherent wisdom. Each step can utilize different techniques for understanding and expression.
-   **When to use:**
    -   Breaking down complex problems requiring multi-faceted understanding
    -   Questions that benefit from both direct and gradual approaches
    -   Problems where apparent contradictions need integration
    -   Situations requiring both analytical and intuitive understanding
    -   Tasks that benefit from meditative pauses to allow insight
    -   Questions containing their own inherent wisdom

### `vibe-check`

-   **Purpose:** A tool for analyzing a problem and a plan to solve it.
-   **How it works:** This tool takes a user request and a plan as input and provides feedback on the plan. It can help to identify potential issues with the plan and suggest improvements.
-   **When to use:**
    -   Before implementing a solution to a problem.
    -   When you want to get feedback on a plan.

### `vibe-learn`

-   **Purpose:** A tool for recording what you've learned from an interaction.
-   **How it works:** This tool takes a category, a mistake, and a solution as input and records it for future reference.
-   **When to use:**
    -   After using the `vibe-check` tool.
    -   When you want to record a lesson learned.

### `sequentialthinking`

-   **Purpose:** A tool for creating a detailed plan for solving a problem.
-   **How it works:** This tool takes a problem statement as input and guides you through the process of creating a plan to solve it. It helps you to break down the problem into smaller, more manageable steps.
-   **When to use:**
    -   When you need to create a detailed plan for solving a problem.
    -   When you want to break down a complex problem into smaller steps.

### `visualreasoning`

-   **Purpose:** A tool for creating diagrams and other visual representations of information.
-   **How it works:** This tool takes a diagram type and a list of elements as input and creates a diagram. It can be used to create a variety of diagrams, including graphs, flowcharts, and state diagrams.
-   **When to use:**
    -   When you want to create a visual representation of information.
    -   When you want to create a diagram to help you to understand a complex system.

**Project Structure:**

```
/home/sam/Gemini-CLI-Web/
├───.env.example
├───.gitignore
├───.nvmrc
├───CHANGELOG.md
├───GEMINI.md
├───index.html
├───LICENSE
├───package-lock.json
├───package.json
├───README_jp.md
├───README.md
├───vite.config.js
├───.augment/
├───.gemini/
├───.git/
├───.github/
├───.specstory/
├───node_modules/
├───public/
│   ├───convert-icons.md
│   ├───favicon.png
│   ├───favicon.svg
│   ├───generate-icons.js
│   ├───logo.svg
│   ├───manifest.json
│   ├───sw.js
│   ├───icons/
│   │   ├───gemini-ai-icon.svg
│   │   ├───generate-icons.md
│   │   ├───icon-128x128.png
│   │   ├───icon-128x128.svg
│   │   ├───icon-144x144.png
│   │   ├───icon-144x144.svg
│   │   ├───icon-152x152.png
│   │   ├───icon-152x152.svg
│   │   ├───icon-192x192.png
│   │   ├───icon-192x192.svg
│   │   ├───icon-384x384.png
│   │   ├───icon-384x384.svg
│   │   ├───icon-512x512.png
│      │   ├───icon-512x512.svg
│   │   ├───icon-72x72.png
│   │   ├───icon-72x72.svg
│   │   ├───icon-96x96.png
│   │   ├───icon-96x96.svg
│   │   └───icon-template.svg
│   ├───screenshots/
│   │   ├───gemini-cli-ui-diagram-en.png
│   │   ├───gemini-cli-ui-diagram.png
│   │   ├───Screenshot from 2025-07-23 11-22-18.png
│   │   ├───Screenshot from 2025-07-23 11-23-30.png
│   │   ├───Setting.png
│   │   └───TOP.png
│   └───sounds/
│       └───generate-notification.html
├───server/
│   ├───gemini-cli.js
│   ├───index.js
│   ├───projects.js
│   ├───sessionManager.js
│   ├───database/
│   │   ├───db.js
│   │   └───init.sql
│   ├───middleware/
│   │   └───auth.js
│   └───routes/
│       ├───auth.js
│       ├───git.js
│       └───mcp.js
├───specs/
└───src/
    ├───App.jsx
    ├───index.css
    ├───main.jsx
    ├───components/
    │   ├───ChatInterface.jsx
    │   ├───ChatModal.jsx
    │   ├───CodeEditor.jsx
    │   ├───DarkModeToggle.jsx
    │   ├───EditorFileTree.jsx
    │   ├───EditorTab.jsx
    │   ├───ErrorBoundary.jsx
    │   ├───FileTree.jsx
    │   ├───FloatingChatButton.jsx
    │   ├───GeminiLogo.jsx
    │   ├───GeminiStatus.jsx
    │   ├───GitPanel.jsx
    │   ├───ImageViewer.jsx
    │   ├───LoginForm.jsx
    │   ├───MainContent.jsx
    │   ├───MicButton.jsx
    │   ├───MobileNav.jsx
    │   ├───NewCodeEditor.jsx
    │   ├───ProtectedRoute.jsx
    │   ├───QuickSettingsPanel.jsx
    │   ├───SetupForm.jsx
    │   ├───Shell.jsx
    │   ├───Sidebar.jsx
    │   ├───TodoList.jsx
    │   ├───ToolsSettings.jsx
    │   ├───SpecDesign/
    │   │   ├───ProgressIndicator.jsx
    │   │   ├───SpecDesign.jsx
    │   │   └───ThinkingIndicator.jsx
    │   └───ui/
    │       ├───badge.jsx
    │       ├───button.jsx
    │       ├───input.jsx
    │       └───scroll-area.jsx
    ├───contexts/
    │   ├───AuthContext.jsx
    │   └───ThemeContext.jsx
    ├───hooks/
    │   ├───useAudioRecorder.js
    │   └───useVersionCheck.js
    ├───lib/
    │   └───utils.js
    └───utils/
        ├───api.js
        ├───notificationSound.js
        ├───websocket.js
        └───whisper.js
```

**Core Technologies:**

*   **Frontend:**
    *   **React:** A declarative, component-based JavaScript library for building user interfaces.
    *   **Vite:** A fast, opinionated build tool that provides a lightning-fast development experience.
    *   **Tailwind CSS (v4.1.11):** A utility-first CSS framework for rapidly building custom designs. It's integrated via `@tailwindcss/vite` plugin and configured in `vite.config.js`, with core styles defined in `src/index.css`.
    *   **Component-Based Architecture:** Key components include `App.jsx`, `Sidebar.jsx`, `MainContent.jsx`, `ChatInterface.jsx`, `FileTree.jsx`, `GitPanel.jsx`, `EditorTab.jsx`, `NewCodeEditor.jsx`, and `SpecDesign.jsx`.
    *   **State Management:** Primarily uses React's built-in state management (`useState`, `useEffect`) and React Context (`AuthContext.jsx`, `ThemeContext.jsx`).
    *   **Routing:** Client-side routing is handled by `react-router-dom` (v7.7.0).
    *   **Code Editing:** Utilizes `@monaco-editor/react` for `NewCodeEditor.jsx` and `@uiw/react-codemirror` for `CodeEditor.jsx` (used in `ChatInterface.jsx` for diffs).
    *   **Terminal Emulation:** `xterm` and `node-pty` are used for the interactive shell in `src/components/Shell.jsx`.

*   **Backend:**
    *   **Node.js:** JavaScript runtime environment for server-side logic.
    *   **Express.js:** A fast, unopinionated, minimalist web framework for Node.js, used for API routes.
    *   **WebSocket (ws):** A WebSocket server for real-time, bidirectional communication between the frontend and backend.
    *   **Database:** A local SQLite database (`geminicliui_auth.db`) managed by `better-sqlite3` is used for user authentication. Database initialization is handled by `server/database/db.js` and `server/database/init.sql`.

*   **Core Dependencies (from `package.json`):**
    *   **Frontend:** `react`, `react-dom`, `react-router-dom`, `@google/generative-ai`, `@tailwindcss/typography`, `@uiw/react-codemirror`, `@monaco-editor/react`, `lucide-react`, `framer-motion`, `clsx`, `tailwind-merge`.
    *   **Backend:** `express`, `ws`, `better-sqlite3`, `bcrypt`, `jsonwebtoken`, `node-pty`, `chokidar`, `node-fetch`, `mime-types`, `multer`.
    *   **Development:** `vite`, `@vitejs/plugin-react`, `concurrently`, `eslint`, `tailwindcss`, `@tailwindcss/vite`, `sharp`.

**Key Architectural Insights:**

*   **Backend as a Bridge to Gemini CLI (Enabling Multi-Step Workflows):**
    *   The Node.js server (`server/index.js`) acts as a crucial intermediary between the React frontend and the local `gemini` command-line tool.
    *   `server/gemini-cli.js` is responsible for spawning `gemini` as a child process (`child_process.spawn`). It handles passing user commands, conversation history, and tool settings to the CLI, enabling the execution of complex, multi-step coding workflows.
    *   It captures `stdout` and `stderr` from the `gemini` process and relays them back to the frontend via WebSockets, allowing for real-time display of Gemini's responses and errors, crucial for tracking progress in autonomous tasks.
    *   It also manages temporary image files for Gemini's vision capabilities and handles process termination.

*   **Dual Session Management Systems (Maintaining Long-Horizon Context):**
    *   **Gemini CLI's System:** The `gemini` CLI itself manages project metadata and session history by reading and writing `.jsonl` files within `~/.gemini/projects/`. `server/projects.js` interacts with these files to list projects and extract their actual directories.
    *   **UI's Internal System:** `server/sessionManager.js` maintains its own in-memory session history for the chat UI and persists it to `.json` files in `~/.gemini/sessions/`. This system is the primary source of truth for displaying chat messages and summaries in the UI. It also builds comprehensive conversation context for Gemini based on recent messages, allowing for long-horizon reasoning and consistent interactions.
    *   **Coordination:** While distinct, these systems are coordinated. `server/index.js` uses `sessionManager.js` to store and retrieve chat messages, and `gemini-cli.js` uses `sessionManager.js` to build conversation context for the `gemini` CLI.

*   **Direct File System and Git Access (Facilitating Workflow Automation):**
    *   The backend (`server/index.js`) directly performs file system operations (read, write, list directories) within the user's project directories on behalf of the frontend. This is handled by `fs.promises` module.
    *   `server/routes/git.js` provides API endpoints for Git operations (status, diff, commit, branch management, pull, push, fetch) by executing `git` commands via `child_process.exec`. It includes validation to ensure operations are performed within a Git repository. This direct access is fundamental for automating developer workflows and integrating with existing version control practices.

*   **Authentication Layer (JWT-based):**
    *   All API and WebSocket endpoints (except initial `/api/auth/status` and `/api/auth/register`) are protected by a JWT (JSON Web Token) based authentication system.

*   **WebSocket Communication:**
    *   Real-time communication between the frontend and backend is handled by a custom `useWebSocket` hook (`src/utils/websocket.js`).
    *   This hook establishes a WebSocket connection to `server/index.js` and manages message sending and receiving.
    *   It's used extensively for:
        *   Sending Gemini CLI commands and receiving responses in `ChatInterface.jsx`.
        *   Real-time project updates (e.g., when new sessions are created) to `Sidebar.jsx`.
        *   Interactive shell communication in `src/components/Shell.jsx`.
    *   **`src/utils/websocket.js` Details:**
        *   **Purpose:** Provides a React hook (`useWebSocket`) to manage the WebSocket connection lifecycle, including connection establishment, message handling, and automatic reconnection attempts.
        *   **Connection:** Establishes a WebSocket connection to the backend's `/ws` endpoint, including the authentication token in the URL for secure communication. It dynamically determines the WebSocket URL based on the frontend's configuration and backend API settings.
        *   **Message Flow:** Exposes `sendMessage` function for sending JSON messages to the backend and maintains a `messages` state array for received messages, which components like `ChatInterface.jsx` consume.
        *   **Error Handling & Reconnection:** Includes logic for handling WebSocket errors and automatically attempting to reconnect after a delay, ensuring connection resilience.

*   **Session Protection System:**
    *   Implemented in `src/App.jsx` and integrated with `src/components/ChatInterface.jsx`.
    *   This system prevents WebSocket-driven project updates (e.g., new `.jsonl` files appearing) from disrupting active chat sessions.
    *   When a user sends a message, the session is marked as "active," pausing automatic project refreshes in the sidebar. Once the conversation completes or is aborted, the session is marked "inactive," and updates resume. This ensures a smooth user experience during ongoing interactions with Gemini.

*   **Specification Design Feature (Example of Autonomous Problem Solving):**
    *   `src/components/SpecDesign/SpecDesign.jsx` allows users to generate detailed design documents, requirements, and implementation tasks based on a high-level query.
    *   It orchestrates multiple calls to the Gemini CLI via WebSockets, progressively building the specification, demonstrating the agent's capability for autonomous problem-solving and multi-step reasoning.
    *   Generated specifications can be saved to the project's file system using `api.js`.

*   **Tailwind CSS v4.1.11 Migration:**
    *   The project has migrated to Tailwind CSS v4.1.11, leveraging its utility-first approach for styling.
    *   `vite.config.js` includes `@tailwindcss/vite` plugin for seamless integration during the build process.
    *   `src/index.css` imports the Tailwind base styles and defines custom CSS variables for a sophisticated color palette (Gemini brand colors, professional zinc scale) and modern design elements like `glass-morphism`, `neumorphic`, and various `glow` effects. This ensures a consistent and visually appealing UI.

*   **Legacy Code:**
    *   The project contains some legacy code related to a "Claude CLI" (`server/routes/mcp.js`), which appears to be unused in the current Gemini-focused architecture. This module handles MCP (Multi-Cloud Provider) server management, but its integration with the Gemini CLI is not active.

*   **External API Dependency:**
    *   The audio transcription feature (`src/utils/whisper.js`) requires an `OPENAI_API_KEY` and uses the OpenAI Whisper API for speech-to-text conversion. This is handled on the backend via `server/index.js`'s `/api/transcribe` endpoint.

**Component Flow and Wiring:**

### 1. Authentication Flow

```mermaid
graph TD
    subgraph Frontend
        A[App.jsx] --> B(ProtectedRoute.jsx)
        B --> C{AuthContext.jsx (useAuth)}
        C -- needsSetup --> D[SetupForm.jsx]
        C -- no user --> E[LoginForm.jsx]
        D -- register(username, password) --> C
        E -- login(username, password) --> C
        C -- calls api.auth.login/register --> F[api.js (authenticatedFetch)]
    end

    subgraph Backend
        F --> G[server/index.js]
        G -- /api/auth/login/register --> H[server/routes/auth.js]
        H -- interacts with --> I[server/database/db.js]
        H -- uses bcrypt & jsonwebtoken --> J{JWT Token}
        J -- sent to frontend --> F
        G -- subsequent requests --> K[server/middleware/auth.js (authenticateToken/authenticateWebSocket)]
        K -- verifies --> J
    end
```

*   **Frontend (`src/contexts/AuthContext.jsx`, `src/utils/api.js`, `src/components/LoginForm.jsx`, `src/components/SetupForm.jsx`, `src/components/ProtectedRoute.jsx`):**
    *   `AuthContext.jsx` manages the user's authentication state, providing `login`, `register`, and `logout` functions.
    *   `LoginForm.jsx` and `SetupForm.jsx` are the UI components for user authentication, interacting with `AuthContext`.
    *   `api.js` is a utility for making authenticated `fetch` requests to the backend, automatically attaching the JWT.
    *   `ProtectedRoute.jsx` wraps application routes, ensuring only authenticated users can access them.
*   **Backend (`server/routes/auth.js`, `server/middleware/auth.js`, `server/database/db.js`):**
    *   `server/routes/auth.js` defines API endpoints for user registration, login, and status checks. It uses `bcrypt` for password hashing and `jsonwebtoken` for token generation.
    *   `server/middleware/auth.js` contains `validateApiKey` (optional) and `authenticateToken` middleware, which verifies the JWT for incoming requests. `authenticateWebSocket` handles WebSocket authentication.
    *   `server/database/db.js` manages user data storage in the local SQLite database.

### 2. Chat and Gemini CLI Interaction Flow

```mermaid
graph TD
    subgraph Frontend
        A[App.jsx] --> B(useWebSocket hook)
        B -- ws, sendMessage --> C[MainContent.jsx]
        C -- ws, sendMessage --> D[ChatInterface.jsx]
        D -- user input (handleSubmit) --> E{sendMessage({type: 'gemini-command'})}
        E -- sends message --> B
    end

    subgraph Backend
        B -- WebSocket --> F[server/index.js (handleChatConnection)]
        F -- calls --> G[server/gemini-cli.js (spawnGemini)]
        G -- spawns child process --> H[Gemini CLI]
        H -- stdout/stderr --> G
        G -- sends messages via WebSocket --> F
        F -- WebSocket --> B
        G -- builds context from --> I[server/sessionManager.js]
        I -- persists to --> J[~/.gemini/sessions/*.json]
    end

    subgraph Data Persistence
        J
    end
```

*   **`src/App.jsx`** initializes the WebSocket connection using **`src/utils/websocket.js`** (`useWebSocket` hook).
*   **`src/components/MainContent.jsx`** passes the WebSocket instance (`ws`) and `sendMessage` function to **`src/components/ChatInterface.jsx`**.
*   In **`ChatInterface.jsx`**, when a user sends a message (via `handleSubmit`), it calls `sendMessage({ type: 'gemini-command', command: ..., options: ... })`.
*   **`src/utils/websocket.js`** sends this message over the WebSocket to the backend.
*   **`server/index.js`** receives the WebSocket message (on the `/ws` path) and routes it to the `handleChatConnection` function.
*   `handleChatConnection` then calls **`server/gemini-cli.js`** (`spawnGemini`) to execute the Gemini CLI command.
*   **`server/gemini-cli.js`** spawns a `child_process` for the `gemini` CLI, passing the command and relevant options (including conversation context built from `sessionManager.js`).
*   `server/gemini-cli.js` captures `stdout` and `stderr` from the `gemini` process and sends them back to the frontend via the WebSocket as `gemini-response`, `gemini-output`, or `gemini-error` messages.
*   **`ChatInterface.jsx`** receives these messages via the `useWebSocket` hook and updates the chat display in real-time.
*   **`server/sessionManager.js`** is used by `gemini-cli.js` to build conversation context and by `server/index.js` to add user and assistant messages to the session history, which is persisted to `.json` files.

### 3. File System and Editor Flow

```mermaid
graph TD
    subgraph Frontend
        A[MainContent.jsx] --> B(EditorTab.jsx)
        B -- renders --> C[EditorFileTree.jsx]
        B -- renders --> D[NewCodeEditor.jsx]
        C -- fetches file list --> E[api.js (api.getFiles)]
        D -- fetches file content --> F[api.js (api.readFile)]
        D -- saves file content --> G[api.js (api.saveFile)]
    end

    subgraph Backend
        E --> H[server/index.js]
        F --> H
        G --> H
        H -- /api/projects/:projectName/files --> I[server/index.js (getFileTree)]
        H -- /api/projects/:projectName/file (read) --> J[server/index.js (fs.promises.readFile)]
        H -- /api/projects/:projectName/file (write) --> K[server/index.js (fs.promises.writeFile)]
    end

    subgraph File System
        I -- reads from --> L[Project Directory]
        J -- reads from --> L
        K -- writes to --> L
    end
```

*   **`src/components/MainContent.jsx`** manages the active tab, including the 'files' tab which renders **`src/components/EditorTab.jsx`**.
*   **`EditorTab.jsx`** renders **`src/components/EditorFileTree.jsx`** for file navigation and **`src/components/NewCodeEditor.jsx`** for file editing.
*   **`EditorFileTree.jsx`** uses **`src/utils/api.js`** (`api.getFiles()`) to fetch the project's file structure.
*   When a file is selected in `EditorFileTree.jsx`, `EditorTab.jsx` passes the file details to `NewCodeEditor.jsx`.
*   **`NewCodeEditor.jsx`** uses **`src/utils/api.js`** (`api.readFile()`) to fetch the content of the selected file.
*   When the user saves changes in `NewCodeEditor.jsx`, it calls **`src/utils/api.js`** (`api.saveFile()`) to send the updated content to the backend.
*   **`src/utils/api.js`** makes `authenticatedFetch` requests to the backend.
*   **`server/index.js`** receives these API requests (`/api/projects/:projectName/files` for listing, `/api/projects/:projectName/file` for read/write) and performs the actual file system operations using `fs.promises`.

### 4. Project and Session Management Flow

*   **`src/App.jsx`** fetches the initial list of projects using **`src/utils/api.js`** (`api.projects()`).
*   **`src/components/Sidebar.jsx`** receives the `projects` data and displays them. It allows users to select projects and sessions.
*   When a project or session is selected, `Sidebar.jsx` updates the state in `App.jsx` via callbacks (`onProjectSelect`, `onSessionSelect`).
*   **`server/projects.js`** is the core backend module for managing project metadata. It reads `.jsonl` files from `~/.gemini/projects/`, extracts project directories, generates display names, and handles project renaming and deletion.
*   **`server/sessionManager.js`** works in conjunction with `projects.js` to provide session-specific data (summaries, message counts) for display in the `Sidebar.jsx`. It also handles the persistence of UI-specific session history.
*   `server/index.js` exposes API endpoints (`/api/projects`, `/api/projects/:projectName/sessions`, etc.) that leverage `projects.js` and `sessionManager.js` to serve project and session data to the frontend.
*   `server/index.js` also sets up a `chokidar` watcher to monitor changes in `~/.gemini/projects/`, triggering real-time `projects_updated` WebSocket messages to the frontend, which `App.jsx` and `Sidebar.jsx` react to (respecting the Session Protection System).

### 5. Specification Design Flow (`SpecDesign.jsx`)

*   **`src/components/MainContent.jsx`** can render **`src/components/SpecDesign/SpecDesign.jsx`** when the 'spec' tab is active.
*   **`SpecDesign.jsx`** captures a user's high-level query.
*   It then orchestrates multiple calls to the Gemini CLI (Design, Requirements, Tasks) by using the `sendMessage` function from **`src/utils/websocket.js`** (similar to `ChatInterface.jsx`).
*   The backend (`server/index.js` -> `server/gemini-cli.js`) processes these requests, and the generated content is returned via WebSocket.
*   As each part of the specification (design, requirements, tasks) is generated, `SpecDesign.jsx` updates its internal state and displays the progress.
*   Once complete, `SpecDesign.jsx` allows the user to save the generated markdown files to the project directory by calling **`src/utils/api.js`** (`api.saveFile()`), which then interacts with `server/index.js` for file writing.

**Advanced Agent Capabilities & Future Directions (Inspired by Cutting-Edge Research):**

This section outlines how the Gemini CLI Web UI's architecture supports or can evolve towards advanced AI coding agent capabilities, drawing inspiration from recent research in the field:

*   **Autonomous Problem Solving & Multi-Step Reasoning:**
    *   The current architecture, particularly the `SpecDesign.jsx` feature, already demonstrates multi-step reasoning by orchestrating sequential calls to the Gemini CLI to generate design, requirements, and tasks. This can be extended to more complex autonomous problem-solving, where the agent can break down a high-level request into smaller, manageable sub-tasks, execute them, and self-correct based on feedback.
    *   The backend's ability to spawn and manage the Gemini CLI as a child process provides the foundation for executing long-running, multi-stage operations without direct human intervention at each step.

*   **Enhanced Context Management & Long-Horizon Understanding:**
    *   The dual session management system (`server/sessionManager.js` and Gemini CLI's `.jsonl` files) is crucial for maintaining a rich, long-horizon context. This allows the agent to "remember" past interactions, code changes, and project state across multiple turns and even sessions.
    *   Future enhancements could involve more sophisticated context windows, potentially leveraging techniques like those seen in models with large token capacities, to provide the agent with an even deeper and broader understanding of the entire codebase and its dependencies.

*   **Intelligent Tool Use and Orchestration:**
    *   The current system already utilizes tool calls (e.g., `Bash`, `Write`, `Read`, `Edit`) through the Gemini CLI. The "Allowed Tools" and "Disallowed Tools" settings in `ToolsSettings.jsx` provide a basic form of tool control.
    *   Future directions could involve more intelligent tool orchestration, where the agent dynamically selects and combines tools based on the task at hand, anticipates potential issues, and leverages tool outputs for iterative refinement. This moves beyond simple execution to strategic tool application.

*   **Integration with Developer Workflows (IDE/CLI/CI/CD):**
    *   The direct file system and Git access provided by the backend (`server/routes/git.js`) already enables seamless integration with core developer workflows. The interactive shell (`src/components/Shell.jsx`) further enhances this CLI integration.
    *   Future enhancements could explore deeper integrations with IDE features (e.g., real-time code suggestions, refactoring across multiple files), and automated CI/CD pipeline generation, allowing the agent to manage the entire software development lifecycle.

*   **Code Quality and Refactoring:**
    *   While not explicitly a core feature currently, the agent's ability to read, write, and modify code, combined with its understanding of project context, positions it well for future capabilities in automated code quality improvements, refactoring, and identifying technical debt. This could involve integrating with static analysis tools or applying learned best practices.

**Future Enhancements and Roadmap:**

This section outlines planned features and improvements to further enhance the Gemini CLI Web UI's capabilities and user experience.

### 1. Centralized MCP Server Configuration via `~/.gemini/settings.json`

*   **Goal:** Allow the UI to load MCP (Multi-Cloud Provider) server configurations directly from the `~/.gemini/settings.json` file, providing a centralized and consistent way to manage external tool servers for the Gemini CLI.
*   **Technical Implementation:**
    *   **Backend (`server/index.js`, `server/routes/mcp.js`):** Implement logic to read and parse `~/.gemini/settings.json` on startup and dynamically load MCP server configurations. This involves handling file system access, JSON parsing, and integrating these configurations into the existing MCP server management routes.
    *   **Frontend (`src/components/ToolsSettings.jsx`):** Update the MCP server management UI to display these loaded configurations, allowing users to view, test, and potentially modify them (with appropriate permissions and persistence back to the settings file).
*   **Benefit:** Streamlines the setup and management of custom tools, ensuring that configurations are shared seamlessly between the CLI and the UI, reducing duplication and potential inconsistencies.

### 2. Code Graph Generator and Visualization (New Section: `CodeGraph.jsx`)

*   **Goal:** Implement a dedicated section/component (`CodeGraph.jsx`) to generate and visualize various types of code graphs (e.g., call graphs, dependency graphs, class diagrams) for enhanced code understanding and navigation.
*   **Technical Implementation:**
    *   **Frontend (`src/components/CodeGraph.jsx`):** A new top-level component will be created.
        *   **Interactive Visualization:** Utilize `xyflow/react` for building highly interactive and customizable graph visualizations, allowing users to pan, zoom, and interact with nodes and edges.
        *   **Static Diagram Generation:** Integrate `mermaid.js` to generate static, exportable diagrams from textual descriptions. This will allow for rendering diagrams within documentation, reports, or dedicated visualization panels.
    *   **Backend (Potential `server/routes/codeGraph.js`):** Develop new API endpoints to extract structured code information (e.g., ASTs, function calls, class definitions) from project files. This might involve leveraging existing parsing libraries or integrating with language-specific analysis tools.
    *   **Benefit:** Provides powerful visual tools for understanding complex codebases, identifying dependencies, and aiding in refactoring efforts, moving beyond simple file browsing.

### 3. Enhanced Specification Design (`SpecDesign.jsx`)

*   **Goal:** Transform `SpecDesign.jsx` into a more powerful and interactive specification generation and management tool, enabling deeper collaboration and higher quality output.
*   **Technical Implementation:**
    *   **Interactive Refinement:** Allow users to directly edit the AI-generated design, requirements, and tasks within the UI. Implement AI-driven re-generation or refinement based on user feedback, creating a continuous feedback loop.
    *   **Version Control Integration:** Integrate spec documents with Git, allowing users to commit, revert, and track changes to their specifications directly from the `SpecDesign.jsx` interface.
    *   **Template Support:** Introduce support for various specification templates (e.g., ADRs, RFCs, detailed design documents) to guide the AI's generation and ensure consistency.
    *   **AI-Driven Validation & Feedback:** Implement AI models to analyze the generated specs for consistency, completeness, and adherence to best practices, providing actionable feedback to the user.
    *   **Integration with Code Analysis:** Potentially link generated requirements/tasks to actual code implementation, allowing the AI to track progress or identify discrepancies.
    *   **Mermaid Diagram Generation:** Enable `SpecDesign.jsx` to generate and embed Mermaid diagrams directly within the specification documents for clearer visual representation of architectural components, data flows, or process flows.
*   **Benefit:** Elevates the `SpecDesign.jsx` from a generation tool to a comprehensive specification management platform, fostering better planning and execution of coding tasks.

### 4. New Component for Tool Calls and Gemini Thinking in `ChatInterface.jsx`

*   **Goal:** Introduce a dedicated, collapsible component within `src/components/ChatInterface.jsx` to provide granular transparency into the Gemini agent's internal thought process and tool calls.
*   **Technical Implementation:**
    *   **Frontend (`src/components/ChatInterface.jsx`):**
        *   Create a new sub-component (e.g., `GeminiThoughtProcess.jsx`) that `ChatInterface.jsx` will render.
        *   This component will parse and display structured data about the agent's reasoning steps, intermediate thoughts, tool invocations (function name, arguments), and tool outputs (results, errors).
        *   Implement a clear, hierarchical, and visually distinct presentation for each step, potentially using icons and color-coding for different types of thoughts or tool statuses.
    *   **Backend (`server/gemini-cli.js`):** Enhance the `spawnGemini` function to capture and stream more detailed, structured information about the agent's internal workings (e.g., thought logs, tool call JSON, tool result JSON) back to the frontend via WebSocket. This might require modifications to the Gemini CLI's output format or additional parsing on the backend.
*   **Benefit:** Provides unprecedented transparency into *how* the agent is reasoning and *what* tools it is using, enhancing user trust, aiding in debugging, and offering educational insights into AI problem-solving.

### 5. Direct Code Editing and Diff Visualization within Chat

*   **Goal:** Enable users to directly edit code snippets presented in the chat interface and visualize code changes (diffs) inline.
*   **Technical Implementation:**
    *   **Frontend (`src/components/ChatInterface.jsx`):**
        *   When a code block is identified in a Gemini response (e.g., from a `Write` or `Edit` tool call), `ChatInterface.jsx` will render it with an embedded, lightweight code editor (e.g., a small Monaco editor instance or a custom textarea with syntax highlighting).
        *   Implement a real-time diff viewer that highlights changes between the original code snippet and the user's modifications.
        *   Add "Apply Changes" or "Save" buttons that trigger an API call to persist the changes.
    *   **Backend (`server/index.js`, `server/routes/git.js`):** Leverage existing `api.saveFile()` for writing changes. For diff visualization, the frontend will generate the diff locally or request it from the backend (using existing `git diff` capabilities exposed via `server/routes/git.js`).
*   **Benefit:** Significantly reduces context switching, allowing developers to quickly iterate on code suggestions and fixes directly within the conversational interface, providing immediate visual feedback on changes.

### 6. Frontend Performance Optimization: Caching Credentials

*   **Goal:** Optimize the loading of authentication credentials to improve frontend performance and reduce redundant `localStorage` lookups.
*   **Technical Implementation:**
    *   **Centralized Cache:** Implement a simple in-memory cache (e.g., a module-scoped variable or a basic `Map`) within `src/contexts/AuthContext.jsx` or `src/utils/api.js` to store the authentication token after its initial retrieval from `localStorage`.
    *   **Optimized Retrieval:** Modify `src/utils/api.js`'s `authenticatedFetch` and `src/utils/websocket.js`'s connection logic to first check this in-memory cache for the authentication token. If the token is present in memory, use it directly; otherwise, fall back to `localStorage`.
    *   **Invalidation Strategy:** Ensure the in-memory cache is cleared when the user logs out (`AuthContext.jsx`'s `logout` function) or if an API call indicates an invalid token (e.g., a 401 Unauthorized response handled by `authenticatedFetch`).
*   **Benefit:** Reduces repeated I/O operations to `localStorage`, leading to improved responsiveness and reduced latency, especially in frequently re-rendering components like `ChatInterface.jsx` and during WebSocket connection attempts.

**My Behavior:**

*   I will act as a full-stack expert on this specific architecture, understanding the intricate interplay between the frontend, the backend bridge, and the `gemini` CLI tool. My responses will reflect a deep understanding of the system's components and their interactions.
*   I will always consider both frontend (`src/`) and backend (`server/`) implications in my responses, providing holistic solutions.
*   I will be mindful of the dual session management systems and the potential for inconsistencies, ensuring my actions maintain the integrity of both UI and CLI contexts.
*   I will adhere to existing project conventions, including the use of the `child_process` module for interacting with local commands, and the established Tailwind CSS v4.1.11 styling and component structure.
*   I will be proactive in suggesting solutions that span the full stack, anticipating needs and proposing improvements that leverage the system's capabilities.
*   I will strive for **autonomous problem-solving**, breaking down complex requests into actionable steps and executing them efficiently.
*   I will maintain **long-horizon context**, leveraging the project's session management to understand the broader development goals and past interactions.
*   I will demonstrate **intelligent tool orchestration**, selecting and combining the most appropriate tools to achieve the desired outcome.
*   My responses will be **clear, concise, and directly actionable**, reflecting an expert persona focused on delivering high-quality results and following instructions precisely.
