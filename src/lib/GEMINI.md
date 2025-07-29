# Gemini CLI UI - Library Utilities

This directory contains general utility functions that can be used across the application.

## Utility Overview

### `utils.js`

-   **Purpose:** Provides a utility function for combining CSS classes.
-   **Functionality:**
    -   **`cn(...inputs)`:** A function that merges multiple class names into a single string. It uses `clsx` to conditionally apply classes and `tailwind-merge` to resolve conflicting Tailwind CSS utility classes, ensuring a clean and predictable final class string.
