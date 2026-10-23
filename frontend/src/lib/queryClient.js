import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (count, error) =>
        ![400, 401, 403, 404, 409, 422, 429].includes(error?.response?.status) && count < 1,
    },
  },
});

// Match only link-derived data; auth, settings, and unrelated queries are unaffected.
let invalidationTimer;
const changedLinks = new Set();
export function invalidateLinkQueries(id) {
  if (id) {
    for (const [, urls] of queryClient.getQueriesData({
      predicate: ({ queryKey }) =>
        queryKey[0] === "private" && queryKey[2] === "urls",
    })) {
      const shortID = urls?.find((url) => url._id === id)?.shortID;
      if (shortID) changedLinks.add(shortID);
    }
  }
  clearTimeout(invalidationTimer);
  invalidationTimer = setTimeout(() => {
    const affected = new Set(changedLinks);
    changedLinks.clear();
    void queryClient.invalidateQueries({
      predicate: ({ queryKey }) =>
        queryKey[0] === "private" &&
        (["urls", "overview", "activity"].includes(queryKey[2]) ||
          (queryKey[2] === "analytics" && affected.has(queryKey[3]))),
    });
  }, 100);
}
