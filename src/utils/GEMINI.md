# Gemini CLI UI - Utilities

This directory contains utility modules that provide specific functionalities for the frontend.

## Utility Overview

### `api.js`

-   **Purpose:** A centralized module for making API calls to the backend server.
-   **Core Functionality:**
    -   **`authenticatedFetch`:** A wrapper around the native `fetch` function that automatically attaches the JWT authentication token (retrieved from `localStorage`) to the `Authorization` header of each request.
    -   **API Endpoints:** Exports an `api` object that organizes all backend endpoints into a clear and reusable structure (e.g., `api.auth.login`, `api.projects`, `api.readFile`).

### `notificationSound.js`

-   **Purpose:** Manages the playback of notification sounds in the application.
-   **Core Functionality:**
    -   **Web Audio API:** Uses the browser's Web Audio API to generate a simple, pleasant two-tone chime sound programmatically. This avoids the need for an external audio file.
    -   **Sound Control:** Checks `localStorage` to see if notification sounds are enabled in the user's settings before playing any sound.
    -   **Audio Context Management:** Handles the creation and resumption of the `AudioContext`, which is necessary for audio playback in modern browsers.

### `websocket.js`

-   **Purpose:** Provides a custom React hook (`useWebSocket`) for managing the WebSocket connection to the backend server.
-   **Core Functionality:**
    -   **Connection Management:** Establishes and maintains the WebSocket connection, including handling connection errors and automatic reconnection attempts.
    -   **Authentication:** Includes the JWT token in the WebSocket connection URL for authentication.
    -   **Message Handling:** Provides a `sendMessage` function for sending JSON messages to the server and manages an array of `messages` received from the server, which components can then use to update their state.

### `whisper.js`

-   **Purpose:** A utility for transcribing audio using the OpenAI Whisper API.
-   **Core Functionality:**
    -   **API Interaction:** Takes an audio blob, creates a `FormData` object, and sends it to the backend's `/api/transcribe` endpoint.
    -   **Mode Handling:** Supports different transcription modes (`default`, `prompt`, `vibe`, etc.) that can be passed to the backend to optionally enhance the transcribed text using a GPT model.
