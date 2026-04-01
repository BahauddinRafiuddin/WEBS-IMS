import { askGroq } from '../services/groq.service.js';
import { buildPublicPrompt } from '../utils/publicPrompt.js';
import { getCachedPublicData } from '../utils/publicDataCache.js';

export const publicChatHandler = async (req, res) => {
  try {
    const { message } = req.body;

    // fetching From cache.
    const { programs, companies } = await getCachedPublicData()

    // 🔥 Build dynamic prompt
    const systemPrompt = buildPublicPrompt({ programs, companies });

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ];

    const reply = await askGroq(messages);

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};


