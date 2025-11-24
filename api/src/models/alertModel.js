import mongoose from "mongoose";
import Counter from "./counterModel.js";

const alertSchema = new mongoose.Schema(
    {
        _id: { type: String },

        type: {
            type: String,
            enum: ["normal face", "with helmet", "with mask"],
            required: true,
        },

        severity: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "low",
        },

        status: {
            type: String,
            enum: ["open", "resolved"],
            default: "open",
        },

        description: {
            type: String,
            trim: true,
        },

        cameraId: {
            type: String,
            required: true,
            ref: "Camera",
        },

        confidence: {
            type: Number,
            default: 0,
        },

        createdTime: {
            type: Date,
            default: () => new Date(),
        },

        resolvedTime: {
            type: Date,
            default: null,
        },

        resolvedBy: {
            type: String,
            ref: "User",
            default: null
        },

        imagePath: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

alertSchema.pre("save", async function (next) {
    if (!this.isNew) return next();

    try {
        const counter = await Counter.findOneAndUpdate(
            { name: "alert" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        this._id = `alert_${String(counter.seq).padStart(2, "0")}`;
        next();
    } catch (err) {
        next(err);
    }
});

alertSchema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate();

    if (update.status === "resolved") {
        update.resolvedTime = new Date();
        if (!update.resolvedBy) {
            update.resolvedBy = null;
        }
    }

    next();
});

alertSchema.index({ cameraId: 1 });
alertSchema.index({ type: 1 });
alertSchema.index({ severity: 1 });
alertSchema.index({ timestamp: -1 });

export default mongoose.model("Alert", alertSchema);