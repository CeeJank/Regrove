import React, { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  ChartBarIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { to: '/sw/home',         label: 'Home',         icon: HomeIcon },
  { to: '/sw/calendar',     label: 'Calendar',     icon: CalendarIcon },
  { to: '/sw/messages',     label: 'Messages',     icon: ChatBubbleLeftRightIcon },
  { to: '/sw/active-cases', label: 'Active Cases', icon: ClipboardDocumentListIcon },
  { to: '/sw/child-catalog', label: 'Youth',        icon: UsersIcon },
];

export const SocialWorkerLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="sw-layout">
      <aside className="sw-sidebar">
        <div className="sidebar-brand">
          <span className="brand-leaf">🌿</span>
          <span className="brand-name">Regrove</span>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">{user?.fullName?.[0] ?? 'S'}</div>
          <div className="user-info">
            <p className="user-name">{user?.fullName}</p>
            <p className="user-role">Social Worker</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}
            >
              <Icon className="nav-icon" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          <ArrowRightOnRectangleIcon className="nav-icon" />
          <span>Log out</span>
        </button>
      </aside>

      <main className="sw-main">{children}</main>
    </div>
  );
};
