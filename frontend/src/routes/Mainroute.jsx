import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { AuthLoadingScreen } from "../auth/AuthContext";
import { useAuth } from "../auth/authStore";
import DashboardLayout from "../layout/DashboardLayout";
import Analytics from "../pages/Analytics";
import CreateSortUrl from "../pages/CreateSortUrl";
import LandingPage from "../pages/LandingPage";
import Loginpage from "../pages/Loginpage";
import RegisterPage from "../pages/RegisterPage";
import DashboardHome from "../pages/dashboard/DashboardHome";
import DashboardLinks from "../pages/dashboard/DashboardLinks";
import {
  AnalyticsOverview,
  BioPagesPage,
  BillingPage,
  CampaignsPage,
  DomainsPage,
  IntegrationsPage,
  ToolsPage,
} from "../pages/dashboard/DashboardPlaceholder";
import NotificationsPage from "../pages/dashboard/NotificationsPage";
import QRCodePage from "../pages/dashboard/QRCodePage";
import ProfilePage from "../pages/dashboard/ProfilePage";
import SettingsPage from "../pages/dashboard/SettingsPage";

const ProtectedRoute = ({ children }) => {
  const { status } = useAuth();
  const location = useLocation();
  if (status === "checking") return <AuthLoadingScreen />;
  if (status !== "authenticated") {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { status } = useAuth();
  if (status === "checking") return <AuthLoadingScreen />;
  return status === "authenticated" ? <Navigate to="/dashboard" replace /> : children;
};

const HomeRoute = () => {
  const { status } = useAuth();
  if (status === "checking") return <AuthLoadingScreen />;
  return status === "authenticated" ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};

const LegacyAnalyticsRedirect = () => {
  const { sortid } = useParams();
  return <Navigate to={`/dashboard/links/${sortid}/analytics`} replace />;
};

const FallbackRoute = () => {
  const { status } = useAuth();
  if (status === "checking") return <AuthLoadingScreen />;
  return <Navigate to={status === "authenticated" ? "/dashboard" : "/login"} replace />;
};

const Mainroute = () => (
  <Routes>
    <Route path="/" element={<HomeRoute />} />
    <Route path="/login" element={<PublicOnlyRoute><Loginpage /></PublicOnlyRoute>} />
    <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
      <Route index element={<DashboardHome />} />
      <Route path="links" element={<DashboardLinks />} />
      <Route path="create" element={<CreateSortUrl />} />
      <Route path="analytics" element={<AnalyticsOverview />} />
      <Route path="links/:sortid/analytics" element={<Analytics />} />
      <Route path="qr-codes" element={<QRCodePage />} />
      <Route path="bio-pages" element={<BioPagesPage />} />
      <Route path="domains" element={<DomainsPage />} />
      <Route path="campaigns" element={<CampaignsPage />} />
      <Route path="tools" element={<ToolsPage />} />
      <Route path="integrations" element={<IntegrationsPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="settings/profile" element={<ProfilePage />} />
      <Route path="billing" element={<BillingPage />} />
      <Route path="notifications" element={<NotificationsPage />} />
    </Route>
    <Route path="/create" element={<ProtectedRoute><Navigate to="/dashboard/create" replace /></ProtectedRoute>} />
    <Route path="/analytics/:sortid" element={<ProtectedRoute><LegacyAnalyticsRedirect /></ProtectedRoute>} />
    <Route path="*" element={<FallbackRoute />} />
  </Routes>
);

export default Mainroute;
