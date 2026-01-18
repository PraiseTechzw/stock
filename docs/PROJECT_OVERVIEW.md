# Project Overview

This is a React Native project built with Expo and Expo Router.

## Architecture

-   **App Directory (`app/`)**: File-based routing provided by Expo Router.
-   **Source Directory (`src/`)**: Contains the core logic and reusable code.
    -   `components/`: Reusable UI components.
    -   `hooks/`: Custom React hooks.
    -   `store/`: State management (Zustand).
    -   `db/`: Database configuration (Drizzle/SQLite).
    -   `theme/`: Theming and styling constants.

## Tech Stack

-   **Framework**: React Native (Expo)
-   **Routing**: Expo Router
-   **Database**: SQLite with Drizzle ORM
-   **State Management**: Zustand
-   **UI Library**: React Native Paper
-   **Animations**: React Native Reanimated
-   **Styling**: StyleSheet / React Native Paper theming

## Getting Started

1.  **Install Dependencies**: `npm install`
2.  **Start Development Server**: `npm run start` or `npx expo start`
3.  **Run on Device**: Scan the QR code with Expo Go.

## Key Features

-   **Authentication**: Secure login flow.
-   **Offline First**: Local SQLite database ensures functionality without internet.
-   **Theming**: Light and Dark mode support.
