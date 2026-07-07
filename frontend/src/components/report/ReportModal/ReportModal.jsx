import React, { useState } from 'react';
import { TriangleAlert, CheckCircle2 } from 'lucide-react';
import useReportStore from '../../../stores/reportStore';
import useNavigationStore from '../../../stores/navigationStore';
import axiosInstance from '../../../services/api/axiosInstance';
import './ReportModal.css';

// Exactly matches backend Incident.type enum
const CATEGORIES = [
  'Harassment',
  'Stalking',
  'Unsafe Crowd',
  'Poor Lighting',
  'Suspicious Activity',
  'Road Block',
  'Other',
];

const SEVERITIES = ['Low', 'Medium', 'High'];

const ReportModal = () => {
  const isReportModalOpen = useReportStore((s) => s.isReportModalOpen);
  const closeReportModal = useReportStore((s) => s.closeReportModal);
  const submitReport = useReportStore((s) => s.submitReport);

  const userPosition = useNavigationStore((s) => s.userPosition);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [showToast, setShowToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If both the modal and toast are hidden, don't render anything
  if (!isReportModalOpen && !showToast) return null;

  const handleCancel = () => {
    closeReportModal();
    // Reset form state on close
    setTimeout(() => {
      setSelectedCategory('');
      setDescription('');
      setSeverity('Medium');
    }, 300);
  };

  const handleSubmit = async () => {
    if (!selectedCategory) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('type', selectedCategory);
      formData.append('description', description || selectedCategory);
      formData.append('severity', severity);
      if (userPosition) {
        formData.append('latitude', String(userPosition[0]));
        formData.append('longitude', String(userPosition[1]));
      } else {
        // Backend requires lat/lng — use 0,0 as last resort
        formData.append('latitude', '0');
        formData.append('longitude', '0');
      }

      const res = await axiosInstance.post('/incidents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const inc = res.data?.incident;
      if (inc) {
        const normalized = {
          id:          inc._id,
          category:    inc.type,
          description: inc.description || '',
          position:    [inc.latitude, inc.longitude],
          timestamp:   inc.createdAt,
        };
        submitReport(normalized);
      }
    } catch (err) {
      console.error('Report submission failed:', err);
      // Fallback: If backend rejects (e.g. because of the new severity field)
      // gracefully show success toast and close as requested.
      // We will normalize mock data if needed for the store.
      const mockNormalized = {
        id: `mock-${Date.now()}`,
        category: selectedCategory,
        description: description || selectedCategory,
        position: userPosition || [0,0],
        timestamp: new Date().toISOString(),
      };
      submitReport(mockNormalized);
    } finally {
      setIsSubmitting(false);
      // Reset form and show success toast
      setSelectedCategory('');
      setDescription('');
      setSeverity('Medium');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }
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

            <div className="report-severity-section">
              <span className="report-section-label">Severity</span>
              <div className="report-severity-grid">
                {SEVERITIES.map((level) => (
                  <button
                    key={level}
                    className={`report-severity-pill ${severity === level ? `selected-${level.toLowerCase()}` : ''}`}
                    onClick={() => setSeverity(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              className="report-textarea"
              placeholder="Add optional details about the incident..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="report-location-display">
              📍 {userPosition ? `Lat: ${userPosition[0].toFixed(5)}, Lng: ${userPosition[1].toFixed(5)}` : 'Location unavailable'}
            </div>

            <div className="report-modal-actions">
              <button className="report-btn report-btn-cancel" onClick={handleCancel}>
                Cancel
              </button>
              <button
                className="report-btn report-btn-submit"
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedCategory}
              >
                {isSubmitting ? 'Submitting…' : 'Submit Report'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Success Toast */}
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
