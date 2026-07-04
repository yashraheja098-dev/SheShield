import React, { useState } from 'react';
import { TriangleAlert, CheckCircle2 } from 'lucide-react';
import useReportStore from '../../../stores/reportStore';
import useNavigationStore from '../../../stores/navigationStore';
import './ReportModal.css';

const CATEGORIES = [
  'Harassment',
  'Stalking',
  'Unsafe Area',
  'Poor Lighting',
  'Other'
];

const ReportModal = () => {
  const isReportModalOpen = useReportStore((s) => s.isReportModalOpen);
  const closeReportModal = useReportStore((s) => s.closeReportModal);
  const submitReport = useReportStore((s) => s.submitReport);
  
  const userPosition = useNavigationStore((s) => s.userPosition);
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [showToast, setShowToast] = useState(false);

  // If both the modal and toast are hidden, don't render anything
  if (!isReportModalOpen && !showToast) return null;

  const handleCancel = () => {
    closeReportModal();
    // Reset form state on close
    setTimeout(() => {
      setSelectedCategory('');
      setDescription('');
    }, 300);
  };

  const handleSubmit = () => {
    const payload = {
      id: Date.now().toString(),
      category: selectedCategory,
      description,
      position: userPosition || null,
      timestamp: new Date().toISOString()
    };
    
    submitReport(payload);
    
    // Reset form state
    setSelectedCategory('');
    setDescription('');
    
    // Show success toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  return (
    <>
      {isReportModalOpen && (
        <div className="report-modal-overlay">
          <div className="report-modal-card">
            
            <div className="report-modal-header">
              <div className="report-modal-icon">
                <TriangleAlert size={28} strokeWidth={2.5} />
              </div>
              <h2 className="report-modal-title">Report Incident</h2>
              <p className="report-modal-subtitle">Help keep the community safe.</p>
            </div>

            <div className="report-categories-grid">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`report-category-pill ${selectedCategory === cat ? 'selected' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <textarea
              className="report-textarea"
              placeholder={
                selectedCategory === 'Other' 
                  ? "Please describe the incident (Required)" 
                  : "Add optional details about the incident..."
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="report-modal-actions">
              <button className="report-btn report-btn-cancel" onClick={handleCancel}>
                Cancel
              </button>
              <button 
                className="report-btn report-btn-submit" 
                onClick={handleSubmit}
                disabled={
                  !selectedCategory || 
                  (selectedCategory === 'Other' && !description.trim())
                }
              >
                Submit Report
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Simulated Success Toast */}
      {showToast && (
        <div className="report-toast">
          <CheckCircle2 size={18} />
          Incident reported securely. Thank you for keeping the community safe.
        </div>
      )}
    </>
  );
};

export default ReportModal;
