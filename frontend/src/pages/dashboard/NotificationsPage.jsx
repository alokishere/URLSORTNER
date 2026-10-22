import { Bell, CheckCircle2, Link2, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DashboardCard,
  EmptyState,
  LoadingBlock,
  PageIntro,
} from "../../components/dashboard/DashboardPrimitives";
import { formatRelativeTime } from "../../lib/dashboardData";

import { useRecentActivity } from "../../lib/dashboardQueries";

const activityIcon = (type) =>
  type === "qr_scan" ? QrCode : type === "link_click" ? Link2 : CheckCircle2;

const NotificationsPage = () => {
  const navigate = useNavigate();
  const {
    data: activity = [],
    isLoading: loading,
    error: queryError,
  } = useRecentActivity(100);
  const error = queryError
    ? queryError.response?.data?.error || "We could not load recent activity."
    : "";

  return (
    <div className="mx-auto max-w-[900px]">
      <PageIntro
        eyebrow="Workspace"
        title="Notifications"
        description="Recent link creation, direct clicks, and tracked QR scans in your workspace."
      />
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-xl border border-(--danger)/35 bg-(--danger-soft) px-4 py-3 text-sm text-(--danger)"
        >
          {error}
        </p>
      )}
      <DashboardCard className="overflow-hidden">
        {loading ? (
          <div className="space-y-0 p-5">
            {Array.from({ length: 7 }, (_, index) => (
              <div
                key={index}
                className="flex items-center gap-3 border-b border-(--border) py-4 last:border-0"
              >
                <LoadingBlock className="h-10 w-10" />
                <div className="flex-1 space-y-2">
                  <LoadingBlock className="h-4 w-40" />
                  <LoadingBlock className="h-3 w-28" />
                </div>
              </div>
            ))}
          </div>
        ) : activity.length ? (
          <ul className="divide-y divide-(--border)">
            {activity.map((item) => {
              const Icon = activityIcon(item.type);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() =>
                      item.shortID &&
                      navigate(`/dashboard/links/${item.shortID}/analytics`)
                    }
                    className="focus-ring flex w-full cursor-pointer items-center gap-3 px-4 py-4 text-left hover:bg-(--surface-soft)/55 sm:px-5"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center text-(--primary-deep)">
                      <Icon className="semantic-icon h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block text-sm text-(--primary-text)">
                        {item.title}
                      </strong>
                      <span className="mt-0.5 block truncate text-xs text-(--secondary-text)">
                        {item.detail}
                      </span>
                    </span>
                    <time
                      dateTime={item.timestamp}
                      className="shrink-0 text-right text-xs text-(--secondary-text)"
                    >
                      {formatRelativeTime(item.timestamp)}
                    </time>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            icon={Bell}
            title="No notifications yet"
            description="Create or share a short link and your workspace activity will appear here."
          />
        )}
      </DashboardCard>
    </div>
  );
};

export default NotificationsPage;
