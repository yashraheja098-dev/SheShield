/**
 * HomePage — SheShield Home Dashboard
 *
 * A polished mobile-first safety dashboard.
 * Uses only existing design tokens & stores — no new backend logic.
 */
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Shield, Navigation, AlertTriangle,
  Phone, ShieldCheck, Lightbulb, ChevronRight,
  Building2, Cross, Users, Flame, Clock, TriangleAlert
} from 'lucide-react';
import useUserStore       from '../stores/userStore';
import useNavigationStore from '../stores/navigationStore';
import useContactStore    from '../stores/contactStore';
import useSosStore        from '../stores/sosStore';
import './HomePage.css';

/* ═══════════════════════════════════════
   Helpers
   ═══════════════════════════════════════ */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

/* ═══════════════════════════════════════
   Static dummy data (no backend calls)
   ═══════════════════════════════════════ */
const NEARBY_PLACES = [
  { id: 1, icon: Building2, label: 'Police Station', distance: '0.4 km', color: '#42a5f5' },
  { id: 2, icon: Cross,     label: 'Hospital',       distance: '0.8 km', color: '#ef5350' },
  { id: 3, icon: Shield,    label: "Women's Help",   distance: '1.2 km', color: '#ec407a' },
  { id: 4, icon: Flame,     label: 'Fire Station',   distance: '1.6 km', color: '#ffa726' },
];

const COMMUNITY_ALERTS = [
  {
    id: 1,
    icon: Lightbulb,
    type: 'Poor Lighting',
    location: 'Sector 44',
    time: '12 min ago',
    severity: 'caution',
  },
  {
    id: 2,
    icon: TriangleAlert,
    type: 'Suspicious Activity',
    location: 'Nearby Area',
    time: '38 min ago',
    severity: 'danger',
  },
  {
    id: 3,
    icon: Users,
    type: 'Safe Crowd Reported',
    location: 'DLF Cyber City',
    time: '1 hr ago',
    severity: 'safe',
  },
];

const SAFETY_TIP = 'Always share your live location with a trusted contact during night travel.';

/* ═══════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════ */

/** Section header shared across all sections */
const SectionHeader = ({ title, action, onAction }) => (
  <div className="hd-section-header">
    <h2 className="hd-section-title">{title}</h2>
    {action && (
      <button className="hd-section-link" onClick={onAction}>
        {action} <ChevronRight size={14} />
      </button>
    )}
  </div>
);

/** Top greeting header */
const DashboardHeader = ({ userName, userPosition }) => (
  <header className="hd-header anim-slide-down">
    <div className="hd-header-text">
      <p className="hd-greeting">{getGreeting()}</p>
      <h1 className="hd-user-name">{userName || 'Stay Safe'} <span className="hd-wave">👋</span></h1>
    </div>
    <div className="hd-location-pill">
      <span
        className="hd-location-pulse"
        style={{ background: userPosition ? 'var(--color-safe)' : 'var(--color-text-muted)' }}
      />
      <MapPin size={12} className="hd-location-icon" />
      <span className="hd-location-text">
        {userPosition ? 'Location Active' : 'Locating…'}
      </span>
    </div>
  </header>
);

/** Safety Score card — hero card */
const SafetyScoreCard = () => (
  <div className="hd-score-card anim-scale-in-spring">
    {/* Decorative background glows — absolute, not in grid flow */}
    <div className="hd-score-glow hd-score-glow--pink" aria-hidden="true" />
    <div className="hd-score-glow hd-score-glow--green" aria-hidden="true" />

    {/* Grid content wrapper — keeps glows out of column calculation */}
    <div className="hd-score-content">

      {/* Left — Shield icon */}
      <div className="hd-score-shield-col">
        <div className="hd-score-shield-ring">
          <div className="hd-score-shield-inner">
            <Shield className="hd-score-shield-icon" />
          </div>
        </div>
      </div>

      {/* Center — labels */}
      <div className="hd-score-middle">
        <span className="hd-score-eyebrow">Safety Status</span>
        <p className="hd-score-status">Generally Safe</p>
        <p className="hd-score-desc">
          Based on nearby reports &amp; safe locations.
        </p>
      </div>

      {/* Right — score number */}
      <div className="hd-score-right">
        <div className="hd-score-number-wrap">
          <span className="hd-score-number">94</span>
          <span className="hd-score-denom">/100</span>
        </div>
      </div>

    </div>
  </div>
);

/** Quick action buttons */
const QuickActions = ({ onNavigate, onSOS }) => (
  <div className="hd-quick-actions anim-fade-in">
    <button
      id="hd-btn-navigation"
      className="hd-action-btn hd-action-btn--primary"
      onClick={onNavigate}
    >
      <div className="hd-action-icon-wrap hd-action-icon-wrap--primary">
        <Navigation size={20} />
      </div>
      <span className="hd-action-btn-text">
        <strong>Start Navigation</strong>
        <small>Plan your safest route</small>
      </span>
    </button>

    <button
      id="hd-btn-sos"
      className="hd-action-btn hd-action-btn--danger"
      onClick={onSOS}
    >
      <div className="hd-action-icon-wrap hd-action-icon-wrap--danger">
        <AlertTriangle size={20} />
      </div>
      <span className="hd-action-btn-text">
        <strong>Emergency SOS</strong>
        <small>Alert your contacts</small>
      </span>
    </button>
  </div>
);

/** Nearby safe places horizontal scroll */
const NearbyPlaces = () => (
  <section className="hd-section">
    <SectionHeader title="Nearby Safe Places" />
    <div className="hd-places-scroll">
      {NEARBY_PLACES.map(({ id, icon: Icon, label, distance, color }) => (
        <div key={id} className="hd-place-card">
          <div className="hd-place-icon-wrap" style={{ '--place-color': color }}>
            <Icon size={20} />
          </div>
          <p className="hd-place-label">{label}</p>
          <p className="hd-place-dist">{distance}</p>
        </div>
      ))}
    </div>
  </section>
);

/** Community alerts preview */
const CommunityAlerts = ({ onViewCommunity }) => (
  <section className="hd-section">
    <SectionHeader title="Community Alerts" action="View All" onAction={onViewCommunity} />
    <div className="hd-alerts-list">
      {COMMUNITY_ALERTS.map(({ id, icon: Icon, type, location, time, severity }) => (
        <div key={id} className={`hd-alert-card hd-alert-card--${severity}`}>
          <div className={`hd-alert-icon-wrap hd-alert-icon--${severity}`}>
            <Icon size={17} />
          </div>
          <div className="hd-alert-body">
            <p className="hd-alert-type">{type}</p>
            <p className="hd-alert-location">
              <MapPin size={10} /> {location}
            </p>
          </div>
          <span className="hd-alert-time">
            <Clock size={10} /> {time}
          </span>
        </div>
      ))}
    </div>
  </section>
);

/** Emergency contacts mini card */
const EmergencyContactsCard = ({ contactCount, onManage }) => (
  <div className="hd-contacts-card anim-fade-in">
    <div className="hd-contacts-left">
      <div className="hd-contacts-icon-wrap">
        <Phone size={19} />
      </div>
      <div>
        <p className="hd-contacts-title">Emergency Contacts</p>
        <p className="hd-contacts-sub">
          {contactCount > 0
            ? `${contactCount} trusted contact${contactCount !== 1 ? 's' : ''} added`
            : 'No contacts added yet'}
        </p>
      </div>
    </div>
    <button className="hd-contacts-manage-btn" onClick={onManage}>
      Manage
    </button>
  </div>
);

/** Safety tip footer card */
const SafetyTipCard = () => (
  <div className="hd-tip-card anim-fade-in">
    <div className="hd-tip-icon-wrap">
      <ShieldCheck size={17} />
    </div>
    <p className="hd-tip-text">
      <strong>Safety Tip: </strong>{SAFETY_TIP}
    </p>
  </div>
);

/* ═══════════════════════════════════════
   Main Page
   ═══════════════════════════════════════ */
const HomePage = () => {
  const navigate       = useNavigate();
  const profile        = useUserStore((s) => s.profile);
  const userPosition   = useNavigationStore((s) => s.userPosition);
  const contacts       = useContactStore((s) => s.contacts);
  const beginCountdown = useSosStore((s) => s.beginCountdown);

  const userName = useMemo(
    () => profile?.name || profile?.email?.split('@')[0] || null,
    [profile]
  );

  const handleNavigate      = () => navigate('/app/navigation');
  const handleSOS           = () => { navigate('/app/navigation'); setTimeout(() => beginCountdown(), 100); };
  const handleViewCommunity = () => navigate('/app/community');
  const handleManageContacts = () => navigate('/app/profile');

  return (
    <div className="hd-page">
      <div className="hd-scroll-container">

        {/* 1. Header */}
        <DashboardHeader userName={userName} userPosition={userPosition} />

        {/* 2. Safety Score Hero */}
        <SafetyScoreCard />

        {/* 3. Quick Actions */}
        <QuickActions onNavigate={handleNavigate} onSOS={handleSOS} />

        {/* 4. Nearby Places */}
        <NearbyPlaces />

        {/* 5. Community Alerts */}
        <CommunityAlerts onViewCommunity={handleViewCommunity} />

        {/* 6. Emergency Contacts */}
        <section className="hd-section">
          <EmergencyContactsCard
            contactCount={contacts.length}
            onManage={handleManageContacts}
          />
        </section>

        {/* 7. Safety Tip */}
        <section className="hd-section hd-section--last">
          <SafetyTipCard />
        </section>

      </div>
    </div>
  );
};

export default HomePage;
