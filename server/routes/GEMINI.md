# Gemini CLI UI - Server Routes

This directory defines the API routes for the Gemini CLI UI server.

## File Overview

### `auth.js`

-   **Purpose:** Handles all authentication-related API endpoints.
-   **Routes:**
    -   `GET /api/auth/status`: Checks if a user account has been set up.
    -   `POST /api/auth/register`: Creates the initial user account. This is only allowed if no other users exist.
    -   `POST /api/auth/login`: Authenticates a user and returns a JWT.
    -   `GET /api/auth/user`: Retrieves the currently authenticated user's information.
    -   `POST /api/auth/logout`: A placeholder endpoint for logging out (logout is primarily handled on the client-side by clearing the token).

### `git.js`

-   **Purpose:** Provides API endpoints for interacting with Git repositories.
-   **Functionality:** It executes Git commands using `child_process.exec` to perform various operations.
-   **Routes:**
    -   `GET /api/git/status`: Gets the current status of the repository (modified, added, deleted, untracked files).
    -   `GET /api/git/diff`: Gets the diff for a specific file.
    -   `POST /api/git/commit`: Commits staged changes with a given message.
    -   `GET /api/git/branches`: Lists all local and remote branches.
    -   `POST /api/git/checkout`: Checks out a specific branch.
    -   `POST /api/git/create-branch`: Creates a new branch.
    -   `GET /api/git/commits`: Retrieves a list of recent commits.
    -   `GET /api/git/commit-diff`: Gets the diff for a specific commit.
    -   `POST /api/git/generate-commit-message`: Generates a commit message based on staged changes.
    -   `GET /api/git/remote-status`: Checks if the local branch is ahead or behind the remote branch.
    -   `POST /api/git/fetch`: Fetches changes from the remote repository.
    -   `POST /api/git/pull`: Pulls changes from the remote repository.
    -   `POST /api/git/push`: Pushes changes to the remote repository.
    -   `POST /api/git/discard`: Discards changes for a specific file.

### `mcp.js`

-   **Purpose:** Appears to be a legacy or unused module for managing "Multi-Cloud Provider" (MCP) servers through a "Claude CLI".
-   **Functionality:** It defines routes to list, add, remove, and get details of MCP servers by spawning a `claude` command-line process.
-   **Note:** This module does not seem to be actively used in the Gemini-focused parts of the application.
