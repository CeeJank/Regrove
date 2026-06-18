const axios = require("axios");

const API_BASE = process.env.API_BASE || "http://localhost:3000";
const TEST_YOUTH_ID = Number(process.env.TEST_YOUTH_ID || 1);
const TEST_WORKER_ID = Number(process.env.TEST_WORKER_ID || 1);

function logStep(message) {
  console.log(`\n[AI chat test] ${message}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function request(method, path, data) {
  try {
    const response = await axios({
      method,
      url: `${API_BASE}${path}`,
      data,
      validateStatus: () => true,
    });

    if (response.status >= 400) {
      throw new Error(
        `${method.toUpperCase()} ${path} failed with ${response.status}: ${JSON.stringify(
          response.data
        )}`
      );
    }

    return response.data;
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      throw new Error(
        `Cannot connect to ${API_BASE}. Start the backend first with docker compose up --build.`
      );
    }

    throw error;
  }
}

async function runAiChatTest() {
  logStep("Checking backend health");
  const health = await request("get", "/");
  assert(String(health).includes("Backend is running"), "Health check failed");

  logStep("Checking database connection");
  const db = await request("get", "/test-db");
  assert(db.message === "Database connected", "Database check failed");

  logStep("Creating a fresh test conversation");
  const conversation = await request("post", "/api/conversations", {
    userId: TEST_YOUTH_ID,
    workerId: TEST_WORKER_ID,
  });
  const conversationId = conversation.conversation_id;
  assert(conversationId, "Conversation was not created");
  console.log(`Created conversation ${conversationId}`);

  logStep("Sending a youth message with forceAi=true");
  const youthResponse = await request("post", "/api/messages", {
    conversationId,
    userId: TEST_YOUTH_ID,
    message: "Hi, I need someone to talk to. This is an automated test.",
    forceAi: true,
  });
  assert(youthResponse.youthMessage, "Youth message was not saved");
  assert(youthResponse.aiReply, "AI reply was not created");

  logStep("Loading messages from the shared conversation");
  const messages = await request("get", `/api/messages/${conversationId}`);
  assert(Array.isArray(messages), "Messages response is not an array");
  assert(messages.length >= 2, "Expected youth message and AI reply");

  logStep("Getting JSON transcript");
  const transcript = await request(
    "get",
    `/api/conversations/${conversationId}/transcript`
  );
  assert(transcript.transcript, "Transcript was not returned");

  logStep("Generating or updating handover summary");
  const summaryResponse = await request(
    "post",
    `/api/summaries/${conversationId}`
  );
  assert(summaryResponse.summary, "Summary was not created");

  logStep("Confirming the conversation appears in worker handover list");
  const handovers = await request("get", "/api/workers/handover");
  const handoverMatch = handovers.find(
    (item) => Number(item.conversation_id) === Number(conversationId)
  );
  assert(handoverMatch, "Conversation did not appear in handover list");

  logStep("Marking handover as reviewed");
  const reviewed = await request(
    "patch",
    `/api/workers/handover/${conversationId}/reviewed`
  );
  assert(
    reviewed.conversation && reviewed.conversation.needs_handover === false,
    "Handover was not marked reviewed"
  );

  logStep("Confirming reviewed conversation is removed from pending handovers");
  const handoversAfterReview = await request("get", "/api/workers/handover");
  const stillPending = handoversAfterReview.find(
    (item) => Number(item.conversation_id) === Number(conversationId)
  );
  assert(!stillPending, "Reviewed conversation still appears in handover list");

  logStep("Sending a worker reply after review");
  const workerResponse = await request("post", "/api/messages", {
    conversationId,
    workerId: TEST_WORKER_ID,
    senderType: "worker",
    message: "Thanks for sharing. I will follow up with you during working hours.",
  });
  assert(workerResponse.workerMessage, "Worker reply was not saved");

  logStep("AI chat flow passed");
  console.log(`Conversation tested: ${conversationId}`);
}

runAiChatTest().catch((error) => {
  console.error("\n[AI chat test] FAILED");
  console.error(error.message);
  process.exit(1);
});
