# Designwear Backend Architecture

## Overview

The `designwear-backend` project relies on a modular architecture taking advantage of Next.js App Router for backend APIs and frontend entry points, backed by Sanity CMS and Google's GenAI capabilities.

## Key Components

### 1. Next.js (`app/`)
Uses the modern app router pattern. API routes (e.g., `app/api/`) handle incoming requests for webhooks, metrics, database queries, and other backend functionalities.

### 2. Sanity CMS (`sanity/` & `sanity.config.ts`)
Manages the structured content for the application. Actions such as `PublishAndSync.ts` indicate an active content synchronization workflow.

### 3. Payment Processing
Integrates `razorpay` to securely accept and distribute online payments.

### 4. Authentication && Firebase (`firebase-admin`)
Handles privileged operations requiring server-level authentication and authorization.

### 5. Logging (`winston`)
Detailed backend transaction and error logging to monitor application health and performance.

### 6. AI Features (`@google/genai`)
Extends the application with AI features leveraging Google's GenAI tools.
