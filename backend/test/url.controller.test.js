const assert = require("node:assert/strict");
const test = require("node:test");
const mongoose = require("mongoose");
const Url = require("../models/url.model");
const {
  generateNewShortID,
  updateUrl,
} = require("../controllers/url.controller");
const { isReservedSlug, normalizeSlug } = require("../utils/reservedSlugs");

const ownerId = new mongoose.Types.ObjectId().toString();

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

const createRequest = (body) => ({
  body,
  protocol: "https",
  get: () => "short.example.test",
});

const updateRequest = (id, body) => ({
  params: { id },
  body,
  user: { _id: ownerId, roles: [] },
  protocol: "https",
  get: () => "short.example.test",
});

const createUrlRecord = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  shortID: "original-link",
  alias: "original-link",
  redirectUrl: "https://example.com/original",
  title: "Original link",
  createdby: ownerId,
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
  async save() {},
  ...overrides,
});

const stubUrlModel = (t, stubs) => {
  const original = {};
  for (const [key, value] of Object.entries(stubs)) {
    original[key] = Url[key];
    Url[key] = value;
  }
  t.after(() => Object.assign(Url, original));
};

test("reserved slugs normalize casing and whitespace", () => {
  assert.equal(normalizeSlug("  InStAgRaM  "), "instagram");
  assert.equal(isReservedSlug("  InStAgRaM  "), true);
  assert.equal(isReservedSlug("LiNkEdIn"), true);
  assert.equal(isReservedSlug("campaign-instagram"), false);
});

test("create API rejects configured reserved aliases regardless of case", async () => {
  const aliases = [" insta ", "INSTAGRAM", "x", "LiNkEdIn", "API", "admin", "DASHBOARD", "Qr"];
  for (const alias of aliases) {
    const res = createResponse();
    await generateNewShortID(createRequest({ url: "https://example.com", alias }), res);
    assert.equal(res.statusCode, 400, alias);
    assert.equal(res.body.error, "That alias is reserved", alias);
  }
});

test("create API normalizes valid aliases and permits reserved words in destinations", async (t) => {
  let createdPayload;
  stubUrlModel(t, {
    exists: async () => null,
    create: async (payload) => {
      createdPayload = payload;
      return createUrlRecord({ ...payload });
    },
  });
  const res = createResponse();
  await generateNewShortID(createRequest({
    url: "https://example.com/instagram/dashboard?from=qr",
    alias: "  My-Campaign  ",
  }), res);

  assert.equal(res.statusCode, 201);
  assert.equal(createdPayload.shortID, "my-campaign");
  assert.equal(createdPayload.alias, "my-campaign");
  assert.equal(createdPayload.redirectUrl, "https://example.com/instagram/dashboard?from=qr");
  assert.equal(res.body.shortID, "my-campaign");
});

test("create API generates an alias and reports duplicate aliases", async (t) => {
  let createdPayload;
  stubUrlModel(t, {
    exists: async (query) => (query.shortID === "taken-link" ? { _id: "existing" } : null),
    create: async (payload) => {
      createdPayload = payload;
      return createUrlRecord({ ...payload });
    },
  });

  const generatedResponse = createResponse();
  await generateNewShortID(createRequest({ url: "https://example.com/valid" }), generatedResponse);
  assert.equal(generatedResponse.statusCode, 201);
  assert.match(createdPayload.shortID, /^[A-Za-z0-9_-]{4,6}$/);

  const duplicateResponse = createResponse();
  await generateNewShortID(createRequest({ url: "https://example.com/valid", alias: "taken-link" }), duplicateResponse);
  assert.equal(duplicateResponse.statusCode, 409);
  assert.equal(duplicateResponse.body.error, "That alias is already in use");
});

test("update API rejects reserved aliases and invalid destinations", async (t) => {
  const link = createUrlRecord();
  stubUrlModel(t, {
    findById: async () => link,
  });

  for (const alias of ["InStA", " instagram ", "X", "LINKEDIN", "dashboard", "QR"]) {
    const res = createResponse();
    await updateUrl(updateRequest(link._id.toString(), { alias }), res);
    assert.equal(res.statusCode, 400, alias);
    assert.equal(res.body.error, "That alias is reserved", alias);
  }

  const invalidDestinationResponse = createResponse();
  await updateUrl(updateRequest(link._id.toString(), { url: "ftp://example.com" }), invalidDestinationResponse);
  assert.equal(invalidDestinationResponse.statusCode, 400);
  assert.equal(invalidDestinationResponse.body.error, "Only HTTP and HTTPS URLs are supported");
});

test("update API normalizes valid aliases and rejects duplicate aliases", async (t) => {
  const link = createUrlRecord();
  stubUrlModel(t, {
    findById: async () => link,
    exists: async (query) => (query.shortID === "taken-link" ? { _id: "existing" } : null),
  });

  const validResponse = createResponse();
  await updateUrl(updateRequest(link._id.toString(), { alias: "  Launch-2026  " }), validResponse);
  assert.equal(validResponse.statusCode, 200);
  assert.equal(link.shortID, "launch-2026");
  assert.equal(link.alias, "launch-2026");

  const duplicateResponse = createResponse();
  await updateUrl(updateRequest(link._id.toString(), { alias: "taken-link" }), duplicateResponse);
  assert.equal(duplicateResponse.statusCode, 409);
  assert.equal(duplicateResponse.body.error, "That alias is already in use");
});
