/**
 * AppShell — Application layout wrapper.
 *
 * Renders the active page via <Outlet /> and keeps
 * the BottomNavBar persistent across all routes.
 *
 * This component is intentionally thin — no business logic.
 */
import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavBar from '../BottomNavBar/BottomNavBar';
import './AppShell.css';

const AppShell = () => (
  <div className="app-shell">
    <main className="app-shell__content">
      <Outlet />
    </main>
    <BottomNavBar />
  </div>
);

export default AppShell;
