const mongoose = require("mongoose");

const clickEventSchema = new mongoose.Schema(
  {
    urlId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Url",
      required: true,
      index: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },

    country: String,
    region: String,
    city: String,

    deviceType: {
      type: String,
      enum: ["mobile", "desktop", "tablet", "unknown"],
      default: "unknown",
    },

    browser: String,
    os: String,
    referrer: String,
  },
  { timestamps: true }
);

clickEventSchema.index({ urlId: 1, timestamp: -1 });

module.exports = mongoose.model("ClickEvent", clickEventSchema);