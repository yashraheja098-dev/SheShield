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
}));

export default useReportStore;
