
import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
    url: String,
    body: String,
});

export default mongoose.model("Properties", propertySchema);