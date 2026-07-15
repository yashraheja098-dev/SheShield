import React from 'react';
import { Users } from 'lucide-react';
import useContactStore from '../../../stores/contactStore';
import './EmergencyContactsButton.css';

const EmergencyContactsButton = () => {
  const setModalOpen = useContactStore((s) => s.setModalOpen);

  return (
    <button
      className="emergency-contacts-btn anim-scale-in"
      onClick={() => setModalOpen(true)}
      aria-label="Manage Emergency Contacts"
      title="Emergency Contacts"
    >
      <Users size={24} />
    </button>
  );
};

export default EmergencyContactsButton;
