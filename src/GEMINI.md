# Gemini CLI UI - Source Root (`src`)

This directory is the heart of the React frontend application, containing all the components, contexts, hooks, and utilities that make up the user interface.

## Core Principles

-   **Component-Based Architecture:** The UI is built as a collection of reusable and modular React components.
-   **Centralized State Management:** React Context is used to manage global state like authentication and theming.
-   **Utility-First Styling:** Tailwind CSS is used for all styling, ensuring a consistent and maintainable design system.

## Subdirectory Overview

For more detailed information, please refer to the `GEMINI.md` file within each subdirectory:

*   **[./components/GEMINI.md](./components/GEMINI.md):** All reusable React components.
*   **[./contexts/GEMINI.md](./contexts/GEMINI.md):** Global state management using React Context.
*   **[./hooks/GEMINI.md](./hooks/GEMINI.md):** Custom React hooks for reusable logic.
*   **[./lib/GEMINI.md](./lib/GEMINI.md):** General utility functions.
*   **[./utils/GEMINI.md](./utils/GEMINI.md):** Application-specific utilities, such as API handling and WebSocket management.

## Key Files

### `App.jsx`

-   **Purpose:** The main application component that orchestrates the entire UI.
-   **Core Functionality:**
    -   **Routing:** Uses `react-router-dom` to manage application routes (e.g., `/` and `/session/:sessionId`).
    -   **State Management:** Manages the primary state of the application, including the list of projects, the currently selected project and session, and the active UI tab.
    -   **Component Composition:** Assembles the main UI components like `Sidebar`, `MainContent`, and `MobileNav`.
    -   **WebSocket Integration:** Initializes the `useWebSocket` hook and handles incoming messages, particularly for real-time project updates.
    -   **Session Protection System:** Implements a critical feature to prevent WebSocket updates from disrupting active chat sessions. It tracks which sessions are "active" and pauses project list refreshes until the conversation is complete, ensuring a smooth user experience.

### `index.css`

-   **Purpose:** The main stylesheet for the application, written using Tailwind CSS.
-   **Core Functionality:**
    -   **Tailwind Imports:** Imports the base Tailwind CSS styles.
    -   **Theme Definition (`@theme`):** Defines the application's color palette using CSS custom properties and the OKLCH color model for perceptual uniformity. This includes Gemini brand colors and a professional zinc scale.
    -   **Global Styles:** Sets up base styles for the `body`, typography, and other global elements.
    -   **Advanced CSS:** Includes modern CSS techniques like glassmorphism, neumorphism, gradient effects, and custom animations to create a polished and visually appealing UI.

### `main.jsx`

-   **Purpose:** The entry point for the React application.
-   **Core Functionality:**
    -   **DOM Rendering:** Uses `ReactDOM.createRoot` to render the main `App` component into the `index.html` file.
    -   **Strict Mode:** Wraps the `App` component in `React.StrictMode` to enable checks and warnings for potential problems in the application.
