import React, { useMemo, useState } from 'react';
import { UserX, AlertTriangle, LightbulbOff, MessageSquareWarning, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import useReportStore from '../../../stores/reportStore';
import './LiveReportsFeed.css';

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

const LiveReportsFeed = () => {
  const reports = useReportStore((s) => s.reports);

  // Sort by timestamp descending (newest first) and limit to top 3
  const recentReports = useMemo(() => {
    if (!reports) return [];
    return [...reports]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 3);
  }, [reports]);

  const [isExpanded, setIsExpanded] = useState(false);

  // If no reports exist, render nothing as requested by user
  if (recentReports.length === 0) {
    return null;
  }

  return (
    <div className="live-reports-feed">
      <div 
        className="live-reports-header" 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ marginBottom: isExpanded ? 'var(--sp-2)' : '0' }}
      >
        <div className="live-reports-title">
          <div className="live-reports-dot" />
          Live Community Reports
        </div>
        <div className="live-reports-header-right">
          <span className="live-reports-count">{recentReports.length} new</span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="live-reports-list">
          {recentReports.map((report, index) => {
        const safeClass = report.category.replace(/\s+/g, '.');
        
        return (
          <React.Fragment key={report.id}>
            <div className="live-report-item">
              <div className={`live-report-icon type-${safeClass}`}>
                {getCategoryIcon(report.category)}
              </div>
              
              <div className="live-report-content">
                <div className="live-report-top">
                  <h4 className="live-report-category">{report.category}</h4>
                  <span className="live-report-time">{formatTime(report.timestamp)}</span>
                </div>
                {report.description && (
                  <p className="live-report-desc">{report.description}</p>
                )}
              </div>
            </div>
            
              {index < recentReports.length - 1 && <div className="live-report-divider" />}
            </React.Fragment>
          );
        })}
      </div>
      )}
    </div>
  );
};

export default LiveReportsFeed;
