<div align="center">
  <img src="public/logo-n.png" alt="Gemini CLI UI" width="64" height="64">
  <h1>Gemini CLI Web UI</h1>
</div>



A desktop and mobile UI for [Gemini CLI](https://github.com/google-gemini/gemini-cli), Google's official CLI for AI-assisted coding. You can use it locally or remotely to view your active projects and sessions in Gemini CLI and make changes to them the same way you would do it in Gemini CLI. This gives you a proper interface that works everywhere.

## Technologies Used

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)
![WebSockets](https://img.shields.io/badge/WebSockets-1A1A1A?style=for-the-badge&logo=websocket&logoColor=white)
![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)
![CodeMirror](https://img.shields.io/badge/CodeMirror-F78C6C?style=for-the-badge&logo=codemirror&logoColor=white)
![Xterm.js](https://img.shields.io/badge/Xterm.js-26A2BF?style=for-the-badge&logo=xterm&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Lucide React](https://img.shields.io/badge/Lucide_React-222222?style=for-the-badge&logo=lucide&logoColor=white)
![xyflow/react](https://img.shields.io/badge/xyflow/react-FF0077?style=for-the-badge&logo=react&logoColor=white)
![Mermaid.js](https://img.shields.io/badge/Mermaid.js-FF3366?style=for-the-badge&logo=mermaid&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)

## Screenshots

<div align="center">
<table>
<tr>
<td align="center">
<h3>Chat View</h3>
<img src="public/screenshots/TOP.png" alt="Desktop Interface" width="400">
<br>
<em>Main interface showing project overview and chat</em>
</td>
<td align="center">
<h3>Setting</h3>
<img src="public/screenshots/Setting.png" alt="Mobile Interface" width="400">
<br>
<em>Setting</em>
</td>
</tr>
</table>
<table>
<tr>
<td align="center">
<h3>Chat View</h3>
<img src="public/screenshots/gemini-cli-ui-diagram-en.png" alt="Desktop Interface" width="800">
<br>
<em>Gemini CLI UI Diagram</em>
</td>
</table>
</div align="center">

<div align="center">
<h3>Updates to Gemini CLI Web UI</h3>
<img src="public/screenshots/Screenshot from 2025-07-27 11-02-53.png" alt="Gemini CLI Monaco Code Editor" width="800">
<em>Monaco Code Editor for editing files in Gemini CLI UI</em>
<br>

<img src="public/screenshots/Screenshot from 2025-07-23 11-22-18.png" alt="Gemini CLI Monaco Code Editor" width="800">
<em>Spec File Generation</em>
<br>

</div align="center">

## Features

- **Responsive Design** - Works seamlessly across desktop, tablet, and mobile so you can also use Gemini CLI from mobile
- **Interactive Chat Interface** - Built-in chat interface for seamless communication with Gemini CLI
- **Integrated Shell Terminal** - Direct access to Gemini CLI through built-in shell functionality
- **File Explorer** - Interactive file tree with syntax highlighting and live editing
- **Git Explorer** - View, stage and commit your changes. You can also switch branches
- **Session Management** - Resume conversations, manage multiple sessions, and track history
- **Model Selection** - Choose from multiple Gemini models including Gemini 2.5 Pro
- **YOLO Mode** - Skip confirmation prompts for faster operations (use with caution)

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v20 or higher
- [Gemini CLI](https://github.com/google-gemini/gemini-cli) installed and configured

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/ssdeanx/Gemini-CLI-Web.git
cd gemini-cli-web
```

2. **Install dependencies:**

```bash
npm install
```

3. **Configure environment:**

```bash
cp .env.example .env
# Edit .env with your preferred settings
```

**Note**: The `.env` file has been removed for security. Always copy `.env.example` to `.env` when using and modify settings as needed.

4. **Start the application:**

```bash
# Development mode (with hot reload)
npm run dev
```

The application will start at the port you specified in your .env

5. **Open your browser:**
   - Development: `http://localhost:4009`

## Security & Tools Configuration

**🔒 Important Notice**: All Gemini CLI tools are **disabled by default**. This prevents potentially harmful operations from running automatically.

### Enabling Tools

To use Gemini CLI's full functionality, you'll need to manually enable tools:

1. **Open Tools Settings** - Click the gear icon in the sidebar
2. **Enable Selectively** - Turn on only the tools you need
3. **Apply Settings** - Your preferences are saved locally

### About YOLO Mode

YOLO mode ("You Only Live Once") is equivalent to Gemini CLI's `--yolo` flag, skipping all confirmation prompts. This mode speeds up your work but should be used with caution.

**Recommended approach**: Start with basic tools enabled and add more as needed. You can always adjust these settings later.

## Usage Guide

### Core Features

#### Project Management

The UI automatically discovers Gemini CLI projects from `~/.gemini/projects/` and provides:

- **Visual Project Browser** - All available projects with metadata and session counts
- **Project Actions** - Rename, delete, and organize projects
- **Smart Navigation** - Quick access to recent projects and sessions

#### Chat Interface

- **Use responsive chat or Gemini CLI** - You can either use the adapted chat interface or use the shell button to connect to Gemini CLI
- **Real-time Communication** - Stream responses from Gemini with WebSocket connection
- **Session Management** - Resume previous conversations or start fresh sessions
- **Message History** - Complete conversation history with timestamps and metadata
- **Multi-format Support** - Text, code blocks, and file references
- **Image Upload** - Upload and ask questions about images in chat

#### File Explorer & Editor

- **Interactive File Tree** - Browse project structure with expand/collapse navigation
- **Live File Editing** - Read, modify, and save files directly in the interface
- **Syntax Highlighting** - Support for multiple programming languages
- **File Operations** - Create, rename, delete files and directories

#### Git Explorer

- **Visualize Changes** - See current changes in real-time
- **Stage and Commit** - Create Git commits directly from the UI
- **Branch Management** - Switch and manage branches

#### Session Management

- **Session Persistence** - All conversations automatically saved
- **Session Organization** - Group sessions by project and timestamp
- **Session Actions** - Rename, delete, and export conversation history
- **Cross-device Sync** - Access sessions from any device

### Mobile App

- **Responsive Design** - Optimized for all screen sizes
- **Touch-friendly Interface** - Swipe gestures and touch navigation
- **Mobile Navigation** - Bottom tab bar for easy thumb navigation
- **Adaptive Layout** - Collapsible sidebar and smart content prioritization
- **Add to Home Screen** - Add a shortcut to your home screen and the app will behave like a PWA

### Monaco Editor

- **Monaco Editor** - Advanced code editor with syntax highlighting and live editing
- **Code Completion** - Autocomplete features for code snippets and functions
- **Syntax Highlighting** - Highlighting of different programming languages
- **Live Editing** - Edit code directly in the editor
- **Code Folding** - Collapse and expand code blocks for better readability
- **Chat Modal** - Chat mode that can interact with the Monaco Editor

### Spec File Generation

- **Spec File Generation** - Generate design, requirements, and tasks files
- **Design File Generation** - Generate design files for UI
- **Requirements File Generation** - Generate requirements files for testing
- **Tasks File Generation** - Generate tasks files for automation
- **User Input** - User input is used to generate the spec files
- **Retry and Save** - Retry and save the generated spec files
- **Save Spec Files** - Save the generated spec files, in the project spec folder
- **Use Spec Files** - Use the generated spec files in Gemini CLI for further development, features, and more.

## Architecture

### System Overview

```bash
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │  Gemini CLI     │
│   (React/Vite)  │◄──►│ (Express/WS)    │◄──►│  Integration    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Backend (Node.js + Express)

- **Express Server** - RESTful API with static file serving (Port: 4008)
- **WebSocket Server** - Communication for chats and project refresh
- **Gemini CLI Integration** - Process spawning and management
- **Session Management** - JSONL parsing and conversation persistence
- **File System API** - Exposing file browser for projects
- **Authentication System** - Secure login and session management (SQLite database: geminicliui_auth.db)

### Frontend (React + Vite)

- **React 18** - Modern component architecture with hooks
- **CodeMirror** - Advanced code editor with syntax highlighting
- **Tailwind CSS** - Utility-first CSS framework
- **Responsive Design** - Mobile-first approach

## Configuration Details

### Port Settings

- **API Server**: Port 4008 (default)
- **Frontend Dev Server**: Port 4009 (default)
- These ports can be changed in the `.env` file

### Database Configuration

#### Initial Setup and Table Structure

- **Database File**: `server/database/geminicliui_auth.db`
- **Database Type**: SQLite 3
- **Initialization**: Automatically created and initialized on server startup

#### User Table Details

**Table Name**: `geminicliui_users`

| Column | Data Type | Constraints | Description |
|--------|-----------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique user identifier |
| `username` | TEXT | UNIQUE NOT NULL | Login username (email recommended) |
| `password_hash` | TEXT | NOT NULL | bcrypt hashed password |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| `last_login` | DATETIME | NULL | Last login timestamp |
| `is_active` | BOOLEAN | DEFAULT 1 | Account active/inactive status |

**Indexes**:

- `idx_geminicliui_users_username`: For fast username lookups
- `idx_geminicliui_users_active`: For filtering active users

#### First Run Setup

1. On first server startup, database file is automatically created if it doesn't exist
2. Table structure is loaded from `server/database/init.sql`
3. First access displays user registration screen
4. First user is registered as administrator

#### Security Features

- Passwords are hashed with bcrypt before storage
- JWT token-based authentication system
- Session management with timeout functionality
- SQL injection protection (prepared statements used)

## Troubleshooting

### Common Issues & Solutions

#### "No Gemini projects found"

**Problem**: The UI shows no projects or empty project list
**Solutions**:

- Ensure Gemini CLI is properly installed
- Run `gemini` command in at least one project directory to initialize
- Verify `~/.gemini/projects/` directory exists and has proper permissions

#### File Explorer Issues

**Problem**: Files not loading, permission errors, empty directories
**Solutions**:

- Check project directory permissions (`ls -la` in terminal)
- Verify the project path exists and is accessible
- Review server console logs for detailed error messages
- Ensure you're not trying to access system directories outside project scope

#### Model Selection Not Working

**Problem**: Selected model is not being used
**Solutions**:

- After selecting a model in settings, make sure to click "Save Settings"
- Clear browser local storage and reconfigure
- Verify the model name is displayed correctly in the chat interface

## Future Scope

This section outlines the planned enhancements and features to be implemented in future releases, focusing on improving user experience, agent capabilities, and overall system performance.

| Feature | Description | Status/Priority |
|---|---|---|
| **Centralized MCP Server Configuration** | Load MCP server configurations from `~/.gemini/settings.json` for consistent management across CLI and UI. | High |
| **Code Graph Generator & Visualization** | Dedicated `CodeGraph.jsx` component using `xyflow/react` and `mermaid.js` for interactive and static code graph visualizations (call graphs, dependency graphs, etc.). | High |
| **Enhanced Specification Design** | Transform `SpecDesign.jsx` into a comprehensive tool with interactive refinement, Git integration, template support, AI-driven validation, and Mermaid diagram generation. | High |
| **Transparent Tool Calls & Thinking** | New component in `ChatInterface.jsx` to display Gemini's internal thought process and tool invocations/outputs for enhanced transparency. | High |
| **Direct Code Editing & Diff in Chat** | Enable inline code editing within chat responses and real-time diff visualization for immediate feedback on code changes. | High |
| **Frontend Credential Caching** | Optimize authentication credential loading in `AuthContext.jsx`, `api.js`, and `websocket.js` using an in-memory cache to reduce `localStorage` lookups and improve performance. | Medium |

## License

GNU General Public License v3.0 - see [LICENSE](LICENSE) file for details.

This project is open source and free to use, modify, and distribute under the GPL v3 license.

### Original Project

This project is based on [Claude Code UI](https://github.com/siteboon/claudecodeui) (GPL v3.0) with customizations.

### Graph

```mermaid
graph TD

    20["User<br>External Actor"]
    91["User<br>External Actor"]
    subgraph 1["Static Assets/Public System<br>Web Server"]
        77["Icons<br>Image Files"]
        78["Screenshots<br>Image Files"]
        79["Sounds<br>Audio Files"]
        subgraph 2["Root Assets<br>HTML/JS"]
            74["Main HTML<br>HTML"]
            75["Web App Manifest<br>JSON"]
            76["Service Worker<br>JavaScript"]
        end
    end
    subgraph 3["Backend System<br>Node.js"]
        71["Auth Middleware<br>Express"]
        72["Session Manager<br>Node.js"]
        73["Project Manager<br>Node.js"]
        subgraph 4["Database Management<br>Node.js"]
            69["DB Connection<br>Node.js"]
            70["DB Schema Init<br>SQL"]
        end
        subgraph 5["API Routes<br>Express"]
            66["Auth Route<br>Express"]
            67["Git Route<br>Express"]
            68["MCP Route<br>Express"]
        end
        subgraph 6["Main Server<br>Node.js"]
            64["Main Entry Point<br>Node.js"]
            65["CLI Core Logic<br>Node.js"]
        end
        %% Edges at this level (grouped by source)
        3["Backend System<br>Node.js"] -->|Accesses| 4["Database Management<br>Node.js"]
    end
    subgraph 7["Frontend System<br>React"]
        subgraph 10["Contexts/State Management<br>React"]
            54["AuthContext<br>React"]
            55["SettingsContext<br>React"]
            56["ThemeContext<br>React"]
        end
        subgraph 11["UI Components<br>React"]
            subgraph 12["Spec Design Components<br>React"]
                51["SpecDesign<br>React"]
                52["ProgressIndicator<br>React"]
                53["ThinkingIndicator<br>React"]
            end
            subgraph 13["UI Primitives<br>React"]
                47["Button<br>React"]
                48["Input<br>React"]
                49["Badge<br>React"]
                50["Scroll-Area<br>React"]
            end
            subgraph 14["Utility and Display Components<br>React"]
                39["FileTree<br>React"]
                40["ImageViewer<br>React"]
                41["GeminiLogo<br>React"]
                42["GeminiStatus<br>React"]
                43["DarkModeToggle<br>React"]
                44["MicButton<br>React"]
                45["TodoList<br>React"]
                46["ErrorBoundary<br>React"]
            end
            subgraph 15["Authentication and Settings Components<br>React"]
                34["LoginForm<br>React"]
                35["ProtectedRoute<br>React"]
                36["QuickSettingsPanel<br>React"]
                37["ToolsSettings<br>React"]
                38["SetupForm<br>React"]
            end
            subgraph 16["Layout and Navigation Components<br>React"]
                31["Sidebar<br>React"]
                32["MainContent<br>React"]
                33["MobileNav<br>React"]
            end
            subgraph 17["Code Editor Components<br>React"]
                26["CodeEditor<br>React"]
                27["NewCodeEditor<br>React"]
                28["CodeTabs<br>React"]
                29["EditorTab<br>React"]
                30["EditorFileTree<br>React"]
            end
            subgraph 18["Chat Interface Components<br>React"]
                24["ChatInterface<br>React"]
                25["ChatSidebar<br>React"]
            end
        end
        subgraph 19["Core Application<br>React"]
            21["Main Application Entry<br>React"]
            22["Root Component<br>React"]
            23["Global Styles<br>CSS"]
        end
        subgraph 8["Utilities/API Integration<br>JavaScript"]
            59["API Utility<br>JavaScript"]
            60["WebSocket Utility<br>JavaScript"]
            61["Whisper Integration<br>JavaScript"]
            62["Notification Sound<br>JavaScript"]
            63["General Utilities<br>JavaScript"]
        end
        subgraph 9["Hooks<br>React"]
            57["useAudioRecorder<br>React"]
            58["useVersionCheck<br>React"]
        end
    end
    subgraph 80["Static Assets/Public System<br>Web Server"]
        119["Icons<br>SVG/PNG"]
        120["Screenshots<br>PNG"]
        121["Sounds<br>HTML/Audio"]
        subgraph 81["Root Assets<br>HTML/JS"]
            116["Main HTML<br>HTML"]
            117["Web Manifest<br>JSON"]
            118["Service Worker<br>JavaScript"]
        end
    end
    subgraph 82["Backend System<br>Node.js/Express"]
        113["Auth Middleware<br>Express"]
        114["Session Manager<br>Node.js"]
        115["Project Manager<br>Node.js"]
        subgraph 83["Database Management<br>SQLite"]
            111["DB Manager<br>JavaScript"]
            112["DB Init Script<br>SQL"]
        end
        subgraph 84["API Routes<br>Express"]
            108["Auth Route<br>Express"]
            109["Git Route<br>Express"]
            110["MCP Route<br>Express"]
        end
        subgraph 85["Main Server<br>Node.js/Express"]
            106["Server Entry Point<br>Node.js"]
            107["Gemini CLI Core<br>Node.js"]
        end
        %% Edges at this level (grouped by source)
        82["Backend System<br>Node.js/Express"] -->|Interacts with| 83["Database Management<br>SQLite"]
        106["Server Entry Point<br>Node.js"] -->|Initializes| 83["Database Management<br>SQLite"]
        106["Server Entry Point<br>Node.js"] -->|Initializes| 84["API Routes<br>Express"]
        106["Server Entry Point<br>Node.js"] -->|Initializes| 114["Session Manager<br>Node.js"]
        106["Server Entry Point<br>Node.js"] -->|Initializes| 115["Project Manager<br>Node.js"]
        108["Auth Route<br>Express"] -->|Authenticates via| 113["Auth Middleware<br>Express"]
        113["Auth Middleware<br>Express"] -->|Manages sessions via| 114["Session Manager<br>Node.js"]
    end
    subgraph 86["Frontend System<br>React"]
        95["UI Components<br>React"]
        subgraph 87["Utilities/API Integration<br>JavaScript"]
            101["API Utility<br>JavaScript"]
            102["WebSocket Utility<br>JavaScript"]
            103["Whisper Integration<br>JavaScript"]
            104["Notification Sound<br>JavaScript"]
            105["General Utilities<br>JavaScript"]
        end
        subgraph 88["Hooks<br>React"]
            100["Version Check Hook<br>React"]
            99["Audio Recorder Hook<br>React"]
        end
        subgraph 89["Contexts/State Management<br>React"]
            96["Auth Context<br>React"]
            97["Settings Context<br>React"]
            98["Theme Context<br>React"]
        end
        subgraph 90["Core Application<br>React"]
            92["Main Application Entry<br>React"]
            93["Root Component<br>React"]
            94["Global Styles<br>CSS"]
        end
    end
    %% Edges at this level (grouped by source)
    7["Frontend System<br>React"] -->|Serves| 1["Static Assets/Public System<br>Web Server"]
    7["Frontend System<br>React"] -->|Makes API requests to| 3["Backend System<br>Node.js"]
    20["User<br>External Actor"] -->|Interacts with| 7["Frontend System<br>React"]
    91["User<br>External Actor"] -->|Accesses| 80["Static Assets/Public System<br>Web Server"]
    86["Frontend System<br>React"] -->|Communicates via REST/WebSockets| 82["Backend System<br>Node.js/Express"]
    80["Static Assets/Public System<br>Web Server"] -->|Loads| 86["Frontend System<br>React"]
```

**Major Changes:**

- Adapted from Claude CLI to Gemini CLI
- Added authentication system (SQLite-based)
- Gemini-specific model selection feature
- Enhanced Japanese language support
- UI adjustments and Gemini branding

Thanks to the original Claude Code UI project.

## Acknowledgments

### Built With

- **[Gemini CLI](https://github.com/google-gemini/gemini-cli)** - Google's official CLI
- **[React](https://react.dev/)** - User interface library
- **[Vite](https://vitejs.dev/)** - Fast build tool and dev server
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[CodeMirror](https://codemirror.net/)** - Advanced code editor
- **[Gemini CLI UI](https://github.com/cruzyjapan/Gemini-CLI-UI)** - Orginal project

## Support & Community

### Stay Updated

- **Star** this repository to show support
- **Watch** for updates and new releases
- **Follow** the project for announcements

---
