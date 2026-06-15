function formatTranscript(messages) {
  // Turn each message object into one readable transcript line.
  return messages
    .map((message) => `${message.sender_type}: ${message.message}`)
    .join("\n");
}

module.exports = {
  formatTranscript,
};
