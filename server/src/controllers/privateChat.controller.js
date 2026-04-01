import { getChatContextData } from "../services/chat/chat.service.js";
import { fetchers } from "../services/chat/dataFetchers.js";
import { askGroq } from "../services/groq.service.js";
import { classifyIntent } from "../utils/intentClassifier.js";


export const privateChatController = async (req, res) => {
  try {
    const { message } = req.body
    const { role, _id: userId, company: companyId } = req.user;

    // Step 1: Classify intent (cheap — 10 tokens, no data)
    const intent = await classifyIntent(message, role)

    // Step 2: Fetch ONLY the relevant data
    const fetcher = fetchers[intent] || fetchers.general
    const contextData = await fetcher({ userId, companyId, role })

    // Step 3: Build a focused prompt — not a dump of everything
    const systemPrompt = `You are an assistant for an Internship Management System.
    User role: ${role}
    User's question is about: ${intent}
    ${contextData ? `Relevant data:\n${JSON.stringify(contextData, null, 2)}` : "Answer from general knowledge about the platform."}

    Rules:
    - Answer ONLY from the data above no code and nothing anything above that context
    - Be concise (2-3 sentences max)
    - If data is empty, say "No ${intent} found"
    - Never discuss code, homework, or off-platform topics
    - Do not return json data if user ask some filtered data that give according to that`;

    // Step 4: Final LLM call with small, focused context
    const reply = await askGroq([
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ]);

    res.json({ reply, intent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}