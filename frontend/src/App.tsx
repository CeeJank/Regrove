<<<<<<< HEAD
/*import { BrowserRouter, Route, Routes } from "react-router-dom";
import ChildProfilePage from "./pages/ChildProfilePage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import RecordingPage from "./pages/RecordingPage";
import YouthCataloguePage from "./pages/YouthCataloguePage";
<<<<<<< HEAD
=======
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Pages
import ChildProfilePage       from "./pages/ChildProfilePage";
import DashboardPage          from "./pages/DashboardPage";
import HomePage               from "./pages/HomePage";
import RecordingPage          from "./pages/RecordingPage";
import YouthCataloguePage     from "./pages/YouthCataloguePage";
>>>>>>> 682a214 (Finish logins for youth and worker with jwt and bcrypt credentials)
import CreateYouthProfilePage from "./pages/CreateYouthProfilePage";
import LoginPage              from "./pages/LoginPage";

// ProtectedRoute wraps routes that require an authenticated session.
// It redirects to /login when no JWT is found in localStorage.
import ProtectedRoute from "./components/ProtectedRoute";

=======
import CreateYouthProfilePage from "./pages/CreateYouthProfilePage";
>>>>>>> feature-youthcatalogue
import "./styles/app.css";
*/
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

<<<<<<< HEAD
// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CasesProvider } from './contexts/CasesContext';
import { EventsProvider } from './contexts/EventsContext';
import { MessagesProvider } from './contexts/MessagesContext';
import { DocumentationProvider } from './contexts/DocumentationContext';

// Layouts
import { SocialWorkerLayout } from './components/layout/SocialWorkerLayout';
import { ChildLayout } from './components/layout/ChildLayout';

// Universal pages
import MainPage from './pages/main';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';

// Social Worker pages
import SWHome from './pages/social-worker/home';
import SWCalendar from './pages/social-worker/calendar';
import SWMessages from './pages/social-worker/messages';
import ActiveCases from './pages/social-worker/activeCases';
import YouthCatalog from './pages/social-worker/youthCatalog';

// Child pages
import ChildHome from './pages/child/home';
import CheckIns from './pages/child/checkIns';
import ChildMessages from './pages/child/messages';
import ChildCalendar from './pages/child/calendar';
import Chatbot from './pages/child/chatbot';

import './index.css';

// Route guards
const ProtectedSWRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'social_worker') return <Navigate to="/child/home" replace />;
  return <SocialWorkerLayout>{children}</SocialWorkerLayout>;
};

const ProtectedChildRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'child') return <Navigate to="/sw/home" replace />;
  return <ChildLayout>{children}</ChildLayout>;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
<<<<<<< HEAD
    <Routes>
      {/* Universal */}
      <Route path="/" element={<MainPage />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'social_worker' ? '/sw/home' : '/child/home'} replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to={user.role === 'social_worker' ? '/sw/home' : '/child/home'} replace /> : <RegisterPage />} />

      {/* Social Worker */}
      <Route path="/sw/home"          element={<ProtectedSWRoute><SWHome /></ProtectedSWRoute>} />
      <Route path="/sw/calendar"      element={<ProtectedSWRoute><SWCalendar /></ProtectedSWRoute>} />
      <Route path="/sw/messages"      element={<ProtectedSWRoute><SWMessages /></ProtectedSWRoute>} />
      <Route path="/sw/active-cases"  element={<ProtectedSWRoute><ActiveCases /></ProtectedSWRoute>} />
      <Route path="/sw/youth-catalog" element={<ProtectedSWRoute><YouthCatalog /></ProtectedSWRoute>} />

      {/* Child */}
      <Route path="/child/home"      element={<ProtectedChildRoute><ChildHome /></ProtectedChildRoute>} />
      <Route path="/child/check-ins" element={<ProtectedChildRoute><CheckIns /></ProtectedChildRoute>} />
      <Route path="/child/messages"  element={<ProtectedChildRoute><ChildMessages /></ProtectedChildRoute>} />
      <Route path="/child/calendar"  element={<ProtectedChildRoute><ChildCalendar /></ProtectedChildRoute>} />
      <Route path="/child/chatbot"   element={<ProtectedChildRoute><Chatbot /></ProtectedChildRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
=======
<<<<<<< HEAD
// ─── App ──────────────────────────────────────────────────────────────────────
// Root component. Defines the full client-side routing table.
//
// Public routes  (no auth required):
//   /          — home
//   /login     — login form
//
// Legacy routes (pre-existing, auth handled individually):
//   /children/:childId
//   /children/:childId/session/:sessionId
//   /dashboard
//
// Protected routes (JWT required — ProtectedRoute redirects to /login):
//   /youth          — youth catalogue (worker/admin only)
//   /youth/create   — create youth profile (worker/admin only)
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Legacy routes */}
        <Route path="/children/:childId/session/:sessionId" element={<RecordingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/children/:childId" element={<ChildProfilePage />} />

        {/* Protected — redirect to /login if no token in localStorage */}
        <Route
          path="/youth"
          element={<ProtectedRoute><YouthCataloguePage /></ProtectedRoute>}
        />
        <Route
          path="/youth/create"
          element={<ProtectedRoute><CreateYouthProfilePage /></ProtectedRoute>}
        />
      </Routes>
    </BrowserRouter>
>>>>>>> 682a214 (Finish logins for youth and worker with jwt and bcrypt credentials)
=======
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/children/:childId/session/:sessionId" element={<RecordingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/children/:childId" element={<ChildProfilePage />} />
        <Route path="/youth" element={<YouthCataloguePage />} />
        <Route path="/youth/create" element={<CreateYouthProfilePage />} />
      </Routes>
    </BrowserRouter>
>>>>>>> a46615a (Finish Youth creation, youth cataogue and routing errors.)
>>>>>>> feature-youthcatalogue
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <CasesProvider>
        <DocumentationProvider>
          <EventsProvider>
            <MessagesProvider>
              <AppRoutes />
            </MessagesProvider>
          </EventsProvider>
        </DocumentationProvider>
      </CasesProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
