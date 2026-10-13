import React from 'react';
import { ArrowUpRight, Check, Copy, ExternalLink, Link2, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCompact, formatDate, getClicks, getShortUrl } from '../../lib/dashboardData';
import { cx } from './classNames';

export const DashboardCard = ({ children, className = '', ...props }) => (
  <section className={cx('dash-card', className)} {...props}>
    {children}
  </section>
);

export const IconButton = ({ label, children, className = '', ...props }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={cx('focus-ring inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-(--secondary-text) transition hover:bg-(--surface-soft) hover:text-(--primary-text)', className)}
    {...props}
  >
    {children}
  </button>
);

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'bg-(--accent) text-(--primary-text) shadow-sm hover:bg-[var(--accent-deep)]',
    secondary: 'border border-(--border) bg-(--surface) text-(--primary-text) hover:border-[var(--primary)] hover:bg-(--surface-soft)',
    quiet: 'text-(--secondary-text) hover:bg-(--surface-soft) hover:text-(--primary-text)',
  };
  return (
    <button
      type="button"
      className={cx('focus-ring inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50', variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
};

export const PageIntro = ({ eyebrow, title, description, actions }) => (
  <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
    <div>
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.17em] text-(--primary-deep)">{eyebrow}</p>}
      <h1 className="text-3xl font-bold tracking-[-0.035em] text-(--primary-text) sm:text-[2.1rem]">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-(--secondary-text) sm:text-base">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const SectionHeading = ({ icon: Icon, title, description, action }) => (
  <div className="flex items-start justify-between gap-4">
    <div className="flex items-start gap-3">
      {Icon && <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--secondary)/55 text-(--primary-deep)"><Icon className="h-4 w-4" aria-hidden="true" /></span>}
      <div>
        <h2 className="text-base font-bold text-(--primary-text)">{title}</h2>
        {description && <p className="mt-1 text-xs text-(--secondary-text)">{description}</p>}
      </div>
    </div>
    {action}
  </div>
);

export const StatusPill = ({ children = 'Active', tone = 'success' }) => {
  const tones = {
    success: 'bg-[#e4eee2] text-(--success)',
    warning: 'bg-[#f4ead7] text-[#8c6d35]',
    neutral: 'bg-(--surface-soft) text-(--secondary-text)',
  };
  return <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold', tones[tone])}><span className="h-1.5 w-1.5 rounded-full bg-current" />{children}</span>;
};

export const StatCard = ({ icon: Icon, label, value, change, helper, tone = 'sage' }) => (
  <DashboardCard className="dash-card-hover p-4 sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <span className={cx('flex h-11 w-11 items-center justify-center rounded-xl', tone === 'gold' ? 'bg-[#f3ead7] text-[var(--accent-deep)]' : 'bg-(--secondary)/65 text-(--primary-deep)')}>
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      {change && <span className="rounded-full bg-[#e8f0e6] px-2 py-1 text-[11px] font-semibold text-(--success)">↑ {change}</span>}
    </div>
    <p className="mt-4 text-sm text-(--secondary-text)">{label}</p>
    <p className="mt-1 text-[2rem] font-bold tracking-[-0.04em] text-(--primary-text)">{value}</p>
    <p className="mt-1 text-xs text-(--secondary-text)">{helper}</p>
  </DashboardCard>
);

export const EmptyState = ({ icon: Icon = Link2, title, description, action }) => (
  <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
    <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-(--secondary)/65 text-(--primary-deep)"><Icon className="h-5 w-5" aria-hidden="true" /></span>
    <h3 className="text-base font-semibold text-(--primary-text)">{title}</h3>
    <p className="mt-1 max-w-sm text-sm leading-6 text-(--secondary-text)">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const DemoPill = () => <span className="rounded-full border border-[var(--accent)]/35 bg-[#f4ead7] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-deep)]">Preview data</span>;

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
  return <IconButton label={copied ? 'Copied' : 'Copy short URL'} onClick={copy}>{copied ? <Check className="h-4 w-4 text-(--success)" /> : <Copy className="h-4 w-4" />}</IconButton>;
};

export const LinkRow = ({ url, selectable = false, checked = false, onCheck, onAction }) => {
  const navigate = useNavigate();
  const shortUrl = getShortUrl(url);
  const clicks = getClicks(url);
  return (
    <tr className="border-t border-(--border) transition hover:bg-(--surface-soft)/55">
      <td className="w-10 px-3 py-3.5 sm:px-4">{selectable && <input aria-label={`Select ${url.shortID}`} type="checkbox" checked={checked} onChange={onCheck} className="h-4 w-4 cursor-pointer rounded border-(--border) accent-[var(--primary-deep)]" />}</td>
      <td className="min-w-48 px-3 py-3.5 sm:px-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--secondary)/65 text-(--primary-deep)"><Link2 className="h-4 w-4" aria-hidden="true" /></span>
          <div className="min-w-0"><p className="truncate text-sm font-semibold text-(--primary-text)">u.alokdev.in/{url.shortID}</p><p className="truncate text-xs text-(--secondary-text)">{url.alias || 'Short link'}</p></div>
        </div>
      </td>
      <td className="max-w-64 px-3 py-3.5 text-sm text-(--secondary-text) sm:px-4"><a className="block truncate hover:text-(--primary-deep)" href={url.redirectUrl} target="_blank" rel="noreferrer" title={url.redirectUrl}>{url.redirectUrl}</a></td>
      <td className="whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-(--primary-text) sm:px-4">{formatCompact(clicks)}</td>
      <td className="whitespace-nowrap px-3 py-3.5 text-sm text-(--secondary-text) sm:px-4">{formatDate(url.createdAt)}</td>
      <td className="px-3 py-3.5 sm:px-4"><StatusPill /></td>
      <td className="px-2 py-3.5 sm:px-4">
        <div className="flex items-center justify-end gap-0.5">
          <CopyButton url={shortUrl} />
          <IconButton label="Open short link" onClick={() => window.open(shortUrl, '_blank', 'noopener,noreferrer')}><ExternalLink className="h-4 w-4" /></IconButton>
          <IconButton label="View analytics" onClick={() => navigate(`/dashboard/links/${url.shortID}/analytics`)}><ArrowUpRight className="h-4 w-4" /></IconButton>
          <IconButton label="More link actions" onClick={onAction}><MoreHorizontal className="h-4 w-4" /></IconButton>
        </div>
      </td>
    </tr>
  );
};

