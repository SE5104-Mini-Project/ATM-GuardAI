import axios from "axios";
const AI_BASE = process.env.AI_BASE || "http://localhost:9000";

export async function runInference(payload) {
  const { data } = await axios.post(`${AI_BASE}/infer`, payload, { timeout: 20000 });
  return data; // e.g., { type:"mask_missing", score:0.93, frameUrl:"..." }
}
