import { create } from 'zustand';

const useAlertStore = create((set) => ({
  isAlertModeActive: false,
  isModalVisible: false,
  isCooldownActive: false,

  toggleAlertMode: () => set((state) => ({ isAlertModeActive: !state.isAlertModeActive })),
  setAlertMode: (isActive) => set({ isAlertModeActive: isActive }),
  
  showModal: () => set({ isModalVisible: true }),
  hideModal: () => set({ isModalVisible: false }),
  
  acknowledgeSafe: () => set({ isModalVisible: false, isCooldownActive: true }),
  clearCooldown: () => set({ isCooldownActive: false }),
}));

export default useAlertStore;
