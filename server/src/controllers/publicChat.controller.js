import Company from '../models/Company.js';
import { askGroq } from '../services/groq.service.js';
import { buildPublicPrompt } from '../utils/publicPrompt.js';
import InternshipProgram from '../models/InternshipProgram.js';

export const publicChatHandler = async (req, res) => {
  try {
    const { message } = req.body;

    // 🔥 Fetch REAL DATA
    const programs = await InternshipProgram.find()
      .populate("company", "name")
      .limit(5);

    const companies = await Company.find({ isActive: true })
      .select("name")
      .limit(5);

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


