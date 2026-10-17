import { twMerge } from 'tailwind-merge';

// Shared display formatting so every page renders money/dates the same way.

// Joins class names and resolves Tailwind conflicts so a className passed
// to a component reliably overrides its variant defaults (last one wins).
export function cn(...classes) {
  return twMerge(classes.filter(Boolean).join(' '));
}

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 });
const num = new Intl.NumberFormat('en-IN');

export function formatCurrency(value) {
  const n = Number(value);
  return inr.format(Number.isFinite(n) ? n : 0);
}

export function formatNumber(value) {
  const n = Number(value);
  return num.format(Number.isFinite(n) ? n : 0);
}

export function formatPercent(value, digits = 2) {
  const n = Number(value);
  return `${(Number.isFinite(n) ? n : 0).toFixed(digits)}%`;
}

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(value) {
  if (!value) return '';
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(value);
}

export function isoDate(date = new Date()) {
  const d = new Date(date);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return isoDate(d);
}

export function monthStart() {
  const d = new Date();
  return isoDate(new Date(d.getFullYear(), d.getMonth(), 1));
}

// Pulls the most useful message out of an axios error from this backend
// (validation errors come back as { details: [{ msg }] }).
export function errorMessage(err, fallback = 'Something went wrong') {
  return err?.response?.data?.details?.[0]?.msg || err?.response?.data?.message || err?.message || fallback;
}

export function initials(name = '') {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  );
}
