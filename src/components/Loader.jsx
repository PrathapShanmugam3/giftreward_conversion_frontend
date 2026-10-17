export default function Loader({ className = '', label }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-16 ${className}`} role="status" aria-label="Loading">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-[3px] border-brand-100" />
        <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-brand-600" />
      </div>
      {label && <p className="text-sm text-ink-500">{label}</p>}
    </div>
  );
}
