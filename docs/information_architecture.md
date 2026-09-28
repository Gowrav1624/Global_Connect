# Information Architecture

## 1. Purpose
This document describes how information and application features are organized in Global Connect.

## 2. Top-Level Structure
- Authentication
  - Login
  - Registration
  - OAuth
- Main Application
  - Feed
  - Profile
  - Connections
  - Messages
  - Jobs
  - Notifications
- Administration
  - Users
  - Reports
  - Moderation

## 3. Content Relationships
### User
A user may have:
- Profile information
- Connections
- Posts
- Messages
- Notifications
- Job-related activity

### Post
A post belongs to a user and may be displayed in relevant feed views.

### Connection
A connection represents a relationship/request between users.

### Conversation
A conversation contains messages exchanged between authorized users.

### Job
A job contains information intended for job discovery and related interaction.

## 4. Navigation Rules
- Public authentication pages should not require an authenticated session.
- Protected application features require authentication.
- Administrative areas require appropriate authorization.
- Navigation should expose only actions available to the current user.

## 5. Search and Discovery
Search functionality should allow users to locate supported profiles or other approved content efficiently while respecting authorization and privacy rules.
