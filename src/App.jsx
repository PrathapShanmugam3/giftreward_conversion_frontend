import { Routes, Route, Navigate } from 'react-router-dom';
import { usePublisherAuth, useAdminAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import PublisherLayout from './layouts/PublisherLayout';
import AdminLayout from './layouts/AdminLayout';

import Landing from './pages/public/Landing';
import PublisherLogin from './pages/publisher/Login';
import PublisherRegister from './pages/publisher/Register';
import VerifyEmail from './pages/publisher/VerifyEmail';
import ForgotPassword from './pages/publisher/ForgotPassword';
import ResetPassword from './pages/publisher/ResetPassword';
import AdminLogin from './pages/admin/Login';
import AdminOffers from './pages/admin/Offers';
import OfferRequests from './pages/admin/OfferRequests';
import PublisherOffers from './pages/publisher/Offers';
import PublisherCampaigns from './pages/publisher/Campaigns';
import CampaignStats from './pages/publisher/CampaignStats';
import CampaignLanding from './pages/public/CampaignLanding';
import Referral from './pages/public/Referral';
import PublisherWallet from './pages/publisher/Wallet';
import PublisherInvoice from './pages/publisher/Invoice';
import AdminWithdrawals from './pages/admin/Withdrawals';
import AdminConversions from './pages/admin/Conversions';
import PublisherReports from './pages/publisher/Reports';
import AdminReports from './pages/admin/Reports';
import AdminCampaignStats from './pages/admin/CampaignStats';
import AdminPublishers from './pages/admin/Publishers';
import AdminIpWhitelist from './pages/admin/IpWhitelist';
import AdminPostbacks from './pages/admin/Postbacks';
import PaymentGateways from './pages/admin/PaymentGateways';
import AdminSettings from './pages/admin/Settings';
import PublisherDashboard from './pages/publisher/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import PublisherConversions from './pages/publisher/Conversions';
import PublisherPostback from './pages/publisher/Postback';
import PublisherProfile from './pages/publisher/Profile';
import OfferDetail from './pages/publisher/OfferDetail';
import PublisherApiDocumentation from './pages/publisher/ApiDocumentation';
import PublisherSupport from './pages/publisher/Support';
import AdminPostbackTools from './pages/admin/PostbackTools';
import CustomEmailSender from './pages/admin/CustomEmailSender';

function PublisherProtected() {
  return <ProtectedRoute useAuth={usePublisherAuth} loginPath="/publisher/login" />;
}

function AdminProtected() {
  return <ProtectedRoute useAuth={useAdminAuth} loginPath="/admin/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/o" element={<CampaignLanding />} />
      <Route path="/refer" element={<Referral />} />

      {/* Publisher */}
      <Route path="/publisher/login" element={<PublisherLogin />} />
      <Route path="/publisher/register" element={<PublisherRegister />} />
      <Route path="/publisher/verify-email" element={<VerifyEmail />} />
      <Route path="/publisher/forgot-password" element={<ForgotPassword />} />
      <Route path="/publisher/reset-password" element={<ResetPassword />} />
      <Route element={<PublisherProtected />}>
        <Route path="/publisher" element={<PublisherLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PublisherDashboard />} />
          <Route path="offers" element={<PublisherOffers />} />
          <Route path="offers/:id" element={<OfferDetail />} />
          <Route path="campaigns" element={<PublisherCampaigns />} />
          <Route path="campaigns/:id/stats" element={<CampaignStats />} />
          <Route path="reports" element={<PublisherReports />} />
          <Route path="conversions" element={<PublisherConversions />} />
          <Route path="wallet" element={<PublisherWallet />} />
          <Route path="wallet/withdrawals/:id/invoice" element={<PublisherInvoice />} />
          <Route path="postback" element={<PublisherPostback />} />
          <Route path="profile" element={<PublisherProfile />} />
          <Route path="api-documentation" element={<PublisherApiDocumentation />} />
          <Route path="support" element={<PublisherSupport />} />
        </Route>
      </Route>

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<AdminProtected />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="offers" element={<AdminOffers />} />
          <Route path="offer-requests" element={<OfferRequests />} />
          <Route path="campaign-stats" element={<AdminCampaignStats />} />
          <Route path="publishers" element={<AdminPublishers />} />
          <Route path="conversions" element={<AdminConversions />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="withdrawals" element={<AdminWithdrawals />} />
          <Route path="postbacks" element={<AdminPostbacks />} />
          <Route path="postback-tools" element={<AdminPostbackTools />} />
          <Route path="custom-email" element={<CustomEmailSender />} />
          <Route path="ip-whitelist" element={<AdminIpWhitelist />} />
          <Route path="gateways" element={<PaymentGateways />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
