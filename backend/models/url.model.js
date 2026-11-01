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

    alias: {
      type: String,
      trim: true,
      maxlength: 32,
      match: /^[A-Za-z0-9_-]+$/,
      unique: true,
      sparse: true,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },

    createdby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    guestClaimTokenHash: {
      type: String,
      default: null,
      select: false,
    },

    guestClaimExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },

    claimedAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "blocked", "paused"],
      default: "active",
    },

    // QR lifecycle is independent from the short link lifecycle. Existing
    // documents default to visible for backwards compatibility; new regular
    // links explicitly set this to false unless a QR is requested.
    qrEnabled: {
      type: Boolean,
      default: true,
      index: true,
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
