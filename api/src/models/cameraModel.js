import mongoose from "mongoose";
import Counter from "./counterModel.js";

const cameraSchema = new mongoose.Schema({
    _id: {
        type: String,
    },
    autoIncrementId: {
        type: Number,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    bankName: {
        type: String,
        required: true,
        trim: true,
    },
    district: {
        type: String,
        required: true,
        trim: true,
    },
    province: {
        type: String,
        required: true,
        trim: true,
    },
    branch: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ["online", "offline"],
        default: "online",
    },
    lastAvailableTime: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

cameraSchema.pre("save", async function (next) {
    if (!this.isNew) return next();

    try {
        const counter = await Counter.findOneAndUpdate(
            { name: "camera" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        this.autoIncrementId = counter.seq;
        this._id = `ATM_Cam_${String(counter.seq).padStart(2, "0")}`;
        next();
    } catch (err) {
        next(err);
    }
});

cameraSchema.index({ status: 1 });
cameraSchema.index({ branch: 1 });
cameraSchema.index({ district: 1 });
cameraSchema.index({ province: 1 });
cameraSchema.index({ location: "2dsphere" });

cameraSchema.virtual("lastActive").get(function () {
    const now = new Date();
    const diffMs = now - this.lastAvailableTime;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? "s" : ""} ago`;

    return this.lastAvailableTime.toLocaleDateString();
});

export default mongoose.model("Camera", cameraSchema);