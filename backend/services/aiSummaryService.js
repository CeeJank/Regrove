async function generateSummary(transcript) {
  return `Main Issue:
The youth contacted the support chat after working hours.

Important Details:
${transcript}

Youth Mood:
Unable to fully determine from fake summary.

Urgency Level:
Medium

Recommended Next Action:
A youth worker should review the transcript and follow up with the youth during working hours.`;
}

module.exports = {
  generateSummary,
};
