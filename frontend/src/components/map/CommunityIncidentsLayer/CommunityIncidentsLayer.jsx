import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { UserX, AlertTriangle, LightbulbOff, MessageSquareWarning, Clock, Eye } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import useReportStore from '../../../stores/reportStore';
import './CommunityIncidentsLayer.css';

// Map categories to Lucide icons
const getCategoryIcon = (category) => {
  switch (category) {
    case 'Harassment':
      return <UserX size={16} />;
    case 'Stalking':
      return <Eye size={16} />;
    case 'Unsafe Area':
      return <AlertTriangle size={16} />;
    case 'Poor Lighting':
      return <LightbulbOff size={16} />;
    default:
      return <MessageSquareWarning size={16} />;
  }
};

const createIncidentIcon = (category) => {
  const iconMarkup = renderToStaticMarkup(getCategoryIcon(category));
  // Replace space with dot for CSS class (e.g. Unsafe Area -> marker-Unsafe.Area)
  const safeClass = category.replace(/\s+/g, '.');
  
  return L.divIcon({
    html: `<div class="incident-point-marker marker-${safeClass}">${iconMarkup}</div>`,
    className: 'custom-incident-icon',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13]
  });
};

const createGroupedIcon = (count) => {
  const iconMarkup = renderToStaticMarkup(<MessageSquareWarning size={16} />);
  return L.divIcon({
    html: `
      <div class="incident-point-marker marker-Grouped">
        ${iconMarkup}
        <div class="incident-group-badge">${count}</div>
      </div>
    `,
    className: 'custom-incident-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

const formatTime = (isoString) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const CommunityIncidentsLayer = () => {
  const reports = useReportStore((s) => s.reports);

  const groupedReports = useMemo(() => {
    const groups = [];
    reports.forEach(report => {
      // Group reports that are essentially at the exact same location (< 0.0001 deg is ~11 meters)
      const existingGroup = groups.find(g => {
        const dLat = Math.abs(g.lat - report.position[0]);
        const dLng = Math.abs(g.lng - report.position[1]);
        return dLat < 0.0001 && dLng < 0.0001;
      });

      if (existingGroup) {
        existingGroup.reports.push(report);
      } else {
        groups.push({
          id: report.id,
          lat: report.position[0],
          lng: report.position[1],
          reports: [report]
        });
      }
    });
    return groups;
  }, [reports]);

  if (!groupedReports || groupedReports.length === 0) return null;

  return (
    <>
      {groupedReports.map((group) => {
        const isGrouped = group.reports.length > 1;

        return (
          <Marker
            key={group.id}
            position={[group.lat, group.lng]}
            icon={isGrouped ? createGroupedIcon(group.reports.length) : createIncidentIcon(group.reports[0].category)}
          >
            <Popup 
              className="incident-popup"
              autoPanPadding={[50, 50]}
              closeButton={true}
            >
              <div className={`incident-popup-content ${isGrouped ? 'grouped-popup-content' : ''}`}>
                <span className="incident-popup-label">
                  {isGrouped ? 'Multiple Reports' : 'Community Report'}
                </span>
                
                {isGrouped ? (
                  // Grouped Popup Render
                  <div className="grouped-reports-list">
                    {group.reports.map((report, idx) => (
                      <React.Fragment key={report.id}>
                        <div className="grouped-report-item">
                          <div className="grouped-report-header">
                            <h3>{report.category}</h3>
                            <p className="incident-time">
                              <Clock size={12} />
                              {formatTime(report.timestamp)}
                            </p>
                          </div>
                          {report.description && (
                            <p className="incident-desc">{report.description}</p>
                          )}
                        </div>
                        {idx < group.reports.length - 1 && <div className="grouped-divider" />}
                      </React.Fragment>
                    ))}
                  </div>
                ) : (
                  // Single Popup Render
                  <>
                    <h3>{group.reports[0].category}</h3>
                    {group.reports[0].description && (
                      <p className="incident-desc">{group.reports[0].description}</p>
                    )}
                    <p className="incident-time">
                      <Clock size={12} />
                      {formatTime(group.reports[0].timestamp)}
                    </p>
                  </>
                )}

              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default CommunityIncidentsLayer;
