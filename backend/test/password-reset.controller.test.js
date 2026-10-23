const assert = require("node:assert/strict");
const test = require("node:test");
const mongoose = require("mongoose");
const User = require("../models/user.model");
const {
  createPasswordResetEmail,
} = require("../utils/passwordResetEmail");
const passwordResetEmail = require("../utils/passwordResetEmail");
const {
  forgotPassword,
  resetPassword,
} = require("../controllers/user.controller");

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

const stub = (t, target, key, value) => {
  const original = target[key];
  target[key] = value;
  t.after(() => {
    target[key] = original;
  });
};

test("forgot password validates input and keeps the response generic", async (t) => {
  const invalid = createResponse();
  await forgotPassword({ body: {} }, invalid);
  assert.equal(invalid.statusCode, 400);

  stub(t, User, "findOne", async () => null);
  const missing = createResponse();
  await forgotPassword({ body: { email: "missing@example.com" } }, missing);
  assert.equal(missing.statusCode, 200);
  assert.match(missing.body.message, /If an account exists/);
});

test("forgot password stores only a hashed token and sends a reset email", async (t) => {
  const user = {
    _id: new mongoose.Types.ObjectId(),
    email: "user@example.com",
    fullName: "Test User",
    isActive: true,
  };
  let update;
  let sent;
  stub(t, User, "findOne", async () => user);
  stub(t, User, "updateOne", async (query, changes) => {
    update = { query, changes };
    return { acknowledged: true };
  });
  stub(t, passwordResetEmail, "sendPasswordResetEmail", async (payload) => {
    sent = payload;
  });

  const response = createResponse();
  await forgotPassword({ body: { email: " USER@example.com " } }, response);

  assert.equal(response.statusCode, 200);
  assert.match(sent.token, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(sent.email, user.email);
  assert.equal(update.changes.$set.resetPasswordTokenHash.length, 64);
  assert.notEqual(update.changes.$set.resetPasswordTokenHash, sent.token);
  assert.ok(update.changes.$set.resetPasswordExpiresAt > new Date());
  assert.equal(response.body.token, undefined);
});

test("forgot password clears the token when email delivery fails", async (t) => {
  const user = {
    _id: new mongoose.Types.ObjectId(),
    email: "user@example.com",
    fullName: "Test User",
    isActive: true,
  };
  const updates = [];
  stub(t, User, "findOne", async () => user);
  stub(t, User, "updateOne", async (query, changes) => {
    updates.push({ query, changes });
    return { acknowledged: true };
  });
  stub(t, passwordResetEmail, "sendPasswordResetEmail", async () => {
    throw new Error("provider unavailable");
  });

  const response = createResponse();
  await forgotPassword({ body: { email: user.email } }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(updates.length, 2);
  assert.deepEqual(updates[1].changes.$unset, {
    resetPasswordTokenHash: 1,
    resetPasswordExpiresAt: 1,
  });
  assert.equal(updates[1].query.resetPasswordTokenHash.length, 64);
});

test("reset password consumes a valid token atomically and invalidates sessions", async (t) => {
  let query;
  let changes;
  stub(t, User, "findOneAndUpdate", async (receivedQuery, receivedChanges) => {
    query = receivedQuery;
    changes = receivedChanges;
    return { _id: new mongoose.Types.ObjectId() };
  });

  const response = createResponse();
  await resetPassword(
    { body: { token: "a".repeat(43), password: "new-password-123" } },
    response,
  );

  assert.equal(response.statusCode, 200);
  assert.equal(query.resetPasswordTokenHash.length, 64);
  assert.ok(query.resetPasswordExpiresAt.$gt instanceof Date);
  assert.match(changes.$set.passwordHash, /^\$argon2id\$/);
  assert.deepEqual(changes.$unset, {
    password: 1,
    resetPasswordTokenHash: 1,
    resetPasswordExpiresAt: 1,
  });
  assert.deepEqual(changes.$inc, { sessionVersion: 1 });
});

test("reset password rejects invalid input before touching the database", async (t) => {
  let called = false;
  stub(t, User, "findOneAndUpdate", async () => {
    called = true;
    return null;
  });
  const response = createResponse();
  await resetPassword({ body: { token: "short", password: "no" } }, response);
  assert.equal(response.statusCode, 400);
  assert.equal(called, false);
});

test("reset email uses an HTTPS URL and escapes dynamic HTML", () => {
  const previousFrontendUrl = process.env.FRONTEND_URL;
  process.env.FRONTEND_URL = "https://app.ekurl.in";
  try {
    const message = createPasswordResetEmail({
      fullName: "<img src=x onerror=alert(1)>",
      token: "a".repeat(43),
    });
    assert.equal(new URL(message.resetUrl).protocol, "https:");
    assert.match(message.resetUrl, /\/reset-password\?token=/);
    assert.doesNotMatch(message.html, /<img src=x/);
    assert.match(message.html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  } finally {
    if (previousFrontendUrl === undefined) delete process.env.FRONTEND_URL;
    else process.env.FRONTEND_URL = previousFrontendUrl;
  }
});
