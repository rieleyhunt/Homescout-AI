import mongoose from "mongoose";

const chatBotHistorySchema = new mongoose.Schema({
  date: String,
  message: String,
});

export default mongoose.model("ChatHistory", chatBotHistorySchema);
