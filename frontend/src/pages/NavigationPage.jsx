/**
 * NavigationPage — Thin wrapper that renders the existing MapShell.
 * This is the full navigation experience exactly as it exists today.
 * Do NOT add logic here — everything lives in MapShell.
 */
import React from 'react';
import MapShell from '../components/layout/MapShell/MapShell';

const NavigationPage = () => <MapShell />;

export default NavigationPage;
