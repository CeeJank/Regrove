import React, { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon,
  FaceSmileIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  SparklesIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { to: '/child/home', label: 'Home', icon: HomeIcon },
  { to: '/child/check-ins', label: 'Check-In', icon: FaceSmileIcon },
  { to: '/child/messages', label: 'Messages', icon: ChatBubbleLeftRightIcon },
  { to: '/child/calendar', label: 'Calendar', icon: CalendarIcon },
  { to: '/child/chatbot', label: 'My Companion', icon: SparklesIcon },
];

export const ChildLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="child-layout">
      <aside className="child-sidebar">
        <div className="sidebar-brand">
          <span className="brand-leaf">🌿</span>
          <span className="brand-name">Regrove</span>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar child-avatar">{user?.fullName?.[0] ?? 'Y'}</div>
          <div className="user-info">
            <p className="user-name">{user?.fullName}</p>
            <p className="user-role child-role">Youth</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item${isActive ? ' nav-item--active child-active' : ''}`}
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

      <main className="child-main">{children}</main>
    </div>
  );
};