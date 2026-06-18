let mockSessions = [];

// Model responsibility:
// Demo/mock session storage for starting a worker session.
// Replace this with PostgreSQL when session start should persist permanently.

// Creates an in-memory active session for one worker/youth pair.
exports.createSession = (workerId, childId) => {
  const session = {
    sessionId: Date.now().toString(),
    childId,
    workerId,
    status: "active",
    startedAt: new Date().toISOString()
  };

  mockSessions.push(session);
  return session;
};
