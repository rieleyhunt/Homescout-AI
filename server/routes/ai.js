import express from "express";
import OpenAi from "openai";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
const openai = new OpenAi({ apiKey: process.env.OPENAI_API_KEY });

router.post("/ask", async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "OpenAI request failed" });
  }
});

export default router;