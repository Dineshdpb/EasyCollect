# Collection App Requirements Document

## Project Overview

An app designed for individuals who visit multiple shops weekly to collect payments. Built with React Native Expo, focusing on local data storage and efficient collection tracking.

## Phase 1 Features

### 1. Data Management (AsyncStorage)

- Store and retrieve trip and shop data locally
- Save current trip state for resume functionality
- Maintain completed trips history
- Store historical notes and amounts for each shop

### 2. Trip Management

- Home screen with trips list (e.g., "Sunday Collection")
- CRUD operations for trips
- Shop management within trips
- Drag-and-drop shop reordering (Expo dependent)
- Edit capability for amounts and notes in completed and running trips

### 3. Shop Visit Tracking

- Sequential shop visits within active trips
- Per shop actions:
  - Enter collected amount (with toggle visibility option)
  - Mark shop as closed
  - Add/edit notes
- View historical notes and amounts
- Automatic progression to next shop
- AsyncStorage integration for data persistence

### 4. Shop Input Modal

Features:

- Current shop name display
- Amount input field (toggleable visibility like password field)
- Notes input field
- Historical data display (previous notes and amounts)
- Action buttons:
  - Submit Amount
  - Shop Closed
  - Toggle Amount Visibility
- Auto-advance to next shop

### 5. Persistent Notifications

Uber-style persistent UI:

- Current shop display
- Navigation controls (Next/Previous)
- Active until trip completion
- Quick access to edit amount and notes

## User Flow

### Home Screen

- Trip list view
- Trip CRUD operations

### Trip Management

- Shop CRUD operations
- Shop reordering via drag and drop
- Trip initiation
- Historical data access

### Active Trip

- Modal-based input
- Amount entry with visibility toggle
- Notes management
- Shop closure
- Automatic progression
- Persistent navigation controls
- Edit capability for amounts and notes

### Trip Completion

- Data persistence
- Return to home screen
- Maintain editability of completed trip data

## UI/UX Guidelines

Following Uber's design principles:

- Dark theme with high contrast
- Minimalist, intuitive layout
- Bottom-aligned controls
- Clear iconography
- Smooth animations and transitions
- Drag and drop interactions
