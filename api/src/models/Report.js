// api/src/models/Report.js
import mongoose from "mongoose";
const reportSchema = new mongoose.Schema({
  uid: { type: String, index: true },
  type: { type: String, enum: ["daily","weekly","custom"], default: "daily" },
  metrics: mongoose.Schema.Types.Mixed // {alerts:12, critical:2, avgLatencyMs:85}
}, { timestamps: true });
export default mongoose.model("Report", reportSchema);
