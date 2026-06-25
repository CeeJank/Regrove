# Backend API Endpoints

Base URL during local development:

```text
http://localhost:3000
```

## Automated AI Chat Test

Start the backend first:

```powershell
docker compose up --build
```

In another terminal, run:

```powershell
npm run test:ai-chat
```

The script creates a fresh test conversation and checks the full flow:

```text
health check -> database check -> youth message -> AI reply -> transcript -> summary -> handover -> mark reviewed -> worker reply
```

## Health

### GET `/`

Checks whether the Express backend is running.

### GET `/test-db`

Checks whether PostgreSQL is connected by running `SELECT NOW()`.

## Conversations

### POST `/api/conversations`

Creates a new conversation/session between a youth and a worker.

Body:

```json
{
  "userId": 1,
  "workerId": 1
}
```

### GET `/api/conversations`

Returns all conversations with youth profile, assigned worker, status, mode, risk, and handover information.

### GET `/api/conversations/:id`

Returns one conversation by ID.

### GET `/api/conversations/:id/transcript`

Returns a JSON transcript for one conversation.

### GET `/api/conversations/:id/transcript/download`

Downloads the conversation transcript as a `.txt` file.

## Messages

### POST `/api/messages`

Saves a new message into a shared conversation.

Youth message body:

```json
{
  "conversationId": 1,
  "userId": 1,
  "message": "Hi, I need someone to talk to.",
  "forceAi": true
}
```

Worker message body:

```json
{
  "conversationId": 1,
  "workerId": 1,
  "senderType": "worker",
  "message": "Thanks for sharing. I'm here with you."
}
```

If a youth message is after-hours or `forceAi` is `true`, the AI replies and the conversation is marked for handover.

### GET `/api/messages/:conversationId`

Returns all messages for one conversation in chronological order.

## Summaries

### POST `/api/summaries/:conversationId`

Formats the transcript, generates a fake AI summary, saves it, and creates a handover report.

### GET `/api/summaries/:conversationId`

Returns all generated summaries for one conversation, newest first.

## Worker Handover

### GET `/api/workers/handover`

Returns conversations that need human worker follow-up after after-hours AI support.

### PATCH `/api/workers/handover/:conversationId/reviewed`

Marks a handover as reviewed after the worker has checked the transcript/summary.

This endpoint:

- sets matching `handover_reports.reviewed` to `true`
- changes the session back to `ACTIVE`
- changes the session mode back to `WORKER_CHAT`
- removes the conversation from the pending handover list

## Worker Dashboard

### GET `/api/workers/children/recent`

Returns recent youth profiles assigned to the authenticated worker.

## Youth Profile

### GET `/api/children/:childId`

Returns detailed profile information for one youth.

## Audio Transcription

### POST `/api/session/transcribe`

Uploads an audio file using form-data field `audio` and starts transcription.

## Session Start

### POST `/api/session/start`

Starts a worker session for an assigned youth.

## Legacy Chat

These endpoints are kept for older frontend/API compatibility. New chat code should use `/api/conversations` and `/api/messages`.

### POST `/api/chat/message`

Legacy youth chat message endpoint.

Body:

```json
{
  "youthId": 1,
  "message": "Hi",
  "conversationId": 1
}
```

### GET `/api/chat/:conversationId`

Legacy endpoint that returns one conversation and its messages.
