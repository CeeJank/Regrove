// src/services/aiChatService.js
// Creates a safe after-hours AI reply for youth chat.
// The service detects risk first, then asks Gemini to write a supportive reply.
// If Gemini is unavailable, it falls back to beginner-friendly rule-based replies.

const { callGeminiWithMetadata } = require("./geminiService");

function normalizeMessage(userMessage) {
  return String(userMessage || "").trim().toLowerCase();
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function includesKeyword(message, keyword) {
  const normalizedKeyword = keyword.toLowerCase();

  // Phrases can use normal includes because they are specific enough.
  if (normalizedKeyword.includes(" ")) {
    return message.includes(normalizedKeyword);
  }

  // Single words should not match inside another word.
  // Example: "home" should not match "homework".
  const wordPattern = new RegExp(`\\b${escapeRegex(normalizedKeyword)}\\b`);
  return wordPattern.test(message);
}

function includesAny(message, keywords) {
  return keywords.some((keyword) => includesKeyword(message, keyword));
}

function detectSituation(message) {
  // Check high-risk safety situations first.
  if (
    includesAny(message, [
      "danger",
      "unsafe",
      "emergency",
      "threat",
      "violence",
      "abuse",
      "hurt me",
      "hitting me",
      "someone is hurting me",
      "scared to go home",
      "not safe at home",
    ])
  ) {
    return {
      category: "safety",
      riskLevel: "high",
      needsUrgentReview: true,
    };
  }

  // Self-harm wording should be escalated safely and calmly.
  if (
    includesAny(message, [
      "self harm",
      "hurt myself",
      "end everything",
      "not want to live",
      "disappear forever",
    ])
  ) {
    return {
      category: "urgent_emotional_safety",
      riskLevel: "high",
      needsUrgentReview: true,
    };
  }

  if (
    includesAny(message, ["school", "class", "teacher", "exam", "homework", "study"]) &&
    includesAny(message, ["parent", "parents", "mum", "mom", "dad", "family"])
  ) {
    return {
      category: "school_and_parent_pressure",
      riskLevel: "medium",
      needsUrgentReview: true,
    };
  }

  if (
    includesAny(message, [
      "don't want to go to school",
      "dont want to go to school",
      "do not want to go to school",
      "skip school",
      "stop going school",
      "quit school",
    ])
  ) {
    return {
      category: "school_refusal",
      riskLevel: "medium",
      needsUrgentReview: true,
    };
  }

  if (
    includesAny(message, [
      "parents fighting",
      "parents are fighting",
      "family problem",
      "argument at home",
      "parents angry",
      "parent angry",
      "mum angry",
      "dad angry",
      "parents not happy",
      "parents will not be happy",
    ])
  ) {
    return {
      category: "family_conflict",
      riskLevel: "medium",
      needsUrgentReview: true,
    };
  }

  if (includesAny(message, ["parent", "parents", "mum", "mom", "dad", "family", "home"])) {
    return {
      category: "family_pressure",
      riskLevel: "medium",
      needsUrgentReview: true,
    };
  }

  if (
    includesAny(message, [
      "bully",
      "bullied",
      "hate me",
      "hates me",
      "hated",
      "left out",
      "make fun of me",
      "laugh at me",
      "spread rumor",
      "rumour",
      "exclude me",
    ])
  ) {
    return {
      category: "bullying_or_exclusion",
      riskLevel: "medium",
      needsUrgentReview: true,
    };
  }

  if (includesAny(message, ["lonely", "alone", "no one cares", "nobody cares", "ignored"])) {
    return {
      category: "loneliness",
      riskLevel: "medium",
      needsUrgentReview: true,
    };
  }

  if (
    includesAny(message, [
      "panic",
      "anxious",
      "anxiety",
      "overwhelmed",
      "can't handle",
      "cannot handle",
      "too much pressure",
      "unwell",
    ])
  ) {
    return {
      category: "anxiety_or_overwhelmed",
      riskLevel: "medium",
      needsUrgentReview: true,
    };
  }

  if (includesAny(message, ["sad", "crying", "very tired", "empty", "hopeless"])) {
    return {
      category: "sadness_or_distress",
      riskLevel: "medium",
      needsUrgentReview: true,
    };
  }

  if (includesAny(message, ["not good enough", "failure", "useless", "disappointed in myself"])) {
    return {
      category: "self_confidence",
      riskLevel: "medium",
      needsUrgentReview: true,
    };
  }

  if (includesAny(message, ["money", "financial", "rent", "food", "no money"])) {
    return {
      category: "financial_or_home_stress",
      riskLevel: "medium",
      needsUrgentReview: true,
    };
  }

  if (includesAny(message, ["exam", "test", "homework", "study", "grades", "results"])) {
    return {
      category: "exam_or_study_stress",
      riskLevel: "low",
      needsUrgentReview: false,
    };
  }

  if (includesAny(message, ["school", "class", "teacher"])) {
    return {
      category: "school_stress",
      riskLevel: "low",
      needsUrgentReview: false,
    };
  }

  if (includesAny(message, ["friend", "friends", "best friend", "classmate"])) {
    return {
      category: "friendship_issue",
      riskLevel: "low",
      needsUrgentReview: false,
    };
  }

  if (includesAny(message, ["angry", "mad", "frustrated", "annoyed", "hate everything"])) {
    return {
      category: "anger_or_frustration",
      riskLevel: "low",
      needsUrgentReview: false,
    };
  }

  if (includesAny(message, ["relationship", "break up", "boyfriend", "girlfriend", "crush"])) {
    return {
      category: "relationship_issue",
      riskLevel: "low",
      needsUrgentReview: false,
    };
  }

  if (includesAny(message, ["stress", "stressed", "worried", "upset", "bad day", "tired"])) {
    return {
      category: "general_stress",
      riskLevel: "low",
      needsUrgentReview: false,
    };
  }

  return {
    category: "general_unknown",
    riskLevel: "low",
    needsUrgentReview: false,
  };
}

function chooseReplyVariant(category, rawMessage, options) {
  const seed = `${category}:${rawMessage}`;
  let score = 0;

  for (let index = 0; index < seed.length; index += 1) {
    score += seed.charCodeAt(index);
  }

  return options[score % options.length];
}

function buildReply(category, rawMessage) {
  const replyOptions = {
    safety: [
      "I'm really glad you told me. Your safety matters. If you are in immediate danger, please contact a trusted adult nearby or local emergency support now. I'll mark this conversation as urgent so a youth worker can review it. Are you somewhere safe right now?",
      "Thank you for saying this. If you might be unsafe now, please get help from a trusted adult nearby or local emergency support. I'll mark this for urgent youth worker review. Are you in a safe place at this moment?",
      "That sounds serious, and I'm glad you reached out. If there is immediate danger, contact local emergency support or someone trusted near you now. I'll mark this as urgent. Can you move to somewhere safer?",
    ],

    urgent_emotional_safety: [
      "I'm really glad you told me. You do not have to handle this alone. Please reach out to a trusted adult nearby or local emergency support now if you might not be safe. I'll mark this as urgent for a youth worker to review. Are you with someone you trust right now?",
      "Thank you for being honest about this. Your safety is the first thing right now, so please contact someone trusted nearby or local emergency support if you may hurt yourself. I'll flag this urgently. Who is near you that you can reach out to?",
      "I'm here with you, and I'm glad you messaged. If you feel at risk of harming yourself, please get immediate help from a trusted adult or local emergency support. I'll mark this urgent. Are you safe from hurting yourself right now?",
    ],

    school_and_parent_pressure: [
      "It sounds like school has been really hard, and you are also worried about how your parents might react. That is a difficult position to be in. What is the biggest reason school feels hard for you right now?",
      "That sounds like pressure from both sides: school and home. Thank you for telling me instead of carrying it quietly. Which part feels heavier today?",
      "It makes sense that this feels overwhelming when school stress and family expectations are both involved. What are you most worried will happen next?",
    ],

    school_refusal: [
      "It sounds like going to school feels really difficult right now. Thank you for telling me instead of keeping it all inside. What happened that made you feel like you do not want to go anymore?",
      "Not wanting to go to school usually comes from something that feels too hard or unsafe. I'm glad you said it here. What is the main thing making school feel impossible?",
      "That sounds heavy to face every day. A youth worker can follow up during working hours and read what you shared. What part of school are you trying to avoid most?",
    ],

    exam_or_study_stress: [
      "It sounds like studies or exams have been putting pressure on you. That can feel exhausting. What part feels most stressful right now?",
      "Schoolwork can feel huge when everything piles up at once. I'm glad you told me. Which task or deadline is worrying you most?",
      "That sounds tiring, especially if you have been holding the stress in. What is one school task you feel stuck on right now?",
    ],

    school_stress: [
      "It sounds like school has been weighing on you. Thank you for sharing that with me. What part of school has been bothering you the most?",
      "School can feel really lonely or stressful when things are not going well. What happened at school that stayed on your mind?",
      "I'm sorry school has been hard lately. You deserve support with it. What is the hardest moment of the school day for you?",
    ],

    family_conflict: [
      "It sounds like things at home have been tense, and that can feel really heavy. Are you somewhere safe right now?",
      "Home conflict can make it hard to relax, even after the argument is over. Thank you for telling me. Are things calm where you are right now?",
      "That sounds upsetting to be around. A youth worker can follow up during working hours and read what you shared. Do you feel safe at home tonight?",
    ],

    family_pressure: [
      "It sounds like your family's reaction matters a lot to you, and you may be worried about disappointing them. What are you most afraid they might say or do?",
      "Family expectations can feel very heavy when you are already struggling. What do you wish your family understood about what you are going through?",
      "That sounds like a lot of pressure to carry at home. What part of your family's response worries you the most?",
    ],

    bullying_or_exclusion: [
      "That sounds really painful to go through. Being treated that way can make someone feel very alone. What happened most recently?",
      "I'm sorry people are treating you that way. You do not deserve to be bullied or made to feel unwanted. Who at school knows this is happening?",
      "Getting hurt by classmates or friends can make school feel unsafe and exhausting. Thank you for telling me. When did this last happen?",
    ],

    friendship_issue: [
      "Friendship problems can hurt a lot, especially when you care about the person. What happened between you and them?",
      "It sounds like something with your friends has been sitting heavily with you. What changed between you recently?",
      "Friend issues can feel really personal. Thank you for sharing it here. What do you wish your friend understood?",
    ],

    loneliness: [
      "Feeling alone can be really hard, especially at night. Thank you for telling me. What has been making you feel most alone recently?",
      "I'm sorry you have been feeling so alone. You deserve to have someone notice and care. When does the loneliness feel strongest?",
      "That sounds painful to carry by yourself. A youth worker can follow up during working hours and read what you shared. Who do you usually feel safest talking to?",
    ],

    anxiety_or_overwhelmed: [
      "That sounds like a lot to carry at once. Thank you for sharing it with me. Are you somewhere safe right now?",
      "It makes sense that you feel overwhelmed if everything is coming at you at once. What feels most urgent in your mind right now?",
      "I'm glad you reached out while it feels this intense. You do not have to explain it perfectly. What is the first thing you want help sorting out?",
    ],

    sadness_or_distress: [
      "I'm sorry you have been feeling this way. Thank you for telling me. You do not need to explain everything perfectly. What has been hurting the most recently?",
      "That sounds emotionally heavy, and I'm glad you did not keep it completely to yourself. What has been making the sadness feel worse?",
      "I'm here with you. It is okay if the words come out messy. What happened today that made things feel harder?",
    ],

    anger_or_frustration: [
      "It sounds like you are carrying a lot of frustration right now. That can feel intense. What happened that made you feel this angry?",
      "Feeling angry can be exhausting, especially when it builds up. What was the moment that pushed it over the edge?",
      "Thank you for telling me. Anger often shows up when something feels unfair or too much. What feels most unfair right now?",
    ],

    relationship_issue: [
      "Relationship feelings can be really confusing and painful. Thank you for sharing that. What part of this situation is affecting you the most?",
      "That sounds like it is weighing on your heart. What happened between you and that person?",
      "Relationship problems can make everything else feel harder too. What do you wish could be different right now?",
    ],

    self_confidence: [
      "It sounds like you have been being really hard on yourself. I'm sorry it feels that way. What happened that made you feel like this?",
      "I'm sorry you are seeing yourself so harshly right now. You are not a failure for struggling. What made those thoughts louder today?",
      "That sounds painful to believe about yourself. Thank you for telling me. What would you want a youth worker to know about this feeling?",
    ],

    financial_or_home_stress: [
      "That sounds like a serious worry to carry. Thank you for telling me. What is the main thing at home or with money that is stressing you right now?",
      "Money or home stress can make everything feel uncertain. I'm glad you shared it here. What is the most urgent concern tonight?",
      "That sounds difficult, especially if it affects your day-to-day life. What do you need help understanding or handling first?",
    ],

    general_stress: [
      "It sounds like things have been stressful lately. Thank you for sharing that with me. What feels hardest for you right now?",
      "I'm here with you. It makes sense to feel worn down when stress keeps building. What is one thing that has been on your mind the most?",
      "That sounds like a tough day to carry. Thank you for telling me. What would make tonight feel a little easier?",
    ],

    general_unknown: [
      "I'm here with you. Thank you for sharing that. You do not need to explain everything perfectly right now. What would you like your youth worker to understand most?",
      "Thank you for telling me. I may not understand everything yet, but I want to stay with what you are saying. What feels most important to explain?",
      "I'm listening. You can take this one piece at a time. What happened before you decided to message?",
    ],
  };

  return chooseReplyVariant(
    category,
    rawMessage,
    replyOptions[category] || replyOptions.general_unknown
  );
}

function buildHandoverNote(category, riskLevel, userMessage) {
  const categoryLabels = {
    safety: "The youth shared possible safety concerns.",
    urgent_emotional_safety: "The youth shared urgent emotional safety concerns.",
    school_and_parent_pressure:
      "The youth is struggling with school and is worried about parental reaction.",
    school_refusal: "The youth expressed not wanting to attend school.",
    exam_or_study_stress: "The youth talked about study or exam pressure.",
    school_stress: "The youth talked about school-related stress.",
    family_conflict: "The youth talked about conflict or tension at home.",
    family_pressure: "The youth appears worried about family expectations or reactions.",
    bullying_or_exclusion: "The youth may be experiencing bullying, exclusion, or social hurt.",
    friendship_issue: "The youth shared a friendship-related problem.",
    loneliness: "The youth expressed loneliness or feeling unsupported.",
    anxiety_or_overwhelmed: "The youth seemed anxious or overwhelmed.",
    sadness_or_distress: "The youth seemed sad or emotionally distressed.",
    anger_or_frustration: "The youth expressed anger or frustration.",
    relationship_issue: "The youth shared a relationship-related concern.",
    self_confidence: "The youth expressed low confidence or negative self-view.",
    financial_or_home_stress: "The youth mentioned financial or home-related stress.",
    general_stress: "The youth shared general stress or worries.",
    general_unknown: "The youth shared a concern that needs worker review.",
  };

  return `${categoryLabels[category]} Risk level detected: ${riskLevel}. Latest youth message: "${userMessage}"`;
}

function buildAIReplyPrompt({ userMessage, category, riskLevel }) {
  return `You are an after-hours support assistant for a youth support app.

The user may be a vulnerable child or youth.

Your role:
- Be calm, warm, and supportive.
- Use simple language.
- Acknowledge what the youth shared.
- Ask only one gentle follow-up question.
- Do not pretend to be a counsellor, therapist, doctor, or emergency service.
- Do not diagnose.
- Do not promise secrecy.
- Do not give medical, legal, or professional advice.
- Do not make big promises like "everything will be okay."
- Remind the youth that a human youth worker can follow up during working hours.
- If the youth may be unsafe, keep the reply safety-focused and encourage them to contact a trusted adult or local emergency support.
- Keep the reply complete and short, around 2 to 4 sentences.
- Keep the reply under 120 words.
- End with a complete sentence or one gentle question.

Youth message:
${userMessage}

Detected category:
${category}

Detected risk level:
${riskLevel}

Return only the reply text.`;
}

function cleanAIReply(replyText) {
  return String(replyText || "")
    .replace(/^["']|["']$/g, "")
    .trim();
}

function isCompleteReply(replyText) {
  const text = cleanAIReply(replyText);

  if (text.length < 40) return false;
  if (text.length > 900) return false;

  return /[.!?]$/.test(text);
}

async function generateAIReply(userMessage) {
  const rawMessage = String(userMessage || "").trim();

  if (!rawMessage) {
    return {
      reply:
        "I'm here with you. You do not need to explain everything perfectly. What would you like your youth worker to understand most?",
      riskLevel: "low",
      category: "general_unknown",
      needsUrgentReview: false,
      handoverNote: "Youth sent an empty or unclear message.",
    };
  }

  const situation = detectSituation(normalizeMessage(rawMessage));
  const fallbackReply = buildReply(situation.category, rawMessage);
  let reply = fallbackReply;
  let usedGeminiReply = false;

  try {
    const aiResult = await callGeminiWithMetadata(
      buildAIReplyPrompt({
        userMessage: rawMessage,
        category: situation.category,
        riskLevel: situation.riskLevel,
      }),
      {
        temperature: 0.45,
        maxOutputTokens: 900,
      }
    );

    const cleanReply = cleanAIReply(aiResult.text);

    if (aiResult.finishReason !== "MAX_TOKENS" && isCompleteReply(cleanReply)) {
      reply = cleanReply;
      usedGeminiReply = true;
    }
  } catch (error) {
    console.warn("Gemini youth reply failed, using fallback:", error.message);
  }

  // Low and medium risk replies remind the youth that a worker can continue later.
  // High risk replies stay focused on immediate safety first.
  const finalReply =
    situation.riskLevel === "high" || usedGeminiReply
      ? reply
      : `${reply} A youth worker can follow up during working hours and read what you shared.`;

  return {
    reply: finalReply,
    riskLevel: situation.riskLevel,
    category: situation.category,
    needsUrgentReview: situation.needsUrgentReview,
    handoverNote: buildHandoverNote(situation.category, situation.riskLevel, rawMessage),
  };
}

module.exports = {
  generateAIReply,
};
