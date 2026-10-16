const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  roles: {
    type: [String],
    enum: ["user", "admin"],
    default: ["user"],
  },
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);




// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     fullName: {
//       type: String,
//       required: true,
//       trim: true,
//       maxlength: 100,
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//       maxlength: 254,
//     },

//     password: {
//       type: String,
//       default: undefined,
//       select: false,
//     },

//     authProviders: [
//       {
//         provider: {
//           type: String,
//           enum: ["google", "github", "local"],
//           required: true,
//         },
//         providerId: {
//           type: String,
//           required: true,
//         },
//       },
//     ],

//     roles: {
//       type: [String],
//       enum: ["user", "admin"],
//       default: ["user"],
//     },

//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   { timestamps: true }
// );

// userSchema.index(
//   { "authProviders.provider": 1, "authProviders.providerId": 1 },
//   { unique: true, sparse: true }
// );

// module.exports = mongoose.model("User", userSchema);