import { create } from 'zustand';

const useReportStore = create((set) => ({
  isReportModalOpen: false,
  reports: [],

  openReportModal: () => set({ isReportModalOpen: true }),
  closeReportModal: () => set({ isReportModalOpen: false }),

  submitReport: (payload) => set((state) => ({
    reports: [...state.reports, payload],
    isReportModalOpen: false
  })),

  // Batch-load normalized incidents from backend (replaces any existing reports)
  setReports: (reports) => set({ reports }),
}));

export default useReportStore;
