import express from "express";
import OpenAi from "openai";
import dotenv from "dotenv";
import Listing from "../models/Listing.js";
import ChatHistory from "../models/ChatHistory.js";

dotenv.config();
const router = express.Router();
const openai = new OpenAi({ apiKey: process.env.OPENAI_API_KEY });

router.post("/chat", async (req, res) => {
  try {
    const { userId, message } = req.body;
    const response = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages: [{ role: "user", content: message }],
    });
    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "OpenAI request failed" });
  }
});

router.post("/chat-analyze-listings", async (req, res) => {
  const chatModelPurpose =
    "Your goal is to no matter what always return a list called urls of 10 real estate listings with the given criteria of the user. The urls list will be coded in java script, and later on a script is going to take the urls list that you made and transform it into readable data for the user.";
  try {
    // USER CREATES A PROMPT AND SENDS THE INFORMATION OVER TO CHATGPT
    let { userId, message } = req.body;
    let listings = await Listing.find({}, "body");
    listings = JSON.stringify(listings);
    let chatHistory = await ChatHistory.find({});
    chatHistory = JSON.stringify(chatHistory);
    let prompt =
      chatModelPurpose + "\n" + listings + "\n" + chatHistory + "\n" + message;
    console.log(chatHistory);
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    // ANALYZE THE RETURNED LIST OF URLS TO FIND THE BEST LISTINGS FOR THE USER.
    res.status(500).json({ reply: response.choices[0].message.content });
    const fullMessage =
      "OpenAI: " + response.choices[0].message.content + " User: " + message;
    console.log("full message: " + fullMessage);
    const currentTime = new Date();
    const data = { date: currentTime, message: fullMessage };
    await ChatHistory.create(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "OpenAI request failed" });
  }
});
export default router;
