/*import { BrowserRouter, Route, Routes } from "react-router-dom";
import ChildProfilePage from "./pages/ChildProfilePage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import RecordingPage from "./pages/RecordingPage";
import "./styles/app.css";
*/
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
