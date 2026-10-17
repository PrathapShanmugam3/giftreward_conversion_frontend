import { Link, Navigate } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { LEGAL_DOCS } from '../../config/legal';
import { BRAND } from '../../config/brand';
import { usePageTitle } from '../../context/SiteContext';
import { PublicFooter, PublicNav } from '../../layouts/PublicLayout';
import { cn } from '../../utils/format';

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export default function Legal({ doc }) {
  const page = LEGAL_DOCS[doc];
  usePageTitle(page?.title);
  if (!page) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-canvas">
      <PublicNav />
      <header className="relative overflow-hidden bg-sidebar pt-[72px]">
        <div className="bg-grid absolute inset-0 opacity-50" />
        <div className="absolute -top-32 left-1/3 h-80 w-80 rounded-full bg-brand-600/40 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <p className="text-xs font-extrabold tracking-[0.18em] text-brand-300 uppercase">Legal</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{page.title}</h1>
          <p className="mt-3 text-sm text-slate-400">Last updated: {page.updated}</p>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            <nav className="space-y-1">
              <p className="mb-2 text-[11px] font-bold tracking-wider text-ink-400 uppercase">On this page</p>
              {page.sections.map((s, i) => (
                <a key={s.h} href={`#${slug(s.h)}`} className="block truncate rounded-lg px-2 py-1 text-sm text-ink-500 hover:bg-white hover:text-ink-900">
                  {i + 1}. {s.h}
                </a>
              ))}
            </nav>
            <nav className="space-y-1 border-t border-line pt-5">
              <p className="mb-2 text-[11px] font-bold tracking-wider text-ink-400 uppercase">Other policies</p>
              {Object.entries(LEGAL_DOCS).map(([key, d]) => (
                <Link key={key} to={`/${key}`} className={cn('block rounded-lg px-2 py-1 text-sm', key === doc ? 'font-bold text-brand-700' : 'text-ink-500 hover:text-ink-900')}>
                  {d.title}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <article className="space-y-5">
          {page.sections.map((s, i) => (
            <section key={s.h} id={slug(s.h)} className="scroll-mt-24 rounded-3xl bg-white p-6 shadow-card ring-1 ring-line sm:p-8">
              <h2 className="flex items-center gap-3 text-lg font-extrabold text-ink-900">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-sm text-brand-700">{i + 1}</span>
                {s.h}
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-ink-700">
                {s.p && <p>{s.p}</p>}
                {s.list && (
                  <ul className="space-y-2">
                    {s.list.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {s.defs && (
                  <dl className="divide-y divide-line rounded-2xl ring-1 ring-line">
                    {s.defs.map(([k, v]) => (
                      <div key={k} className="grid gap-1 px-4 py-3 sm:grid-cols-[220px_1fr]">
                        <dt className="font-bold text-ink-900">{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {s.cards && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {s.cards.map(([k, v]) => (
                      <div key={k} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-line">
                        <p className="font-bold text-ink-900">{k}</p>
                        <p className="mt-1 text-sm text-ink-500">{v}</p>
                      </div>
                    ))}
                  </div>
                )}
                {s.after && <p>{s.after}</p>}
                {s.contact && (
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2.5">
                      <Mail className="h-4 w-4 text-brand-500" />
                      <a href={`mailto:${BRAND.email}`} className="font-semibold text-brand-700 hover:underline">
                        {BRAND.email}
                      </a>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <Phone className="h-4 w-4 text-brand-500" /> {BRAND.phone}
                    </li>
                    <li className="flex items-center gap-2.5">
                      <MapPin className="h-4 w-4 text-brand-500" /> {BRAND.address}
                    </li>
                  </ul>
                )}
              </div>
            </section>
          ))}
        </article>
      </div>
      <PublicFooter />
    </div>
  );
}
