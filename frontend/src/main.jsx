/**
 * main.jsx — Application bootstrap.
 *
 * Important: Leaflet's default marker icons break with Vite's asset
 * bundling. The fix below must run before any Leaflet map renders.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

/* ── Leaflet CSS (must come before our styles) ── */
import 'leaflet/dist/leaflet.css';

/* ── Leaflet default marker icon fix for Vite ── */
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon   from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl:       markerIcon,
  shadowUrl:     markerShadow,
});

/* ── Global Styles (design system) ── */
import './styles/index.css';

/* ── App ── */
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
