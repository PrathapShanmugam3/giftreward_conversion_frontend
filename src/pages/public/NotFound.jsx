import { ArrowLeft, Compass } from 'lucide-react';
import { usePageTitle } from '../../context/SiteContext';
import { BrandMark } from '../../layouts/AppShell';
import { Button } from '../../components/ui';

export default function NotFound() {
  usePageTitle('Page not found');
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-sidebar px-4 text-center">
      <div className="bg-grid absolute inset-0 opacity-40" />
      <div className="absolute top-1/4 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-600/30 blur-[120px]" />
      <div className="relative">
        <BrandMark className="justify-center" />
        <p className="mt-12 bg-gradient-to-b from-white to-slate-500 bg-clip-text text-8xl font-extrabold tracking-tight text-transparent sm:text-9xl">404</p>
        <p className="mt-4 flex items-center justify-center gap-2 text-lg font-bold text-white">
          <Compass className="h-5 w-5 text-brand-300" /> This page wandered off
        </p>
        <p className="mt-2 text-sm text-slate-400">The link may be broken or the page may have moved.</p>
        <Button to="/" size="lg" className="mt-8" icon={ArrowLeft}>
          Back to home
        </Button>
      </div>
    </div>
  );
}
