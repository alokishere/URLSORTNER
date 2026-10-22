import test from "node:test";
import process from "node:process";
import assert from "node:assert/strict";
import { createServer } from "vite";

globalThis.window = { location: { hostname: "localhost" } };
const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});
const { default: api } = await vite.ssrLoadModule("/src/axios.jsx");
const { queryClient, invalidateLinkQueries } = await vite.ssrLoadModule(
  "/src/lib/queryClient.js",
);
const { overviewQuery, keys } = await vite.ssrLoadModule(
  "/src/lib/dashboardQueries.js",
);
const originalAdapter = api.defaults.adapter;
let calls = [];
let fail = false;
api.defaults.adapter = async (config) => {
  calls.push(config.url);
  if (fail) throw new Error("network failure");
  const data =
    config.url === "/urls/"
      ? [
          { _id: "1", shortID: "a" },
          { _id: "2", shortID: "b" },
        ]
      : { visitHistory: [], totalVisits: 0, linkClicks: 0, qrScans: 0 };
  return { data, status: 200, statusText: "OK", headers: {}, config };
};

test.after(async () => {
  queryClient.clear();
  await vite.close();
});
test("deduplicates navigation, isolates users, and refreshes only changed analytics", async () => {
  const options = overviewQuery("user-a");
  await Promise.all([
    queryClient.fetchQuery(options),
    queryClient.fetchQuery(options),
  ]);
  assert.equal(calls.length, 3);
  await queryClient.fetchQuery(options);
  assert.equal(calls.length, 3, "fresh navigation makes no requests");
  await queryClient.fetchQuery(overviewQuery("user-b"));
  assert.equal(calls.length, 6, "different user has an isolated cache");
  queryClient.clear();
  calls = [];
  await queryClient.fetchQuery(options);
  invalidateLinkQueries("1");
  await new Promise((resolve) => setTimeout(resolve, 150));
  await queryClient.fetchQuery(options);
  assert.equal(calls.filter((url) => url === "/urls/").length, 2);
  assert.equal(calls.filter((url) => url.includes("/a/analytics")).length, 2);
  assert.equal(calls.filter((url) => url.includes("/b/analytics")).length, 1);
  queryClient.clear();
  assert.equal(queryClient.getQueryData(keys.overview("user-a")), undefined);
});
test("failed requests surface rather than creating empty analytics", async () => {
  queryClient.clear();
  fail = true;
  await assert.rejects(
    queryClient.fetchQuery({ ...overviewQuery("user-a"), retry: false }),
    /network failure/,
  );
  assert.equal(queryClient.getQueryData(keys.overview("user-a")), undefined);
});

test(
  "loads the dashboard through the local HTTP simulation",
  { skip: !process.env.DASHBOARD_TEST_API },
  async () => {
    queryClient.clear();
    api.defaults.adapter = originalAdapter;
    api.defaults.baseURL = process.env.DASHBOARD_TEST_API;
    const links = await queryClient.fetchQuery({
      ...overviewQuery("simulation-user"),
      retry: false,
    });
    assert.deepEqual(
      links.map((link) => link.shortID),
      ["a", "b"],
    );
  },
);
