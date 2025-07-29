# Gemini CLI UI - Components

This directory contains the reusable React components that make up the user interface.

**For more information, see the detailed documentation for each subdirectory:**

*   [SpecDesign](./SpecDesign/GEMINI.md)
*   [UI](./ui/GEMINI.md)

## Component Overview

### `App.jsx`

-   **Purpose:** The root component of the application, responsible for layout and state management.
-   **Core Functionality:**
    -   Manages the overall application state, including projects, sessions, and active tabs.
    -   Integrates the WebSocket connection for real-time updates.
    -   Implements the **Session Protection System** to prevent chat interruptions.

### `ChatInterface.jsx`

-   **Purpose:** The primary component for user interaction with the Gemini CLI.
-   **Core Functionality:**
    -   Displays the conversation history.
    -   Provides a text input area for sending commands to Gemini.
    -   Handles WebSocket messages to display real-time responses, tool usage, and errors.
    -   Integrates with the Session Protection System by notifying the `App` component when a session becomes active or inactive.

### `ChatSidebar.jsx`

-   **Purpose:** A collapsible sidebar that contains the `ChatInterface`.
-   **Core Functionality:**
    -   Provides a dedicated, resizable panel for chat, allowing it to be shown or hidden.
    -   Can be rendered as part of the main layout or as an overlay.

### `CodeEditor.jsx` & `NewCodeEditor.jsx`

-   **Purpose:** Provide code editing capabilities within the UI.
-   **`CodeEditor.jsx`:** A legacy editor based on CodeMirror, primarily used for displaying diffs.
-   **`NewCodeEditor.jsx`:** The primary code editor, built with the more powerful Monaco Editor (the same editor used in VS Code). It supports syntax highlighting, file saving, and other standard editor features.

### `EditorFileTree.jsx` & `FileTree.jsx`

-   **Purpose:** Display the file system of a selected project.
-   **`EditorFileTree.jsx`:** A file tree specifically designed for the multi-tab editor view (`EditorTab.jsx`).
-   **`FileTree.jsx`:** A more detailed file viewer with multiple view modes (simple, detailed, compact).

### `EditorTab.jsx`

-   **Purpose:** Provides a VS Code-like multi-tab interface for editing multiple files at once.
-   **Core Functionality:**
    -   Manages a list of open files in tabs.
    -   Allows users to switch between, open, and close files.
    -   Integrates the `NewCodeEditor` to display the content of the active file.

### `GitPanel.jsx`

-   **Purpose:** A dedicated panel for interacting with Git repositories.
-   **Core Functionality:**
    -   Displays the current Git status (modified, added, deleted files).
    -   Shows diffs for changed files.
    -   Allows users to stage files, write commit messages, and commit changes.
    -   Provides features for managing branches, fetching, pulling, and pushing.

### `MainContent.jsx`

-   **Purpose:** The main content area of the application that displays the active tab.
-   **Core Functionality:**
    -   Acts as a container for the different views (`ChatInterface`, `FileTree`, `GitPanel`, etc.).
    -   Passes down necessary props, including session protection functions, to child components.

### `Sidebar.jsx`

-   **Purpose:** The main navigation sidebar on the left.
-   **Core Functionality:**
    -   Lists all available projects and their chat sessions.
    -   Allows users to select, rename, and delete projects and sessions.
    -   Provides buttons for creating new projects and refreshing the project list.

### `SpecDesign/`

-   **Purpose:** A feature for generating detailed project specifications.
-   **Core Functionality:**
    -   Takes a high-level user query.
    -   Orchestrates multiple calls to the Gemini CLI to generate a design document, requirements, and implementation tasks.

### Other Components

-   **`DarkModeToggle.jsx`:** A switch for toggling between light and dark themes.
-   **`ErrorBoundary.jsx`:** A component that catches JavaScript errors in its child component tree and displays a fallback UI.
-   **`GeminiLogo.jsx` & `GeminiStatus.jsx`:** Components for displaying the Gemini logo and status indicators.
-   **`ImageViewer.jsx`:** A modal for viewing images.
-   **`LoginForm.jsx` & `SetupForm.jsx`:** Forms for user authentication and initial setup.
-   **`MicButton.jsx`:** A button for recording audio for transcription.
-   **`MobileNav.jsx`:** The bottom navigation bar for mobile devices.
-   **`ProtectedRoute.jsx`:** A component that ensures a user is authenticated before rendering its children.
-   **`QuickSettingsPanel.jsx`:** A slide-out panel for quick access to settings.
-   **`Shell.jsx`:** An interactive terminal emulator.
-   **`TodoList.jsx`:** A component for displaying and managing a todo list.
-   **`ToolsSettings.jsx`:** A modal for configuring tool permissions and other settings.
