import React, { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
<<<<<<< HEAD
  HomeIcon, CalendarIcon, ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon, BookOpenIcon,
=======
  HomeIcon,
  ChartBarIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ArrowsRightLeftIcon,
  ClipboardDocumentListIcon,
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const navItems = [
<<<<<<< HEAD
  { to: '/sw/home',          label: 'Home',          icon: HomeIcon },
  { to: '/sw/calendar',      label: 'Calendar',      icon: CalendarIcon },
  { to: '/sw/messages',      label: 'Messages',      icon: ChatBubbleLeftRightIcon },
  { to: '/sw/active-cases',  label: 'Active Cases',  icon: ClipboardDocumentListIcon },
  { to: '/sw/child-catalog', label: 'Child Catalog', icon: BookOpenIcon },
=======
  { to: '/sw/home', label: 'Home', icon: HomeIcon },
  { to: '/sw/dashboard', label: 'Dashboard', icon: ChartBarIcon },
  { to: '/sw/calendar', label: 'Calendar', icon: CalendarIcon },
  { to: '/sw/messages', label: 'Messages', icon: ChatBubbleLeftRightIcon },
  { to: '/sw/referrals', label: 'Referrals', icon: ArrowsRightLeftIcon },
  { to: '/sw/active-cases', label: 'Active Cases', icon: ClipboardDocumentListIcon },
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
];

export const SocialWorkerLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
<<<<<<< HEAD
  const handleLogout = () => { logout(); navigate('/'); };
=======

  const handleLogout = () => {
    logout();
    navigate('/');
  };
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)

  return (
    <div className="sw-layout">
      <aside className="sw-sidebar">
        <div className="sidebar-brand">
<<<<<<< HEAD
          <span className="brand-name">Regrove</span>
        </div>
=======
          <span className="brand-leaf">🌿</span>
          <span className="brand-name">Regrove</span>
        </div>

>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
        <div className="sidebar-user">
          <div className="user-avatar">{user?.fullName?.[0] ?? 'S'}</div>
          <div className="user-info">
            <p className="user-name">{user?.fullName}</p>
            <p className="user-role">Social Worker</p>
          </div>
        </div>
<<<<<<< HEAD
        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}>
=======

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}
            >
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
              <Icon className="nav-icon" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
<<<<<<< HEAD
=======

>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
        <button className="sidebar-logout" onClick={handleLogout}>
          <ArrowRightOnRectangleIcon className="nav-icon" />
          <span>Log out</span>
        </button>
      </aside>
<<<<<<< HEAD
      <main className="sw-main">{children}</main>
    </div>
  );
};
=======

      <main className="sw-main">{children}</main>
    </div>
  );
};
>>>>>>> 5d704a3 (imported new frontend code and started rebuilding new backend routes)
