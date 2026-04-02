import { askGroq } from "../services/groq.service.js";

const INTENT_MAP = {
  intern: ["profile_details", "tasks", "programs", "performance", "certificate", "general","codding","programming"],
  mentor: ["profile_details", "tasks", "interns", "programs", "performance", "general","codding","programming"],
  admin: ["profile_details", "interns", "mentors", "companies", "programs", "finance", "general", "interns_mentors", "commission","codding","programming"],
  super_admin: ["profile_details", "companies", "general", "finance", "commission","codding","programming"],
};

export const classifyIntent = async (message, role) => {
  const allowedIntents = INTENT_MAP[role] || ["general"];

  // ⚡ Tiny, cheap call — no data attached, just classification
  const response = await askGroq([
    {
      role: "system",
      content: `Classify the user message into exactly one of these intents: ${allowedIntents.join(", ")}.
      Reply with ONLY the intent word. No explanation.`,
    },
    { role: "user", content: message },
  ], { max_tokens: 10 }); // 10 tokens is enough for one word

  const intent = response.trim().toLowerCase();
  return allowedIntents.includes(intent) ? intent : "general";
};