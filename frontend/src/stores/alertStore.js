import { create } from 'zustand';

const useAlertStore = create((set) => ({
  isAlertModeActive: false,
  isModalVisible: false,

  toggleAlertMode: () => set((state) => ({ isAlertModeActive: !state.isAlertModeActive })),
  setAlertMode: (isActive) => set({ isAlertModeActive: isActive }),
  
  showModal: () => set({ isModalVisible: true }),
  hideModal: () => set({ isModalVisible: false }),
}));

export default useAlertStore;
