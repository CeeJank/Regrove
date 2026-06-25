async function generateAIReply(userMessage) {
  const message = String(userMessage || "").trim();

  // This is a fake reply for now. Later, this function can call Gemini.
  if (!message) {
    return "I'm here to listen. A human youth worker can follow up during working hours. Could you tell me a little more about what you are feeling right now?";
  }

  return "I'm here to listen. Thank you for sharing that with me. A youth worker may not be available right now, but your message will be shared with them during working hours so they can follow up. Could you tell me a little more about what happened?";
}

module.exports = {
  generateAIReply,
};
