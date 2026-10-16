import { Link } from 'react-router-dom';

// Replaces the legacy index.php/index.html marketing pages. Real offer-feed
// content lands when Phase 2 (offers API) is ready.
//
// Design note: the legacy site's hero used Poppins + a blue gradient
// (#2563eb family) with a glowing/blurred card treatment (see o/index.php's
// <style> block, which this app's CampaignLanding/Referral pages already
// mirror). This page borrows that same gradient-and-card language for brand
// consistency, but keeps the "GiftReward" name already used elsewhere in
// this app (PublisherLayout's sidebar header) rather than the legacy
// "GskLoots"/"RupiTask" branding, per the project's established rename.
export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4 text-center">
      <div className="w-full max-w-lg rounded-2xl border border-blue-100 bg-white/90 p-10 shadow-lg backdrop-blur">
        <h1 className="bg-gradient-to-br from-blue-500 to-blue-700 bg-clip-text text-4xl font-extrabold text-transparent">
          GiftReward
        </h1>
        <p className="mt-3 max-w-md text-gray-600">India's affiliate (CPA) network — earn with every click.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/publisher/login"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Publisher Login
          </Link>
          <Link
            to="/admin/login"
            className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-200"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
