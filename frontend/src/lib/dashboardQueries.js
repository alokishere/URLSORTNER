import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../auth/authStore";
import { queryClient } from "./queryClient";
import {
  fetchUrls,
  fetchUrlAnalytics,
  fetchRecentActivity,
} from "./dashboardData";

export const userIdFor = (user) => user?.id || user?._id || null;
export const keys = {
  urls: (user) => ["private", user, "urls"],
  analytics: (user, id) => ["private", user, "analytics", id],
  overview: (user) => ["private", user, "overview"],
  activity: (user, limit) => ["private", user, "activity", limit],
};
const urlsQuery = (user) => ({
  queryKey: keys.urls(user),
  queryFn: ({ signal }) => fetchUrls(signal),
  staleTime: 30_000,
});
const analyticsQuery = (user, id) => ({
  queryKey: keys.analytics(user, id),
  queryFn: ({ signal }) => fetchUrlAnalytics(id, signal),
  staleTime: 30_000,
});
export const overviewQuery = (id) => ({
  queryKey: keys.overview(id),
  enabled: Boolean(id),
  staleTime: 30_000,
  refetchInterval: 60_000,
  queryFn: async () => {
    const urls = await queryClient.fetchQuery(urlsQuery(id));
    const analytics = await Promise.all(
      urls.map((url) =>
        queryClient.fetchQuery(analyticsQuery(id, url.shortID)),
      ),
    );
    return urls.map((url, index) => ({
      ...url,
      visitHistory: Array.isArray(analytics[index]?.visitHistory)
        ? analytics[index].visitHistory
        : [],
      totalVisits: Number(analytics[index]?.totalVisits || 0),
      linkClicks: Number(analytics[index]?.linkClicks || 0),
      qrScans: Number(analytics[index]?.qrScans || 0),
    }));
  },
});
export function useDashboardLinks() {
  const { user } = useAuth();
  const id = userIdFor(user);
  return useQuery(overviewQuery(id));
}
export function useLinkAnalytics(shortID) {
  const { user } = useAuth();
  const id = userIdFor(user);
  return useQuery({
    ...analyticsQuery(id, shortID),
    enabled: Boolean(id && shortID),
    refetchInterval: 60_000,
  });
}
export function useRecentActivity(limit) {
  const { user } = useAuth();
  const id = userIdFor(user);
  return useQuery({
    queryKey: keys.activity(id, limit),
    enabled: Boolean(id),
    staleTime: 30_000,
    refetchInterval: 60_000,
    queryFn: ({ signal }) => fetchRecentActivity(limit, signal),
  });
}
