const axios = require("axios");

// Service responsibility:
// Wrap all Gemini API calls in one place so chat and summary services do not
// need to know request URLs, retry rules, response parsing, or API key names.

const DEFAULT_MODEL = "gemini-2.5-flash";

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY || process.env.AI_API_KEY || "";
}

function getGeminiModel() {
  return process.env.GEMINI_MODEL || process.env.AI_MODEL || DEFAULT_MODEL;
}

function getTextFromGeminiResponse(data) {
  const parts = data?.candidates?.[0]?.content?.parts || [];

  return parts
    .map((part) => part.text)
    .filter(Boolean)
    .join("\n")
    .trim();
}

// Gemini includes a finish reason. Services use this to reject cut-off output.
function getFinishReasonFromGeminiResponse(data) {
  return data?.candidates?.[0]?.finishReason || "";
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(error) {
  const status = error.response?.status;

  return status === 429 || status === 500 || status === 502 || status === 503;
}

async function callGeminiWithMetadata(prompt, options = {}) {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return {
      text: null,
      finishReason: "NO_API_KEY",
    };
  }

  const model = getGeminiModel();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const temperature = options.temperature ?? 0.55;
  const maxOutputTokens = options.maxOutputTokens ?? 900;

  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await axios.post(
        url,
        {
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature,
            maxOutputTokens,
          },
        },
        {
          params: { key: apiKey },
          timeout: 15000,
        }
      );

      return {
        text: getTextFromGeminiResponse(response.data),
        finishReason: getFinishReasonFromGeminiResponse(response.data),
      };
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

// Convenience wrapper for callers that only need the text.
async function callGemini(prompt, options = {}) {
  const result = await callGeminiWithMetadata(prompt, options);

  return result.text;
}

module.exports = {
  callGemini,
  callGeminiWithMetadata,
};
