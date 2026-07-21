/**
 * BottomNavBar — Persistent 5-tab bottom navigation.
 * Matches the existing SheShield dark glassmorphism design language.
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Map, Shield, DoorOpen, User } from 'lucide-react';
import './BottomNavBar.css';

const TABS = [
  { to: '/app/home',       icon: Home,       label: 'Home' },
  { to: '/app/navigation', icon: Map,        label: 'Navigation' },
  { to: '/app/safety',     icon: Shield,     label: 'Safety Hub' },
  { to: '/app/community',  icon: DoorOpen,   label: 'Safety Rooms' },
  { to: '/app/profile',    icon: User,       label: 'Profile' },
];

const BottomNavBar = () => (
  <nav className="bottom-nav" aria-label="Main navigation">
    {TABS.map(({ to, icon: Icon, label }) => (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) =>
          `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`
        }
        aria-label={label}
      >
        <Icon className="bottom-nav__icon" aria-hidden="true" />
        <span className="bottom-nav__label">{label}</span>
        <span className="bottom-nav__indicator" aria-hidden="true" />
      </NavLink>
    ))}
  </nav>
);

export default BottomNavBar;
