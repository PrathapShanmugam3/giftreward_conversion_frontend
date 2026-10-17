import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { usePublisherAuth, useAdminAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublisherLayout from './layouts/PublisherLayout';
import AdminLayout from './layouts/AdminLayout';
import Loader from './components/Loader';
import { PageSkeleton } from './components/ui';

// Route-level code splitting: public visitors never download the admin
// console, and each panel page loads on demand.
const Landing = lazy(() => import('./pages/public/Landing'));
const CampaignLanding = lazy(() => import('./pages/public/CampaignLanding'));
const Referral = lazy(() => import('./pages/public/Referral'));
const Tracking = lazy(() => import('./pages/public/Tracking'));
const Legal = lazy(() => import('./pages/public/Legal'));
const NotFound = lazy(() => import('./pages/public/NotFound'));

const PublisherLogin = lazy(() => import('./pages/publisher/Login'));
const PublisherRegister = lazy(() => import('./pages/publisher/Register'));
const VerifyEmail = lazy(() => import('./pages/publisher/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/publisher/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/publisher/ResetPassword'));
const PublisherDashboard = lazy(() => import('./pages/publisher/Dashboard'));
const PublisherOffers = lazy(() => import('./pages/publisher/Offers'));
const OfferDetail = lazy(() => import('./pages/publisher/OfferDetail'));
const PublisherCampaigns = lazy(() => import('./pages/publisher/Campaigns'));
const CampaignStats = lazy(() => import('./pages/publisher/CampaignStats'));
const PublisherReports = lazy(() => import('./pages/publisher/Reports'));
const PublisherConversions = lazy(() => import('./pages/publisher/Conversions'));
const PublisherWallet = lazy(() => import('./pages/publisher/Wallet'));
const PublisherInvoice = lazy(() => import('./pages/publisher/Invoice'));
const PublisherPostback = lazy(() => import('./pages/publisher/Postback'));
const PublisherProfile = lazy(() => import('./pages/publisher/Profile'));
const PublisherApiDocumentation = lazy(() => import('./pages/publisher/ApiDocumentation'));
const PublisherSupport = lazy(() => import('./pages/publisher/Support'));

const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminOffers = lazy(() => import('./pages/admin/Offers'));
const OfferRequests = lazy(() => import('./pages/admin/OfferRequests'));
const AdminCampaignStats = lazy(() => import('./pages/admin/CampaignStats'));
const AdminPublishers = lazy(() => import('./pages/admin/Publishers'));
const AdminConversions = lazy(() => import('./pages/admin/Conversions'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminWithdrawals = lazy(() => import('./pages/admin/Withdrawals'));
const AdminPostbacks = lazy(() => import('./pages/admin/Postbacks'));
const AdminPostbackTools = lazy(() => import('./pages/admin/PostbackTools'));
const CustomEmailSender = lazy(() => import('./pages/admin/CustomEmailSender'));
const AdminIpWhitelist = lazy(() => import('./pages/admin/IpWhitelist'));
const PaymentGateways = lazy(() => import('./pages/admin/PaymentGateways'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));

function PublisherProtected() {
  return <ProtectedRoute useAuth={usePublisherAuth} loginPath="/publisher/login" />;
}

function AdminProtected() {
  return <ProtectedRoute useAuth={useAdminAuth} loginPath="/admin/login" />;
}

// Panel pages render inside the shell, so their fallback is a skeleton of
// the content area rather than a full-screen spinner.
const page = (el) => <Suspense fallback={<PageSkeleton />}>{el}</Suspense>;

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/o" element={<CampaignLanding />} />
        <Route path="/refer" element={<Referral />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/privacy-policy" element={<Legal doc="privacy-policy" />} />
        <Route path="/terms-conditions" element={<Legal doc="terms-conditions" />} />
        <Route path="/cookie-policy" element={<Legal doc="cookie-policy" />} />
        <Route path="/affiliate-agreement" element={<Legal doc="affiliate-agreement" />} />

        {/* Publisher */}
        <Route path="/publisher/login" element={<PublisherLogin />} />
        <Route path="/publisher/register" element={<PublisherRegister />} />
        <Route path="/publisher/verify-email" element={<VerifyEmail />} />
        <Route path="/publisher/forgot-password" element={<ForgotPassword />} />
        <Route path="/publisher/reset-password" element={<ResetPassword />} />
        <Route element={<PublisherProtected />}>
          <Route path="/publisher" element={<PublisherLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={page(<PublisherDashboard />)} />
            <Route path="offers" element={page(<PublisherOffers />)} />
            <Route path="offers/:id" element={page(<OfferDetail />)} />
            <Route path="campaigns" element={page(<PublisherCampaigns />)} />
            <Route path="campaigns/:id/stats" element={page(<CampaignStats />)} />
            <Route path="reports" element={page(<PublisherReports />)} />
            <Route path="conversions" element={page(<PublisherConversions />)} />
            <Route path="wallet" element={page(<PublisherWallet />)} />
            <Route path="wallet/withdrawals/:id/invoice" element={page(<PublisherInvoice />)} />
            <Route path="postback" element={page(<PublisherPostback />)} />
            <Route path="profile" element={page(<PublisherProfile />)} />
            <Route path="api-documentation" element={page(<PublisherApiDocumentation />)} />
            <Route path="support" element={page(<PublisherSupport />)} />
          </Route>
        </Route>

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<AdminProtected />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={page(<AdminDashboard />)} />
            <Route path="offers" element={page(<AdminOffers />)} />
            <Route path="offer-requests" element={page(<OfferRequests />)} />
            <Route path="campaign-stats" element={page(<AdminCampaignStats />)} />
            <Route path="publishers" element={page(<AdminPublishers />)} />
            <Route path="conversions" element={page(<AdminConversions />)} />
            <Route path="reports" element={page(<AdminReports />)} />
            <Route path="withdrawals" element={page(<AdminWithdrawals />)} />
            <Route path="postbacks" element={page(<AdminPostbacks />)} />
            <Route path="postback-tools" element={page(<AdminPostbackTools />)} />
            <Route path="custom-email" element={page(<CustomEmailSender />)} />
            <Route path="ip-whitelist" element={page(<AdminIpWhitelist />)} />
            <Route path="gateways" element={page(<PaymentGateways />)} />
            <Route path="settings" element={page(<AdminSettings />)} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
