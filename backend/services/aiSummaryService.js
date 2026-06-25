const { callGeminiWithMetadata } = require("./geminiService");
const { detectRiskLevel } = require("../utils/riskDetection");

function getRecommendedAction(riskLevel) {
  if (riskLevel === "high") {
    return "Review this conversation as soon as possible and check the youth's immediate safety.";
  }

  if (riskLevel === "medium") {
    return "Follow up with the youth and explore what support they need right now.";
  }

  return "Follow up normally and continue the conversation in a calm, supportive way.";
}

function getSuggestedOpeningMessage(riskLevel) {
  if (riskLevel === "high") {
    return "Hi, I read your after-hours message. Are you safe right now?";
  }

  if (riskLevel === "medium") {
    return "Hi, I read what you shared after-hours. How are you feeling today?";
  }

  return "Hi, thanks for sharing with us. I wanted to check in and continue from where you left off.";
}

function buildSummaryPrompt(transcript) {
  return `You are summarizing an after-hours chat between a youth and an AI support assistant for a youth worker.

Read the whole transcript from start to end before writing.
Write one clear handover summary that captures all important main points from the full conversation, not only the latest message.

The summary should help the youth worker understand:
- why the youth reached out
- what the youth shared across the whole chat
- what happened during the conversation
- how the youth seemed to feel
- any important context, repeated concerns, or changes during the conversation

Do not give recommendations.
Do not give action items.
Do not include urgency level.
Do not repeat the transcript line by line.
Do not add information that is not in the transcript.
Do not ignore earlier messages just because later messages exist.

Use this exact layout with blank lines between sections:

Main concern
[One clear paragraph about why the youth reached out and the central concern.]

What the youth shared
[One or two paragraphs covering the key details from the youth's messages across the whole transcript.]

How the youth seemed to feel
[One short paragraph about the youth's apparent emotions, only based on the transcript.]

Conversation context
[One paragraph explaining how the AI or worker responded and any important context for handover.]

Transcript:
${transcript}`;
}

function parseTranscript(transcript) {
  return String(transcript || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf(":");

      if (separatorIndex === -1) {
        return {
          sender: "unknown",
          text: line,
        };
      }

      return {
        sender: line.slice(0, separatorIndex).trim().toLowerCase(),
        text: line.slice(separatorIndex + 1).trim(),
      };
    });
}

function isUsefulMessage(text) {
  const value = String(text || "").trim().toLowerCase();

  return value.length > 2 && !["hello", "hello there", "hi", "haha", "blablab"].includes(value);
}

function sentenceList(items, maxItems) {
  const selectedItems = items
    .map((item) => item.text)
    .filter(isUsefulMessage)
    .slice(-maxItems);

  if (selectedItems.length === 0) {
    return "There were limited clear details in the transcript.";
  }

  return selectedItems.map((text) => `"${text}"`).join("; ");
}

function getFallbackSummary(transcript) {
  const messages = parseTranscript(transcript);
  const youthMessages = messages.filter((item) => item.sender === "youth");
  const aiMessages = messages.filter((item) => item.sender === "ai");
  const workerMessages = messages.filter((item) => item.sender === "worker");
  const usefulYouthMessages = youthMessages.filter((item) => isUsefulMessage(item.text));
  const firstYouthConcern = usefulYouthMessages[0]?.text || "the youth reached out after hours";
  const latestYouthDetails = sentenceList(usefulYouthMessages, 12);
  const supportContext = [];

  if (aiMessages.length > 0) {
    supportContext.push("The AI support assistant responded with supportive after-hours messages and told the youth that a youth worker could follow up during working hours.");
  }

  if (workerMessages.length > 0) {
    supportContext.push("There were also worker messages in the conversation, so the transcript includes both after-hours AI support and worker follow-up.");
  }

  if (supportContext.length === 0) {
    supportContext.push("The transcript mainly contains youth messages, with limited response context available.");
  }

  return `Main concern
The youth reached out during an after-hours chat and appeared to be looking for support around this concern: "${firstYouthConcern}".

What the youth shared
The youth's messages included these key details: ${latestYouthDetails}.

How the youth seemed to feel
Based only on the transcript, the youth seemed distressed, pressured, or unsure how to explain what they were going through.

Conversation context
${supportContext.join(" ")}`;
}

function isWeakSummary(summaryText) {
  const text = String(summaryText || "").trim();
  const requiredSections = [
    "Main concern",
    "What the youth shared",
    "How the youth seemed to feel",
    "Conversation context",
  ];

  return (
    text.length < 180 ||
    text.endsWith(" from") ||
    text.endsWith(" and") ||
    !text.includes("\n\n") ||
    requiredSections.some((section) => !text.includes(section))
  );
}

async function generateSummary(transcript) {
  const safeTranscript = String(transcript || "No transcript content provided.").trim();
  const riskLevel = detectRiskLevel(safeTranscript);
  const recommendedAction = getRecommendedAction(riskLevel);
  const suggestedOpeningMessage = getSuggestedOpeningMessage(riskLevel);
  let summaryText = getFallbackSummary(safeTranscript);

  try {
    const aiSummary = await callGeminiWithMetadata(
      buildSummaryPrompt(safeTranscript),
      {
        temperature: 0.35,
        maxOutputTokens: 2200,
      }
    );

    summaryText = aiSummary.finishReason !== "MAX_TOKENS" && !isWeakSummary(aiSummary.text)
      ? aiSummary.text
      : summaryText;
  } catch (error) {
    console.warn("Gemini handover summary failed, using fallback:", error.message);
  }

  return {
    summaryText,
    riskLevel,
    recommendedAction,
    suggestedOpeningMessage,
  };
}

function buildCansSummaryPrompt(transcript) {
  return `You are a clinical assistant helping a social worker complete a CANS (Child and Adolescent Needs and Strengths) assessment based on an audio session transcript.

Review the transcript and rate each domain using only what is explicitly discussed or observable. Do not infer beyond the transcript.

Needs rating scale (higher = more urgent):
0 — No evidence of need
1 — Some concern (watchful)
2 — Action needed (moderate concern)
3 — Immediate / intensive action needed

Strengths rating scale (lower = stronger):
0 — Strength well-developed (actively use in planning)
1 — Some strength present (build on it)
2 — Potential strength (needs development)
3 — No evidence of strength

Use this exact format, replacing [N] with the rating number and [text] with a direct quote or "No evidence in transcript":

## Life Functioning

**Family:** [N]
Evidence: [text]

**Living Situation:** [N]
Evidence: [text]

**School / Work:** [N]
Evidence: [text]

**Social Functioning:** [N]
Evidence: [text]

## Behavioural / Emotional Needs

**Depression / Anxiety:** [N]
Evidence: [text]

**Self-Harm / Suicidality:** [N]
Evidence: [text]

**Trauma Experiences:** [N]
Evidence: [text]

**Substance Use:** [N]
Evidence: [text]

**Risk Behaviours:** [N]
Evidence: [text]

## Strengths

**Family Support:** [N]
Evidence: [text]

**Interpersonal / Social Skills:** [N]
Evidence: [text]

**Recreational / Hobbies:** [N]
Evidence: [text]

## Session Summary
[Two to three sentences summarising what was discussed and any key concerns or strengths to follow up on.]

Transcript:
${transcript}`;
}

async function generateCansSummary(transcript) {
  const safeTranscript = String(transcript || "No transcript content provided.").trim();

  try {
    const aiResult = await callGeminiWithMetadata(buildCansSummaryPrompt(safeTranscript), {
      temperature: 0.25,
      maxOutputTokens: 2800,
    });

    if (aiResult.text && aiResult.finishReason !== "MAX_TOKENS") {
      return aiResult.text;
    }
  } catch (error) {
    console.warn("Gemini CANS summary failed:", error.message);
  }

  return `## Session Summary\nTranscript received but AI summarisation failed. Please review the raw transcript manually.\n\nTranscript excerpt:\n${safeTranscript.slice(0, 500)}`;
}

module.exports = {
  generateSummary,
  generateCansSummary,
};
