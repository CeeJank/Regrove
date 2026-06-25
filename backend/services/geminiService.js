const axios = require("axios");

// Wraps Kimi (Moonshot) API calls — OpenAI-compatible endpoint.
// All chat and summary services call through here so only this file
// needs changing if the provider changes again.

const KIMI_API_URL = "https://api.moonshot.ai/v1/chat/completions";
const DEFAULT_MODEL = "moonshot-v1-32k";

function getApiKey() {
  return process.env.GEMINI_API_KEY || process.env.AI_API_KEY || "";
}

function getModel() {
  return process.env.GEMINI_MODEL || process.env.AI_MODEL || DEFAULT_MODEL;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(error) {
  const status = error.response?.status;
  return status === 429 || status === 500 || status === 502 || status === 503;
}

// Kimi uses "length" for max-tokens cutoff; normalise to "MAX_TOKENS" so
// callers that check finishReason !== "MAX_TOKENS" keep working unchanged.
function normaliseFinishReason(reason) {
  if (reason === "length") return "MAX_TOKENS";
  return reason || "";
}

async function callGeminiWithMetadata(prompt, options = {}) {
  const apiKey = getApiKey();

  if (!apiKey) {
    return { text: null, finishReason: "NO_API_KEY" };
  }

  const model = getModel();
  const temperature = options.temperature ?? 0.55;
  const maxTokens = options.maxOutputTokens ?? 900;

  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await axios.post(
        KIMI_API_URL,
        {
          model,
          messages: [{ role: "user", content: prompt }],
          temperature,
          max_tokens: maxTokens,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      const choice = response.data?.choices?.[0];
      const text = choice?.message?.content?.trim() || "";
      const finishReason = normaliseFinishReason(choice?.finish_reason);

      return { text, finishReason };
    } catch (error) {
      lastError = error;

      if (attempt === 3 || !shouldRetry(error)) {
        throw error;
      }

      await delay(attempt * 800);
    }
  }

  throw lastError;
}

async function callGemini(prompt, options = {}) {
  const result = await callGeminiWithMetadata(prompt, options);
  return result.text;
}

module.exports = {
  callGemini,
  callGeminiWithMetadata,
};
