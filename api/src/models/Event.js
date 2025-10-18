import mongoose from "mongoose";
const eventSchema = new mongoose.Schema({
  source: { type: String, enum: ["atm","camera","sensor"], index: true },
  level:  { type: String, enum: ["info","warn","critical"], default: "info", index: true },
  tags:   [String],
  data:   mongoose.Schema.Types.Mixed, // {yolo_score:0.92, type:"mask_missing", frameUrl:"..."}
  createdBy: { type: String }          // firebase uid
}, { timestamps: true });
export default mongoose.model("Event", eventSchema);
