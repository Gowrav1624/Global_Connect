# Entity Relationship Diagram

## 1. Purpose
This document describes the principal data entities and relationships for Global Connect.

## 2. Core Entities

### User
Representative attributes:
- userId
- name
- email
- passwordHash
- profile information
- role
- timestamps

### Profile
Representative attributes:
- profileId
- userId
- bio
- skills
- professional information

### Connection
Representative attributes:
- connectionId
- requesterId
- recipientId
- status
- timestamps

### Post
Representative attributes:
- postId
- authorId
- content
- timestamps

### Message
Representative attributes:
- messageId
- conversationId
- senderId
- content
- timestamps

### Conversation
Representative attributes:
- conversationId
- participants
- timestamps

### Job
Representative attributes:
- jobId
- creator/organization reference
- title
- description
- metadata
- timestamps

### Notification
Representative attributes:
- notificationId
- recipientId
- type
- reference
- read status
- timestamps

### Report
Representative attributes:
- reportId
- reporterId
- target/reference
- reason
- status
- timestamps

## 3. Relationships
- User 1:N Profile/activity records as applicable.
- User N:M User through Connection.
- User 1:N Post.
- User N:M User through Conversation/Message participation.
- Conversation 1:N Message.
- User 1:N Notification.
- User 1:N Report as reporter.
- Administrative users manage applicable reports and users.

## 4. Implementation Note
The exact schema and field names must remain consistent with the implemented Mongoose models. This document describes the logical model rather than replacing the source schema.
