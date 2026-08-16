const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  shortID: {
    type: String,
    required: true,
    unique: true,
  },
  redirectUrl: {
    type: String,
    required: true,
  },
  visitHistory: [
    {
      timestamp: {
        type: Number,
      },
    },
  ],
  createdby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, { timestamps: true });

module.exports = mongoose.model("Url", urlSchema);
