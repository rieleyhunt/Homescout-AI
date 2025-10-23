
import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
    url: String,
    body: String,
});

export default mongoose.model("Properties", propertySchema);