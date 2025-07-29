# Gemini CLI UI - Spec Design Components

This directory contains components related to the Specification Design feature, which allows users to generate detailed design documents, requirements, and implementation tasks from a high-level query.

## Component Overview

### `SpecDesign.jsx`

-   **Purpose:** The main component for the Specification Design feature. It orchestrates the entire process of generating a specification.
-   **Core Functionality:**
    -   **User Input:** Provides a text area for the user to describe the desired project or feature.
    -   **Sequential Generation:** Manages a multi-step process by making sequential calls to the Gemini CLI to generate:
        1.  A **Design Document**.
        2.  A **Requirements Document** based on the design.
        3.  An **Implementation Plan** (tasks) based on both the design and requirements.
    -   **State Management:** Tracks the current stage of the generation process (`input`, `generating`, `review`), the content of each generated document, and loading states.
    -   **WebSocket Integration:** Uses the `useWebSocket` hook to send generation commands to the backend and receive the results in real-time.
    -   **File Saving:** Allows the user to save the generated markdown files to a `specs` directory within their project.

### `ProgressIndicator.jsx`

-   **Purpose:** A visual component that shows the user the current progress of the specification generation process.
-   **Core Functionality:**
    -   **Stages:** Displays the different stages of the process (e.g., Input, Generate, Review).
    -   **Visual Feedback:** Highlights the current stage and indicates which stages are completed.
    -   **Loading Animation:** Shows loading and pulse animations when a stage is in progress.

### `ThinkingIndicator.jsx`

-   **Purpose:** Provides visual feedback that the AI is actively processing a request.
-   **Core Functionality:**
    -   **Displays Current Thought:** Shows the user what the AI is currently working on (e.g., "Analyzing requirements...").
    -   **Tool Calls:** Can display the tools the AI is using to complete the task.
    -   **Reasoning Steps:** Can show the intermediate reasoning steps the AI is taking.
