import React from 'react';
import { TriangleAlert } from 'lucide-react';
import useReportStore from '../../../stores/reportStore';
import './ReportButton.css';

const ReportButton = () => {
  const openReportModal = useReportStore((s) => s.openReportModal);

  return (
    <button 
      className="report-incident-btn" 
      onClick={openReportModal}
      aria-label="Report Incident"
      title="Report a safety incident"
    >
      <div className="report-icon-container">
        <TriangleAlert size={20} strokeWidth={2.5} />
      </div>
      <span className="report-label">Report Incident</span>
    </button>
  );
};

export default ReportButton;
