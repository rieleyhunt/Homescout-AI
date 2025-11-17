import mongoose from "mongoose";

const propertiesSchema = new mongoose.Schema({
  price: String,
  bedrooms: String,
  bathrooms: String,
  square_feet: String,
  url: String,
});

export default mongoose.model("Properties", propertiesSchema);
