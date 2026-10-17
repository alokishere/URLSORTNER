import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import DashboardLayout from '../layout/DashboardLayout';
import DashboardHome from '../pages/dashboard/DashboardHome';
import DashboardLinks from '../pages/dashboard/DashboardLinks';
import CreateSortUrl from '../pages/CreateSortUrl';
import Analytics from '../pages/Analytics';
import Loginpage from '../pages/Loginpage';
import RegisterPage from '../pages/RegisterPage';
import { AnalyticsOverview, BioPagesPage, BillingPage, CampaignsPage, DomainsPage, IntegrationsPage, NotificationsPage, QRCodePage, ToolsPage } from '../pages/dashboard/DashboardPlaceholder';
import ProfilePage from '../pages/dashboard/ProfilePage';
import SettingsPage from '../pages/dashboard/SettingsPage';

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

const ProtectedRoute = ({ children }) => getStoredUser() ? children : <Navigate to="/login" replace />;

const LegacyAnalyticsRedirect = () => {
  const { sortid } = useParams();
  return <Navigate to={`/dashboard/links/${sortid}/analytics`} replace />;
};

const Mainroute = () => {
  const user = getStoredUser();
  return <Routes><Route path="/" element={<LandingPage />} /><Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Loginpage />} /><Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} /><Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}><Route index element={<DashboardHome />} /><Route path="links" element={<DashboardLinks />} /><Route path="create" element={<CreateSortUrl />} /><Route path="analytics" element={<AnalyticsOverview />} /><Route path="links/:sortid/analytics" element={<Analytics />} /><Route path="qr-codes" element={<QRCodePage />} /><Route path="bio-pages" element={<BioPagesPage />} /><Route path="domains" element={<DomainsPage />} /><Route path="campaigns" element={<CampaignsPage />} /><Route path="tools" element={<ToolsPage />} /><Route path="integrations" element={<IntegrationsPage />} /><Route path="settings" element={<SettingsPage />} /><Route path="settings/profile" element={<ProfilePage />} /><Route path="billing" element={<BillingPage />} /><Route path="notifications" element={<NotificationsPage />} /></Route><Route path="/create" element={<ProtectedRoute><Navigate to="/dashboard/create" replace /></ProtectedRoute>} /><Route path="/analytics/:sortid" element={<ProtectedRoute><LegacyAnalyticsRedirect /></ProtectedRoute>} /><Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} /></Routes>;
};

export default Mainroute;
