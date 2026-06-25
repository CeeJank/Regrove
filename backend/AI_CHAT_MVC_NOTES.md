# AI Chat Feature Structure

This feature now follows the project MVC pattern more closely.

## Controllers

Controllers only handle request and response shape.

- `controllers/conversationController.js`
- `controllers/chatController.js`
- `controllers/messageController.js`
- `controllers/summaryController.js`
- `controllers/workerController.js`

## Models

Models contain PostgreSQL queries.

- `models/conversationModel.js`
- `models/chatModel.js`
- `models/messageModel.js`
- `models/summaryModel.js`
- `models/workerModel.js`

## Services

Services contain feature logic that can be reused by controllers.

- `services/messageService.js`
  - worker replies
  - youth messages
  - after-hours AI reply
  - handover status update
- `services/legacyChatService.js`
  - adapter service for the older `/api/chat` route
  - keeps the legacy route reusable without controller-owned chat logic
- `services/summaryService.js`
  - transcript formatting
  - fake AI summary generation
  - handover report creation

## Middleware

- `middleware/asyncHandler.js`
  - catches async controller errors
- `middleware/errorHandler.js`
  - central JSON error response
- `middleware/validateChatRequest.js`
  - validates conversation and message request bodies

## Useful Endpoints

- `GET /api/conversations`
- `GET /api/conversations/:id`
- `GET /api/conversations/:id/transcript`
- `GET /api/conversations/:id/transcript/download`
- `POST /api/chat/message`
- `GET /api/chat/:conversationId`
- `POST /api/messages`
- `GET /api/messages/:conversationId`
- `POST /api/summaries/:conversationId`
- `GET /api/summaries/:conversationId`
- `GET /api/workers/handover`
