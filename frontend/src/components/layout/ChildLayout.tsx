import React, { ReactNode, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  HomeIcon, FaceSmileIcon, ChatBubbleLeftRightIcon,
  CalendarIcon, SparklesIcon, ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

/** Returns true between 18:00 and 06:59 Singapore Time (UTC+8) */
const isAfterHours = () => {
  const sgHour = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore' })).getHours();
  return sgHour >= 18 || sgHour < 7;
};

export const ChildLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };

  // Re-evaluate every minute so the nav updates automatically at the boundary
  const [afterHours, setAfterHours] = useState(isAfterHours());
  useEffect(() => {
    const id = setInterval(() => setAfterHours(isAfterHours()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Fixed nav items (always visible)
  const fixedItems = [
    { to: '/child/home',      label: 'Home',       icon: HomeIcon },
    { to: '/child/check-ins', label: 'Check-In',   icon: FaceSmileIcon },
    { to: '/child/calendar',  label: 'Calendar',   icon: CalendarIcon },
  ];

  // Time-gated item: Messages during the day, Companion at night
  const timedItem = afterHours
    ? { to: '/child/chatbot',   label: 'My Companion', icon: SparklesIcon }
    : { to: '/child/messages',  label: 'Messages',     icon: ChatBubbleLeftRightIcon };

  const navItems = [...fixedItems, timedItem];

  return (
    <div className="child-layout">
      <aside className="child-sidebar">
        <div className="sidebar-brand">
          <span className="brand-name">Regrove</span>
        </div>
        <div className="sidebar-user">
          <div className="user-avatar child-avatar">{user?.fullName?.[0] ?? 'Y'}</div>
          <div className="user-info">
            <p className="user-name">{user?.fullName}</p>
            <p className="user-role child-role">Child</p>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item${isActive ? ' nav-item--active child-active' : ''}`}>
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
