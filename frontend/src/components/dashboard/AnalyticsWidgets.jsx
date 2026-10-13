import { Globe2, Monitor, Smartphone, Tablet } from 'lucide-react';
import { DashboardCard, SectionHeading } from './DashboardPrimitives';
import { cx } from './classNames';

export const BarChart = ({ data, empty = false }) => {
  const max = Math.max(...data.map((item) => item.total), 1);
  return (
    <div className="mt-6">
      <div className="relative h-48 sm:h-56">
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between text-[10px] text-(--secondary-text)/75">
          {[1, 0.75, 0.5, 0.25, 0].map((line) => <div key={line} className="flex items-center gap-2"><span className="w-7 text-right">{Math.round(max * line)}</span><span className="h-px flex-1 border-t border-dashed border-(--border)" /></div>)}
        </div>
        <div className="absolute inset-0 left-9 flex items-end justify-between gap-1 pb-1 pt-2">
          {data.map((item) => (
            <div key={item.label} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <div className="relative flex h-full w-full items-end justify-center gap-0.5">
                <div className="w-[46%] rounded-t-[3px] bg-(--primary)/85 transition group-hover:bg-(--primary-deep)" style={{ height: `${Math.max((item.total / max) * 100, item.total ? 3 : 0)}%` }} title={`${item.total} clicks`} />
                <div className="w-[46%] rounded-t-[3px] bg-(--secondary) transition group-hover:bg-(--primary)/55" style={{ height: `${Math.max((item.unique / max) * 100, item.unique ? 3 : 0)}%` }} title={`${item.unique} unique visitors`} />
                {!empty && <span className="pointer-events-none absolute bottom-full mb-2 hidden rounded-md bg-(--primary-text) px-2 py-1 text-[10px] text-white group-hover:block">{item.total} clicks</span>}
              </div>
              <span className="text-[9px] text-(--secondary-text) sm:text-[10px]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-5 text-[11px] text-(--secondary-text)">
        <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-(--primary)" />Total clicks</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-(--secondary)" />Unique visitors</span>
      </div>
    </div>
  );
};

export const DonutChart = ({ segments, centerValue, centerLabel }) => {
  const gradient = segments.reduce((accumulator, segment) => {
    const start = accumulator.offset;
    const end = start + segment.percent;
    accumulator.parts.push(`${segment.color} ${start}% ${end}%`);
    accumulator.offset = end;
    return accumulator;
  }, { parts: [], offset: 0 }).parts.join(', ');
  return (
    <div className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
      <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-(--surface) text-center">
        <strong className="text-xl font-bold text-(--primary-text)">{centerValue}</strong>
        <span className="text-[10px] text-(--secondary-text)">{centerLabel}</span>
      </div>
    </div>
  );
};

export const LegendList = ({ items, marker = 'dot' }) => (
  <div className="min-w-0 flex-1 space-y-2.5">
    {items.map((item) => (
      <div key={item.label} className="flex items-center gap-2 text-xs">
        <span className={cx('h-2.5 w-2.5 shrink-0 rounded-full', marker === 'bar' && 'h-1.5 w-7 rounded-full')} style={{ background: item.color || 'var(--primary)' }} />
        <span className="min-w-0 flex-1 truncate text-(--secondary-text)">{item.label}</span>
        <strong className="font-semibold text-(--primary-text)">{item.value}</strong>
        <span className="w-7 text-right text-(--secondary-text)">{item.percent}%</span>
      </div>
    ))}
  </div>
);

export const InsightList = ({ items }) => (
  <div className="mt-5 space-y-3">
    {items.map((item) => (
      <div key={item.label}>
        <div className="flex items-center justify-between gap-3 text-xs"><span className="text-(--secondary-text)">{item.label}</span><span className="font-semibold text-(--primary-text)">{item.value}<span className="ml-2 font-normal text-(--secondary-text)">{item.percent}%</span></span></div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-(--surface-soft)"><div className="h-full rounded-full bg-(--primary)" style={{ width: `${Math.min(item.percent * 1.6, 100)}%` }} /></div>
      </div>
    ))}
  </div>
);

export const CountryCard = ({ items, preview = false }) => (
  <DashboardCard className="p-4 sm:p-5">
    <SectionHeading icon={Globe2} title="Top countries" action={<button type="button" className="focus-ring min-h-9 cursor-pointer rounded-lg border border-(--border) px-3 text-xs text-(--secondary-text) hover:bg-(--surface-soft)">By clicks</button>} />
    {preview ? <div className="mt-4 rounded-xl bg-(--surface-soft)/70 p-4 text-xs leading-5 text-(--secondary-text)">Country breakdown will appear when the API records visitor location. Preview values are shown for layout only.</div> : items.length ? <InsightList items={items} /> : <div className="mt-5 text-sm text-(--secondary-text)">No country data collected yet.</div>}
  </DashboardCard>
);

export const DeviceBrowserCard = ({ devices, browsers, preview = false }) => (
  <DashboardCard className="p-4 sm:p-5">
    <SectionHeading icon={Monitor} title="Device & browser" />
    {preview ? <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-(--surface-soft) p-3"><Smartphone className="h-4 w-4 text-(--primary-deep)" /><p className="mt-2 text-xs text-(--secondary-text)">Mobile</p><p className="text-lg font-bold text-(--primary-text)">65%</p></div><div className="rounded-xl bg-(--surface-soft) p-3"><Tablet className="h-4 w-4 text-(--primary-deep)" /><p className="mt-2 text-xs text-(--secondary-text)">Desktop</p><p className="text-lg font-bold text-(--primary-text)">26%</p></div><p className="col-span-2 text-xs leading-5 text-(--secondary-text)">Preview values only. Device and browser fields are not collected by the current API.</p></div> : <div className="mt-5"><InsightList items={devices.length ? devices : browsers} /></div>}
  </DashboardCard>
);

