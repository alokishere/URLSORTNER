
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 50,
    },

    password: {
      type: String,
      select: false,
    },
    passwordHash: { type: String, select: false },
    sessionVersion: { type: Number, default: 0 },

    authProviders: [
      {
        provider: {
          type: String,
          enum: ["google", "local"],
        },
        providerId: {
          type: String,
        },
      },
    ],

    roles: {
      type: [String],
      enum: ["user", "admin"],
      default: ["user"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

userSchema.index(
  { "authProviders.provider": 1, "authProviders.providerId": 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model("User", userSchema);