# Gemini CLI UI - Custom Hooks

This directory contains custom React hooks that encapsulate reusable logic.

## Hook Overview

### `useAudioRecorder.js`

-   **Purpose:** Provides a simple hook for recording audio from the user's microphone.
-   **Core Functionality:**
    -   **State Management:** Tracks the recording state (`isRecording`), the resulting audio blob, and any errors.
    -   **MediaRecorder API:** Uses the browser's `MediaRecorder` API to handle the actual audio recording.
    -   **Lifecycle Functions:** Exposes `start`, `stop`, and `reset` functions to control the recording process.

### `useVersionCheck.js`

-   **Purpose:** A hook that checks for new versions of the Gemini CLI UI application on GitHub.
-   **Core Functionality:**
    -   **GitHub API:** Fetches the latest release information from the specified GitHub repository.
    -   **Version Comparison:** Compares the `tag_name` of the latest release with the `version` in the local `package.json` file.
    -   **State:** Provides boolean `updateAvailable`, `latestVersion`, and `currentVersion` to the component, so it can notify the user if an update is available.
    -   **Polling:** Periodically re-checks for new versions.
