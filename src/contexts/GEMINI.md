# Gemini CLI UI - Context Providers

This directory contains React Context providers that manage global state for different parts of the application.

## Component Overview

### `AuthContext.jsx`

-   **Purpose:** Manages user authentication state throughout the application.
-   **Core Functionality:**
    -   **State:** Tracks the current user, authentication token, loading state, and whether the initial setup is needed.
    -   **Functions:** Provides `login`, `register`, and `logout` functions that interact with the backend API.
    -   **Persistence:** Stores the authentication token in `localStorage` to keep the user logged in across sessions.
    -   **Initialization:** On application load, it checks the authentication status, determines if setup is required, and verifies any existing token.

### `SettingsContext.jsx`

-   **Purpose:** Manages user-configurable settings, such as tool permissions and project sorting preferences.
-   **Core Functionality:**
    -   **State:** Holds the current settings object.
    -   **Persistence:** Saves settings to `localStorage` so they are preserved across sessions.
    -   **Cross-Tab Syncing:** Listens for `storage` events to keep settings synchronized across multiple browser tabs.
    -   **Convenience Accessors:** Provides easy access to individual settings like `allowedTools`, `selectedModel`, etc.

### `ThemeContext.jsx`

-   **Purpose:** Manages the application's theme (light or dark mode).
-   **Core Functionality:**
    -   **State:** Tracks whether dark mode is currently active.
    -   **Persistence:** Saves the user's theme preference to `localStorage`.
    -   **System Preference:** Defaults to the user's operating system theme preference if no manual selection has been made.
    -   **Dynamic Updates:** Updates the `<html>` element with the `dark` class to apply Tailwind CSS dark mode styles.
