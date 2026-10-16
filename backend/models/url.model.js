const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {
    shortID: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    redirectUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 8192,
    },

    createdby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "paused"],
      default: "active",
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

urlSchema.index({ createdby: 1, createdAt: -1 });

module.exports = mongoose.model("Url", urlSchema);