/**
 * SafePointSuggestions — Smart safe point recommendations during navigation.
 *
 * When an active route is available, ranks safe points by proximity to the
 * route corridor (using rankSafePointsForRoute). Falls back to user-position
 * ranking when no route is active or no corridor points exist.
 *
 * NO external API calls. NO new store state.
 */
import React, { useMemo, useCallback } from 'react';
import { ShieldCheck, Siren, Pill, Hotel, Building2, MapPin } from 'lucide-react';
import useSafetyStore from '../../../stores/safetyStore';
import useNavigationStore from '../../../stores/navigationStore';
import useRouteStore from '../../../stores/routeStore';
import useAlertStore from '../../../stores/alertStore';
import useMapStore from '../../../stores/mapStore';
import { rankSafePointsForRoute } from '../../../utils/safePointRanking';
import './SafePointSuggestions.css';

/* ── Display helpers ── */
export const SAFE_POINT_LABELS = {
  police:      'Police Station',
  womens_desk: "Women's Help Desk",
  hospital:    'Hospital',
  pharmacy:    'Pharmacy',
  hotel:       'Hotel',
  petrol_pump: 'Petrol Pump',
  metro:       'Metro Station',
  railway:     'Railway Station',
  bus_stand:   'Bus Stand',
};

export const SAFE_POINT_EMOJIS = {
  police:      '🚔',
  womens_desk: '👩',
  hospital:    '🏥',
  pharmacy:    '💊',
  hotel:       '🏨',
  petrol_pump: '⛽',
  metro:       '🚇',
  railway:     '🚂',
  bus_stand:   '🚌',
};

const SafePointIcon = ({ type }) => {
  switch (type) {
    case 'police':
    case 'womens_desk':
      return <Siren size={16} />;
    case 'hospital':
    case 'pharmacy':
      return <Pill size={16} />;
    case 'hotel':
      return <Hotel size={16} />;
    default:
      return <Building2 size={16} />;
  }
};

const formatMeters = (m) => {
  if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
  return `${Math.round(m)} m`;
};

const SafePointSuggestions = ({ maxItems = 3, onViewOnMap }) => {
  const safePoints    = useSafetyStore((s) => s.safePoints);
  const userPosition  = useNavigationStore((s) => s.userPosition);
  const routes        = useRouteStore((s) => s.routes);
  const activeIdx     = useRouteStore((s) => s.activeRouteIndex);
  const flyTo         = useMapStore((s) => s.flyTo);
  const hideModal     = useAlertStore((s) => s.hideModal);

  // Resolve the active route geometry (null-safe)
  const routeGeometry = useMemo(() => {
    const route = routes?.[activeIdx];
    return route?.geometry ?? null;
  }, [routes, activeIdx]);

  /* Route-aware ranking via shared utility */
  const suggestions = useMemo(
    () => rankSafePointsForRoute(safePoints, routeGeometry, userPosition, maxItems),
    [safePoints, routeGeometry, userPosition, maxItems]
  );

  const handleViewOnMap = useCallback(
    (point) => {
      hideModal();
      flyTo([point.lat, point.lng], 16);
      if (onViewOnMap) onViewOnMap(point);
    },
    [flyTo, hideModal, onViewOnMap]
  );

  if (!userPosition || suggestions.length === 0) return null;

  return (
    <div className="spsugg-container">
      <div className="spsugg-header">
        <ShieldCheck size={14} className="spsugg-header-icon" />
        <span className="spsugg-header-label">Nearest Safe Points</span>
      </div>

      <div className="spsugg-list">
        {suggestions.map((point) => {
          // Show route distance when in-corridor, user distance as fallback
          const displayDist = point.inCorridor
            ? point.distToRoute
            : point.distToUser;

          return (
            <div key={point.id} className={`spsugg-item priority-${point.priorityTier}`}>
              <div className="spsugg-item-icon">
                <SafePointIcon type={point.type} />
              </div>

              <div className="spsugg-item-info">
                <span className="spsugg-item-name">{point.name}</span>
                <span className="spsugg-item-meta">
                  {SAFE_POINT_EMOJIS[point.type] || '📍'}{' '}
                  {SAFE_POINT_LABELS[point.type] || point.type}
                  {' · '}
                  {formatMeters(displayDist)}
                  {point.inCorridor ? ' from route' : ' away'}
                </span>
                {point.isOpen24h && (
                  <span className="spsugg-item-open">Open 24h</span>
                )}
              </div>

              <button
                className="spsugg-view-btn"
                onClick={() => handleViewOnMap(point)}
                aria-label={`View ${point.name} on map`}
              >
                <MapPin size={13} />
                <span>View</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SafePointSuggestions;
