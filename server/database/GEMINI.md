# Gemini CLI UI - Server Database

This directory contains the database setup for the Gemini CLI UI server.

## File Overview

### `db.js`

-   **Purpose:** Establishes a connection to the SQLite database and provides functions for user-related database operations.
-   **Database:** Uses `better-sqlite3` for synchronous SQLite operations.
-   **Initialization:** Reads the `init.sql` file to set up the database schema when the application starts.
-   **User Operations:**
    -   `hasUsers()`: Checks if any users exist in the database.
    -   `createUser(username, passwordHash)`: Creates a new user with a hashed password.
    -   `getUserByUsername(username)`: Retrieves a user by their username.
    -   `updateLastLogin(userId)`: Updates the last login timestamp for a user.
    -   `getUserById(userId)`: Retrieves a user by their ID.

### `init.sql`

-   **Purpose:** Defines the database schema for the authentication system.
-   **Table:** Creates a `geminicliui_users` table to store user information, including username, password hash, creation date, last login date, and an active status flag.
-   **Indexes:** Creates indexes on the `username` and `is_active` columns to improve query performance.
