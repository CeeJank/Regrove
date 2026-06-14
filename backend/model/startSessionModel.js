let mockSessions = [];

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