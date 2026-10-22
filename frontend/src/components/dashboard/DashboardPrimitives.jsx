import React from "react";
import {
  ArrowUpRight,
  Ban,
  Check,
  Copy,
  ExternalLink,
  Link2,
  MoreHorizontal,
  Pencil,
  QrCode,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  formatCompact,
  formatDate,
  getClicks,
  getShortUrl,
} from "../../lib/dashboardData";
import { cx } from "./classNames";

export const DashboardCard = ({ children, className = "", ...props }) => (
  <section className={cx("dash-card", className)} {...props}>
    {children}
  </section>
);

export const LoadingBlock = ({ className = "" }) => (
  <div
    aria-hidden="true"
    className={cx("animate-pulse rounded-xl bg-(--surface-soft)", className)}
  />
);

export const LinkTableSkeleton = ({ rows = 5 }) => (
  <div aria-label="Loading links" className="divide-y divide-(--border)">
    {Array.from({ length: rows }, (_, index) => (
      <div
        key={index}
        className="flex min-w-[900px] items-center gap-4 px-4 py-4"
      >
        <LoadingBlock className="h-4 w-4 rounded" />
        <LoadingBlock className="h-9 w-44" />
        <LoadingBlock className="h-4 flex-1" />
        <LoadingBlock className="h-4 w-12" />
        <LoadingBlock className="h-4 w-20" />
        <LoadingBlock className="h-6 w-16 rounded-full" />
        <LoadingBlock className="h-9 w-28" />
      </div>
    ))}
  </div>
);

export const IconButton = ({ label, children, className = "", ...props }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={cx(
      "focus-ring inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-(--secondary-text) transition hover:bg-(--surface-soft) hover:text-(--primary-text)",
      className,
    )}
    {...props}
  >
    {children}
  </button>
);

export const Button = React.forwardRef(function Button(
  { children, variant = "primary", className = "", ...props },
  ref,
) {
  const variants = {
    primary:
      "bg-(--accent) text-(--surface) shadow-sm hover:bg-[var(--accent-deep)]",
    secondary:
      "border border-(--border) bg-(--surface) text-(--primary-text) hover:border-[var(--primary)] hover:bg-(--surface-soft)",
    quiet:
      "text-(--secondary-text) hover:bg-(--surface-soft) hover:text-(--primary-text)",
  };
  return (
    <button
      ref={ref}
      type="button"
      className={cx(
        "focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});

export const PageIntro = ({ eyebrow, title, description, actions }) => (
  <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
    <div>
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.17em] text-(--primary-deep)">
          {eyebrow}
        </p>
      )}
      <h1 className="text-3xl font-bold tracking-[-0.035em] text-(--primary-text) sm:text-[2.1rem]">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-(--secondary-text) sm:text-base">
          {description}
        </p>
      )}
    </div>
    {actions && (
      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    )}
  </div>
);

export const SectionHeading = ({ icon: Icon, title, description, action }) => (
  <div className="flex items-start justify-between gap-4">
    <div className="flex items-start gap-3">
      {Icon && (
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center text-(--primary-deep)">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      )}
      <div>
        <h2 className="text-base font-bold text-(--primary-text)">{title}</h2>
        {description && (
          <p className="mt-1 text-xs text-(--secondary-text)">{description}</p>
        )}
      </div>
    </div>
    {action}
  </div>
);

export const StatusPill = ({ children = "Active", tone = "success" }) => {
  const tones = {
    success: "bg-(--success-soft) text-(--success)",
    warning: "bg-(--warning-soft) text-(--warning)",
    neutral: "bg-(--surface-soft) text-(--secondary-text)",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        tones[tone],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
};

export const StatCard = ({
  icon: Icon,
  label,
  value,
  change,
  helper,
}) => (
  <DashboardCard className="dash-card-hover p-4 sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <span
        className={cx(
          "flex h-11 w-11 items-center text-(--primary-deep)",
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      {change && (
        <span className="rounded-full bg-(--success-soft) px-2 py-1 text-[11px] font-semibold text-(--success)">
          ↑ {change}
        </span>
      )}
    </div>
    <p className="mt-4 text-sm text-(--secondary-text)">{label}</p>
    <div className="mt-1 text-[2rem] font-bold tracking-[-0.04em] text-(--primary-text)">
      {value}
    </div>
    <div className="mt-1 text-xs text-(--secondary-text)">{helper}</div>
  </DashboardCard>
);

export const EmptyState = ({
  icon: Icon = Link2,
  title,
  description,
  action,
}) => (
  <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
    <span className="mb-4 flex h-12 w-12 items-center justify-center text-(--primary-deep)">
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
    <h3 className="text-base font-semibold text-(--primary-text)">{title}</h3>
    <p className="mt-1 max-w-sm text-sm leading-6 text-(--secondary-text)">
      {description}
    </p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const CopyButton = ({ url }) => {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };
  return (
    <IconButton label={copied ? "Copied" : "Copy short URL"} onClick={copy}>
      {copied ? (
        <Check className="h-4 w-4 text-(--success)" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </IconButton>
  );
};

export const LinkRow = ({
  url,
  selectable = false,
  checked = false,
  onCheck,
  onAction,
  onEdit,
  onToggleStatus,
  onDelete,
  onQr,
  actionLoading = false,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [menuPosition, setMenuPosition] = React.useState(null);
  const menuRef = React.useRef(null);
  const navigate = useNavigate();
  const shortUrl = getShortUrl(url);
  const clicks = getClicks(url);

  React.useEffect(() => {
    if (!menuOpen) return undefined;

    const closeMenu = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const closeForViewportChange = () => setMenuOpen(false);

    document.addEventListener("pointerdown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeForViewportChange);
    window.addEventListener("scroll", closeForViewportChange, true);
    return () => {
      document.removeEventListener("pointerdown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeForViewportChange);
      window.removeEventListener("scroll", closeForViewportChange, true);
    };
  }, [menuOpen]);

  const toggleMenu = (event) => {
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 176;
    const menuHeight = 154;
    setMenuPosition({
      left: Math.max(
        12,
        Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 12),
      ),
      top: Math.max(
        12,
        Math.min(
          rect.top - menuHeight - 8,
          window.innerHeight - menuHeight - 12,
        ),
      ),
    });
    setMenuOpen(true);
    onAction?.();
  };

  return (
    <tr className="border-t border-(--border) transition hover:bg-(--surface-soft)/55">
      <td className="w-10 px-3 py-3.5 sm:px-4">
        {selectable && (
          <input
            aria-label={`Select ${url.shortID}`}
            type="checkbox"
            checked={checked}
            onChange={onCheck}
            className="h-4 w-4 cursor-pointer rounded border-(--border) accent-[var(--primary-deep)]"
          />
        )}
      </td>
      <td className="min-w-48 px-3 py-3.5 sm:px-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center text-(--primary-deep)">
            <Link2 className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-(--primary-text)">
              ekurl.in/{url.shortID}
            </p>
            <p className="truncate text-xs text-(--secondary-text)">
              {url.title || url.alias || "Short link"}
            </p>
          </div>
        </div>
      </td>
      <td className="max-w-64 px-3 py-3.5 text-sm text-(--secondary-text) sm:px-4">
        <a
          className="block truncate hover:text-(--primary-deep)"
          href={url.redirectUrl}
          target="_blank"
          rel="noreferrer"
          title={url.redirectUrl}
        >
          {url.redirectUrl}
        </a>
      </td>
      <td className="whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-(--primary-text) sm:px-4">
        {formatCompact(clicks)}
      </td>
      <td className="whitespace-nowrap px-3 py-3.5 text-sm text-(--secondary-text) sm:px-4">
        {formatDate(url.createdAt)}
      </td>
      <td className="px-3 py-3.5 sm:px-4">
        <StatusPill tone={url.status === "active" ? "success" : "warning"}>
          {url.status === "active" ? "Active" : "Blocked"}
        </StatusPill>
      </td>
      <td className="w-[244px] px-2 py-3.5 align-middle sm:px-4">
        <div className="flex h-10 min-w-[220px] items-center justify-end gap-0.5 whitespace-nowrap">
          <CopyButton url={shortUrl} />
          <IconButton
            label="Open short link"
            onClick={() =>
              window.open(shortUrl, "_blank", "noopener,noreferrer")
            }
          >
            <ExternalLink className="h-4 w-4" />
          </IconButton>
          <IconButton
            label="View analytics"
            onClick={() =>
              navigate(`/dashboard/links/${url.shortID}/analytics`)
            }
          >
            <ArrowUpRight className="h-4 w-4" />
          </IconButton>
          <IconButton label="Generate QR code" onClick={() => onQr?.(url)}>
            <QrCode className="h-4 w-4" />
          </IconButton>
          <div>
            <IconButton
              label="More link actions"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              onClick={toggleMenu}
            >
              <MoreHorizontal className="h-4 w-4" />
            </IconButton>
            {menuOpen && (
              <div
                ref={menuRef}
                role="menu"
                className="fixed z-70 w-44 rounded-xl border border-(--border) bg-(--surface) p-1.5 shadow-xl"
                style={menuPosition}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit?.(url);
                  }}
                  className="focus-ring flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-left text-sm hover:bg-(--surface-soft)"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => {
                    setMenuOpen(false);
                    onToggleStatus?.(url);
                  }}
                  className="focus-ring flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-left text-sm hover:bg-(--surface-soft) disabled:opacity-50"
                >
                  {url.status === "active" ? (
                    <Ban className="h-4 w-4" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  {url.status === "active" ? "Block link" : "Unblock link"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete?.(url);
                  }}
                  className="focus-ring flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-left text-sm text-(--danger) hover:bg-(--danger-soft)"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};
