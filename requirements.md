# Collection App Requirements Document

## Project Overview

An app designed for individuals who visit multiple shops weekly to collect payments. Built with React Native Expo, focusing on local data storage and efficient collection tracking.

## Phase 1 Features

### 1. Data Management (AsyncStorage)

- Store and retrieve trip and shop data locally
- Save current trip state for resume functionality
- Maintain completed trips history

### 2. Trip Management

- Home screen with trips list (e.g., "Sunday Collection")
- CRUD operations for trips
- Shop management within trips
- Drag-and-drop shop reordering (Expo dependent)

### 3. Shop Visit Tracking

- Sequential shop visits within active trips
- Per shop actions:
  - Enter collected amount
  - Mark shop as closed
- Automatic progression to next shop
- AsyncStorage integration for data persistence

### 4. Shop Input Modal

Features:

- Current shop name display
- Amount input field
- Action buttons:
  - Submit Amount
  - Shop Closed
- Auto-advance to next shop

### 5. Persistent Notifications

Uber-style persistent UI:

- Current shop display
- Navigation controls (Next/Previous)
- Active until trip completion

## User Flow

### Home Screen

- Trip list view
- Trip CRUD operations

### Trip Management

- Shop CRUD operations
- Shop reordering
- Trip initiation

### Active Trip

- Modal-based input
- Amount entry/shop closure
- Automatic progression
- Persistent navigation controls

### Trip Completion

- Data persistence
- Return to home screen

## UI/UX Guidelines

Following Uber's design principles:

- Dark theme with high contrast
- Minimalist, intuitive layout
- Bottom-aligned controls
- Clear iconography
- Smooth animations and transitions
