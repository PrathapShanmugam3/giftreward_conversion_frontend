import { useId, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3, Table2 } from 'lucide-react';
import { Segmented } from '../ui';
import { cn } from '../../utils/format';

// One measure at a time on a single y-axis (clicks / conversions /
// earnings have different scales, so they're switched, never overlaid on
// two axes). Brand colour validated with the dataviz palette checker; a
// table view is one click away for exact values and accessibility.
const CHART_COLOR = '#4f46e5';
const INK_MUTED = '#64748b';
const GRID = '#eef0f5';

function ChartTooltip({ active, payload, label, format }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-ink-900 px-3 py-2 text-xs shadow-pop">
      <p className="font-semibold text-slate-300">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-white tabular-nums">{format(payload[0].value)}</p>
    </div>
  );
}

export default function TrendChart({ data, series, height = 280, kind = 'area', className, emptyText = 'No data for this period yet.' }) {
  const [active, setActive] = useState(series[0].key);
  const [view, setView] = useState('chart');
  const gradientId = useId().replace(/:/g, '');
  const current = series.find((s) => s.key === active) || series[0];
  const fmt = current.format || ((v) => v);
  const hasData = data?.some((d) => Number(d[current.key]) > 0);

  return (
    <div className={className}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        {series.length > 1 ? (
          <Segmented size="sm" value={active} onChange={setActive} options={series.map((s) => ({ value: s.key, label: s.label }))} />
        ) : (
          <span />
        )}
        <div className="flex rounded-lg bg-slate-100 p-0.5">
          {[
            { v: 'chart', icon: BarChart3, label: 'Chart view' },
            { v: 'table', icon: Table2, label: 'Table view' },
          ].map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setView(o.v)}
              aria-label={o.label}
              className={cn('rounded-md p-1.5 transition', view === o.v ? 'bg-white text-ink-900 shadow-card' : 'text-ink-400 hover:text-ink-700')}
            >
              <o.icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </div>

      {view === 'table' ? (
        <div className="scroll-thin overflow-auto rounded-xl ring-1 ring-line" style={{ maxHeight: height }}>
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 text-[11px] font-bold tracking-wider text-ink-500 uppercase">
              <tr>
                <th className="px-4 py-2 text-left">Period</th>
                {series.map((s) => (
                  <th key={s.key} className="px-4 py-2 text-right">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.label} className="border-t border-line/70">
                  <td className="px-4 py-2 text-ink-700">{row.label}</td>
                  {series.map((s) => (
                    <td key={s.key} className="px-4 py-2 text-right font-semibold text-ink-900 tabular-nums">
                      {(s.format || ((v) => v))(row[s.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !hasData ? (
        <div className="flex items-center justify-center rounded-2xl bg-slate-50/70 text-sm text-ink-500 ring-1 ring-line ring-dashed" style={{ height }}>
          {emptyText}
        </div>
      ) : (
        <div style={{ height }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            {kind === 'bar' ? (
              <BarChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid vertical={false} stroke={GRID} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: INK_MUTED }} axisLine={false} tickLine={false} minTickGap={12} />
                <YAxis tick={{ fontSize: 11, fill: INK_MUTED }} axisLine={false} tickLine={false} tickFormatter={current.axisFormat || fmt} width={56} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(79,70,229,0.06)' }} content={<ChartTooltip format={fmt} />} />
                <Bar dataKey={current.key} fill={CHART_COLOR} radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            ) : (
              <AreaChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLOR} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={CHART_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={GRID} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: INK_MUTED }} axisLine={false} tickLine={false} minTickGap={16} />
                <YAxis tick={{ fontSize: 11, fill: INK_MUTED }} axisLine={false} tickLine={false} tickFormatter={current.axisFormat || fmt} width={56} allowDecimals={false} />
                <Tooltip cursor={{ stroke: CHART_COLOR, strokeWidth: 1, strokeDasharray: '4 4' }} content={<ChartTooltip format={fmt} />} />
                <Area
                  type="monotone"
                  dataKey={current.key}
                  stroke={CHART_COLOR}
                  strokeWidth={2}
                  fill={`url(#${gradientId})`}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff', fill: CHART_COLOR }}
                  dot={false}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
