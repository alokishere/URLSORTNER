import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { AuthLoadingScreen } from "../auth/AuthContext";
import { useAuth } from "../auth/authStore";
import LandingPage from "../pages/LandingPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";

const DashboardLayout = lazy(() => import("../layout/DashboardLayout"));
const Analytics = lazy(() => import("../pages/Analytics"));
const CreateSortUrl = lazy(() => import("../pages/CreateSortUrl"));
const DashboardHome = lazy(() => import("../pages/dashboard/DashboardHome"));
const DashboardLinks = lazy(() => import("../pages/dashboard/DashboardLinks"));
const AnalyticsOverview = lazy(() => import("../pages/dashboard/DashboardPlaceholder").then((module) => ({ default: module.AnalyticsOverview })));
const BioPagesPage = lazy(() => import("../pages/dashboard/DashboardPlaceholder").then((module) => ({ default: module.BioPagesPage })));
const BillingPage = lazy(() => import("../pages/dashboard/DashboardPlaceholder").then((module) => ({ default: module.BillingPage })));
const CampaignsPage = lazy(() => import("../pages/dashboard/DashboardPlaceholder").then((module) => ({ default: module.CampaignsPage })));
const DomainsPage = lazy(() => import("../pages/dashboard/DashboardPlaceholder").then((module) => ({ default: module.DomainsPage })));
const IntegrationsPage = lazy(() => import("../pages/dashboard/DashboardPlaceholder").then((module) => ({ default: module.IntegrationsPage })));
const ToolsPage = lazy(() => import("../pages/dashboard/DashboardPlaceholder").then((module) => ({ default: module.ToolsPage })));
const NotificationsPage = lazy(() => import("../pages/dashboard/NotificationsPage"));
const QRCodePage = lazy(() => import("../pages/dashboard/QRCodePage"));
const ProfilePage = lazy(() => import("../pages/dashboard/ProfilePage"));
const SecurityPage = lazy(() => import("../pages/dashboard/SecurityPage"));
const SettingsPage = lazy(() => import("../pages/dashboard/SettingsPage"));

const ProtectedRoute = ({ children }) => {
  const { status } = useAuth();
  const location = useLocation();
  if (status === "checking") return <AuthLoadingScreen />;
  if (status !== "authenticated") {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to="/" state={{ authMode: "login", next }} replace />;
  }
  return children;
};

const LegacyAuthRedirect = ({ mode }) => {
  const { status } = useAuth();
  const location = useLocation();
  if (status === "checking") return <AuthLoadingScreen />;
  if (status === "authenticated") return <Navigate to="/dashboard" replace />;
  return <Navigate to="/" state={{ authMode: mode, next: new URLSearchParams(location.search).get("next") }} replace />;
};

const HomeRoute = () => {
  const { status } = useAuth();
  return status === "authenticated" ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};

const LegacyAnalyticsRedirect = () => {
  const { sortid } = useParams();
  return <Navigate to={`/dashboard/links/${sortid}/analytics`} replace />;
};

const FallbackRoute = () => {
  const { status } = useAuth();
  if (status === "checking") return <AuthLoadingScreen />;
  return <Navigate to={status === "authenticated" ? "/dashboard" : "/"} replace />;
};

const Mainroute = () => (
  <Suspense fallback={null}>
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/login" element={<LegacyAuthRedirect mode="login" />} />
      <Route path="/register" element={<LegacyAuthRedirect mode="register" />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
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
        <Route path="settings/security" element={<SecurityPage />} />
        <Route path="settings/sequrity" element={<SecurityPage />} />
        <Route path="billing" element={<BillingPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>
      <Route path="/create" element={<ProtectedRoute><Navigate to="/dashboard/create" replace /></ProtectedRoute>} />
      <Route path="/analytics/:sortid" element={<ProtectedRoute><LegacyAnalyticsRedirect /></ProtectedRoute>} />
      <Route path="*" element={<FallbackRoute />} />
    </Routes>
  </Suspense>
);

export default Mainroute;
