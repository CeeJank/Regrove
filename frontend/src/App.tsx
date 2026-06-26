import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

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
import SWDashboard from './pages/social-worker/dashboard';
import SWCalendar from './pages/social-worker/calendar';
import SWMessages from './pages/social-worker/messages';
import SWReferrals from './pages/social-worker/referrals';
import ActiveCases from './pages/social-worker/activeCases';
import ChildCatalog from './pages/social-worker/childCatalog';

// Standalone SW / admin pages (no sidebar)
import DashboardPage from './pages/DashboardPage';
import WorkerHandoverPage from './pages/WorkerHandoverPage';
import WorkerReviewPage from './pages/WorkerReviewPage';
import YouthChatPage from './pages/YouthChatPage';
import ChildCataloguePage from './pages/ChildCataloguePage';
import CreateChildProfilePage from './pages/CreateChildProfilePage';
import YouthCataloguePage from './pages/YouthCataloguePage';
import CreateYouthProfilePage from './pages/CreateYouthProfilePage';

// Child pages
import ChildHome from './pages/child/home';
import CheckIns from './pages/child/checkIns';
import ChildMessages from './pages/child/messages';
import ChildCalendar from './pages/child/calendar';
import Chatbot from './pages/child/chatbot';
import YouthSideChatPage from './pages/YouthSideChatPage';

import './index.css';

// Route guards
const ProtectedSWRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'social_worker') return <Navigate to="/child/home" replace />;
  return <SocialWorkerLayout>{children}</SocialWorkerLayout>;
};

// SW-authenticated routes that don't use the sidebar layout (full-screen pages)
const ProtectedSWStandaloneRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'social_worker') return <Navigate to="/child/home" replace />;
  return <>{children}</>;
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
    <Routes>
      {/* Universal */}
      <Route path="/" element={<MainPage />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'social_worker' ? '/sw/home' : '/child/home'} replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to={user.role === 'social_worker' ? '/sw/home' : '/child/home'} replace /> : <RegisterPage />} />

      {/* Social Worker — with sidebar layout */}
      <Route path="/sw/home"          element={<ProtectedSWRoute><SWHome /></ProtectedSWRoute>} />
      <Route path="/sw/dashboard"     element={<ProtectedSWRoute><SWDashboard /></ProtectedSWRoute>} />
      <Route path="/sw/calendar"      element={<ProtectedSWRoute><SWCalendar /></ProtectedSWRoute>} />
      <Route path="/sw/messages"      element={<ProtectedSWRoute><SWMessages /></ProtectedSWRoute>} />
      <Route path="/sw/referrals"     element={<ProtectedSWRoute><SWReferrals /></ProtectedSWRoute>} />
      <Route path="/sw/active-cases"  element={<ProtectedSWRoute><ActiveCases /></ProtectedSWRoute>} />
      <Route path="/sw/child-catalog" element={<ProtectedSWRoute><ChildCatalog /></ProtectedSWRoute>} />

      {/* Social Worker — standalone full-screen pages (no sidebar) */}
      <Route path="/dashboard"                       element={<ProtectedSWStandaloneRoute><DashboardPage /></ProtectedSWStandaloneRoute>} />
      <Route path="/worker/handover"                 element={<ProtectedSWStandaloneRoute><WorkerHandoverPage /></ProtectedSWStandaloneRoute>} />
      <Route path="/worker/review/:conversationId"   element={<ProtectedSWStandaloneRoute><WorkerReviewPage /></ProtectedSWStandaloneRoute>} />
      <Route path="/chat/:conversationId"            element={<ProtectedSWStandaloneRoute><YouthChatPage /></ProtectedSWStandaloneRoute>} />
      <Route path="/child"                           element={<ProtectedSWStandaloneRoute><ChildCataloguePage /></ProtectedSWStandaloneRoute>} />
      <Route path="/child/create"                    element={<ProtectedSWStandaloneRoute><CreateChildProfilePage /></ProtectedSWStandaloneRoute>} />
      <Route path="/youth"        element={<ProtectedSWRoute><YouthCataloguePage /></ProtectedSWRoute>} />
      <Route path="/youth/create" element={<ProtectedSWRoute><CreateYouthProfilePage /></ProtectedSWRoute>} />

      {/* Child — with ChildLayout sidebar */}
      <Route path="/child/home"                       element={<ProtectedChildRoute><ChildHome /></ProtectedChildRoute>} />
      <Route path="/child/check-ins"                  element={<ProtectedChildRoute><CheckIns /></ProtectedChildRoute>} />
      <Route path="/child/messages"                   element={<ProtectedChildRoute><ChildMessages /></ProtectedChildRoute>} />
      <Route path="/child/calendar"                   element={<ProtectedChildRoute><ChildCalendar /></ProtectedChildRoute>} />
      <Route path="/child/chatbot"                    element={<ProtectedChildRoute><Chatbot /></ProtectedChildRoute>} />
      <Route path="/child/side-chat/:conversationId"  element={<ProtectedChildRoute><YouthSideChatPage /></ProtectedChildRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
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
