/**
 * UserLocationPin — Animated current-location marker.
 *
 * Uses a Leaflet DivIcon so we can apply CSS animations.
 * The CSS for the inner elements lives in src/styles/index.css
 * because Leaflet renders DivIcons outside React's tree.
 */
import { useMemo } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';

const createLocationIcon = () =>
  L.divIcon({
    className: 'user-location-icon',
    html: `
      <div class="user-location-wrapper">
        <div class="user-location-ripple"></div>
        <div class="user-location-ripple"></div>
        <div class="user-location-dot"></div>
      </div>
    `,
    iconSize:   [40, 40],
    iconAnchor: [20, 20],
    popupAnchor:[0, -20],
  });

const UserLocationPin = ({ position }) => {
  // useMemo: icon object is stable — only created once
  const icon = useMemo(() => createLocationIcon(), []);

  if (!position) return null;

  return (
    <Marker
      position={position}
      icon={icon}
      zIndexOffset={500}
      interactive={false}  /* tap/click passes through to map */
    />
  );
};

export default UserLocationPin;
