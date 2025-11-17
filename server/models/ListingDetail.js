import mongoose from "mongoose";

const propertyDetailSchema = new mongoose.Schema({
  url: String,
  body: String,
});

export default mongoose.model("PropertyDetail", propertyDetailSchema);
