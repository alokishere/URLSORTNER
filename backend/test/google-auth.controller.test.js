const assert = require("node:assert/strict");
const test = require("node:test");
const mongoose = require("mongoose");
const User = require("../models/user.model");
const googleAuth = require("../utils/googleAuth");
const { googleLogin, linkGoogleAccount, verifyGoogleEmail } = require("../controllers/user.controller");

const createResponse = () => ({
  statusCode: null,
  body: null,
  cookies: [],
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
  cookie(name, value) {
    this.cookies.push({ name, value });
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

const payload = (overrides = {}) => ({
  sub: "google-sub-123",
  iss: "https://accounts.google.com",
  aud: "google-client-id",
  email: "google-user@example.com",
  email_verified: true,
  name: "Google User",
  ...overrides,
});

test("Google login signs in an existing linked account", async (t) => {
  process.env.JWT_SECRET = "test-google-secret";
  const user = {
    _id: new mongoose.Types.ObjectId(),
    fullName: "Google User",
    email: "google-user@example.com",
    roles: ["user"],
    isActive: true,
    sessionVersion: 0,
    authProviders: [{ provider: "google", providerId: "google-sub-123" }],
  };
  stub(t, googleAuth, "verifyGoogleIdToken", async () => payload());
  stub(t, User, "findOne", async (query) => query.authProviders ? user : null);

  const response = createResponse();
  await googleLogin({ body: { credential: "g".repeat(200) } }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.user.email, user.email);
  assert.equal(response.cookies[0].name, "token");
});

test("Google login creates a new user for a verified Google identity", async (t) => {
  let created;
  stub(t, googleAuth, "verifyGoogleIdToken", async () => payload({ sub: "new-google-sub" }));
  stub(t, User, "findOne", async () => null);
  stub(t, User, "create", async (document) => {
    created = { _id: new mongoose.Types.ObjectId(), roles: ["user"], isActive: true, sessionVersion: 0, ...document };
    return created;
  });

  const response = createResponse();
  await googleLogin({ body: { credential: "g".repeat(200) } }, response);

  assert.equal(response.statusCode, 201);
  assert.equal(created.authProviders[0].provider, "google");
  assert.equal(created.authProviders[0].providerId, "new-google-sub");
  assert.equal(created.passwordHash, undefined);
});

test("Google login does not silently merge an existing password account", async (t) => {
  const existing = {
    _id: new mongoose.Types.ObjectId(),
    email: "google-user@example.com",
    passwordHash: "argon2-hash",
    isActive: true,
  };
  stub(t, googleAuth, "verifyGoogleIdToken", async () => payload());
  stub(t, User, "findOne", async (query) => (query.authProviders ? null : existing));

  const response = createResponse();
  await googleLogin({ body: { credential: "g".repeat(200) } }, response);

  assert.equal(response.statusCode, 409);
  assert.match(response.body.error, /already exists/);
});

test("Google login rejects invalid identity tokens without exposing provider details", async (t) => {
  stub(t, googleAuth, "verifyGoogleIdToken", async () => {
    const error = new Error("audience mismatch: secret details");
    error.code = "GOOGLE_TOKEN_INVALID";
    throw error;
  });

  const response = createResponse();
  await googleLogin({ body: { credential: "g".repeat(200) } }, response);

  assert.equal(response.statusCode, 401);
  assert.equal(response.body.error, "Google sign-in couldn't be completed. Please try again.");
  assert.doesNotMatch(response.body.error, /audience|secret/);
});

test("authenticated users can verify the Google email before changing it", async (t) => {
  stub(t, googleAuth, "verifyGoogleIdToken", async () => payload({ email: "verified@example.com" }));

  const response = createResponse();
  await verifyGoogleEmail(
    { body: { credential: "g".repeat(200) } },
    response,
  );

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { verified: true, email: "verified@example.com" });
});

test("authenticated users can explicitly link a matching Google identity", async (t) => {
  const userId = new mongoose.Types.ObjectId();
  const user = {
    _id: userId,
    email: "google-user@example.com",
    authProviders: [],
  };
  let update;
  stub(t, googleAuth, "verifyGoogleIdToken", async () => payload());
  stub(t, User, "findOne", async () => null);
  stub(t, User, "findOneAndUpdate", async (query, changes) => {
    update = { query, changes };
    return { ...user, authProviders: [{ provider: "google", providerId: "google-sub-123" }] };
  });

  const response = createResponse();
  await linkGoogleAccount({ body: { credential: "g".repeat(200) }, user }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(update.changes.$push.authProviders.providerId, "google-sub-123");
  assert.equal(update.query.email, user.email);
});

test("Google linking requires the current account email and rejects an occupied identity", async (t) => {
  const user = {
    _id: new mongoose.Types.ObjectId(),
    email: "password-user@example.com",
    authProviders: [],
  };
  stub(t, googleAuth, "verifyGoogleIdToken", async () => payload());
  const mismatchedResponse = createResponse();
  await linkGoogleAccount({ body: { credential: "g".repeat(200) }, user }, mismatchedResponse);
  assert.equal(mismatchedResponse.statusCode, 409);
  assert.match(mismatchedResponse.body.error, /same verified email/);

  const occupiedUser = { _id: new mongoose.Types.ObjectId(), email: user.email };
  stub(t, googleAuth, "verifyGoogleIdToken", async () => payload({ email: user.email }));
  stub(t, User, "findOne", async () => occupiedUser);
  const occupiedResponse = createResponse();
  await linkGoogleAccount({ body: { credential: "g".repeat(200) }, user }, occupiedResponse);
  assert.equal(occupiedResponse.statusCode, 409);
  assert.match(occupiedResponse.body.error, /already linked/);
});
