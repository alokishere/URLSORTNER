const test = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const net = require("node:net");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Url = require("../models/url.model");

// Opt in only with an isolated test database. Never drops a database.
test(
  "authentication, authorization and guest claims against MongoDB",
  { skip: !process.env.TEST_MONGO_URI, timeout: 45000 },
  async (t) => {
    const server = net.createServer();
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const port = server.address().port;
    await new Promise((resolve) => server.close(resolve));
    const secret = "isolated-test-secret-only";
    const productionCookie = process.env.TEST_COOKIE_PRODUCTION === "1";
    const child = spawn(process.execPath, ["index.js"], {
      cwd: require("node:path").resolve(__dirname, ".."),
      env: {
        ...process.env,
        NODE_ENV: productionCookie ? "production" : "test",
        PORT: String(port),
        MONGO_URI: process.env.TEST_MONGO_URI,
        JWT_SECRET: secret,
      },
      stdio: "ignore",
    });
    t.after(async () => {
      child.kill();
      await mongoose.disconnect();
    });
    await mongoose.connect(process.env.TEST_MONGO_URI);
    const base = `http://127.0.0.1:${port}`;
    let ready = false;
    for (let i = 0; i < 100; i++) {
      try {
        await fetch(base + "/user/");
        ready = true;
        break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    assert.ok(ready, "server did not start");
    const req = async (path, { method = "GET", body, cookie, origin } = {}) => {
      const headers = {};
      if (body) headers["Content-Type"] = "application/json";
      if (cookie) headers.Cookie = cookie;
      if (origin) headers.Origin = origin;
      const response = await fetch(base + path, {
        method,
        headers,
        body: body && JSON.stringify(body),
        redirect: "manual",
      });
      const data = (response.headers.get("content-type") || "").includes(
        "application/json",
      )
        ? await response.json()
        : null;
      return {
        status: response.status,
        data,
        cookie: response.headers.get("set-cookie")?.split(";")[0],
        setCookie: response.headers.get("set-cookie"),
        location: response.headers.get("location"),
      };
    };
    const suffix = Date.now();
    const aEmail = `a${suffix}@example.test`,
      bEmail = `b${suffix}@example.test`;
    const a = await req("/user/register", {
      method: "POST",
      body: { fullName: "Test A", email: aEmail, password: "test-password-a" },
    });
    assert.equal(a.status, 201);
    assert.match(a.setCookie, /HttpOnly/i);
    assert.match(
      a.setCookie,
      productionCookie ? /SameSite=None/i : /SameSite=Lax/i,
    );
    if (productionCookie) assert.match(a.setCookie, /; Secure/i);
    const record = await User.findById(a.data.user.id)
      .select("+password +passwordHash")
      .lean();
    assert.equal(record.password, undefined);
    assert.match(record.passwordHash, /^\$argon2id\$/);
    const b = await req("/user/register", {
      method: "POST",
      body: { fullName: "Test B", email: bEmail, password: "test-password-b" },
    });
    assert.equal(b.status, 201);
    assert.equal(
      (
        await req("/user/login", {
          method: "POST",
          body: { email: aEmail, password: "bad-password" },
        })
      ).status,
      401,
    );
    assert.equal((await req("/user/session")).status, 401);
    assert.equal(
      (
        await req(`/user/update/${b.data.user.id}`, {
          method: "PUT",
          cookie: a.cookie,
          body: { fullName: "Wrong" },
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await req(`/user/delete/${b.data.user.id}`, {
          method: "DELETE",
          cookie: a.cookie,
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await req(`/user/update/${a.data.user.id}`, {
          method: "PUT",
          cookie: a.cookie,
          body: { roles: ["admin"] },
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await req(`/user/update/${a.data.user.id}`, {
          method: "PUT",
          cookie: a.cookie,
          origin: "https://attacker.example",
          body: { fullName: "Wrong" },
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await req(`/user/update/${a.data.user.id}`, {
          method: "PUT",
          cookie: a.cookie,
          body: { fullName: "Updated" },
        })
      ).status,
      200,
    );
    const guest = await req("/urls/", {
      method: "POST",
      body: { url: "https://example.test/target" },
    });
    assert.equal(guest.status, 201);
    const claim = {
      claims: [
        { linkId: guest.data.linkId, claimToken: guest.data.claimToken },
      ],
    };
    assert.equal(
      (
        await req("/urls/claim", {
          method: "POST",
          cookie: a.cookie,
          body: claim,
        })
      ).data.claimed.length,
      1,
    );
    assert.equal(
      (
        await req("/urls/claim", {
          method: "POST",
          cookie: a.cookie,
          body: claim,
        })
      ).data.claimed.length,
      1,
    );
    assert.equal(
      (
        await req("/urls/claim", {
          method: "POST",
          cookie: b.cookie,
          body: claim,
        })
      ).data.failed.length,
      1,
    );
    const expiredGuest = await req("/urls/", {
      method: "POST",
      body: { url: "https://example.test/expired" },
    });
    await Url.updateOne(
      { _id: expiredGuest.data.linkId },
      { $set: { guestClaimExpiresAt: new Date(0) } },
    );
    const expiredClaim = {
      claims: [
        {
          linkId: expiredGuest.data.linkId,
          claimToken: expiredGuest.data.claimToken,
        },
      ],
    };
    assert.equal(
      (
        await req("/urls/claim", {
          method: "POST",
          cookie: a.cookie,
          body: expiredClaim,
        })
      ).data.failed.length,
      1,
    );
    const redirect = await req("/" + guest.data.shortID);
    assert.equal(redirect.status, 302);
    assert.equal(redirect.location, "https://example.test/target");
    await Url.updateOne(
      { _id: guest.data.linkId },
      { $set: { status: "blocked" } },
    );
    assert.equal((await req("/" + guest.data.shortID)).status, 410);
    assert.equal((await req("/missing-test-id-123")).status, 404);
    const changed = await req(`/user/update/${a.data.user.id}`, {
      method: "PUT",
      cookie: a.cookie,
      body: {
        currentPassword: "test-password-a",
        password: "test-password-new",
      },
    });
    assert.equal(changed.status, 200);
    assert.equal(
      (await req("/user/session", { cookie: a.cookie })).status,
      401,
    );
    assert.equal(
      (await req("/user/session", { cookie: changed.cookie })).status,
      200,
    );
    assert.equal(
      (await req("/user/logout", { method: "POST", cookie: changed.cookie }))
        .status,
      200,
    );
    assert.equal(
      (await req("/user/session", { cookie: changed.cookie })).status,
      401,
    );
    assert.equal(
      (
        await req("/user/login", {
          method: "POST",
          body: { email: aEmail, password: "test-password-new" },
        })
      ).status,
      200,
    );
    const legacyEmail = `legacy${suffix}@example.test`;
    const legacy = await User.collection.insertOne({
      fullName: "Legacy",
      email: legacyEmail,
      password: "legacy-password",
      roles: ["user"],
      isActive: true,
    });
    const legacyLogin = await req("/user/login", {
      method: "POST",
      body: { email: legacyEmail, password: "legacy-password" },
    });
    assert.equal(legacyLogin.status, 200);
    const migrated = await User.findById(legacy.insertedId)
      .select("+password +passwordHash")
      .lean();
    assert.equal(migrated.password, undefined);
    assert.match(migrated.passwordHash, /^\$argon2id\$/);
    const expired = jwt.sign({ id: String(legacy.insertedId), sv: 0 }, secret, {
      expiresIn: -1,
    });
    assert.equal(
      (await req("/user/session", { cookie: `token=${expired}` })).status,
      401,
    );
    assert.equal(
      (
        await req(`/user/delete/${b.data.user.id}`, {
          method: "DELETE",
          cookie: b.cookie,
        })
      ).status,
      200,
    );
  },
);
