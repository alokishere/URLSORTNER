const assert = require("node:assert/strict");
const test = require("node:test");
const mongoose = require("mongoose");
const User = require("../models/user.model");
const { updateUser } = require("../controllers/user.controller");

const createResponse = () => ({
  statusCode: null,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

test("profile updates reject email changes", async (t) => {
  const userId = new mongoose.Types.ObjectId();
  const originalFindById = User.findById;
  User.findById = () => {
    throw new Error("email changes must be rejected before loading the user");
  };
  t.after(() => {
    User.findById = originalFindById;
  });

  const response = createResponse();
  await updateUser(
    {
      params: { id: String(userId) },
      user: { _id: userId },
      body: { email: "new@example.com" },
    },
    response,
  );

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.error, "Verify your email with Google before changing it.");
});
