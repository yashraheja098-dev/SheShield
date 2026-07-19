/**
 * PlaceholderPage — Reusable placeholder for upcoming pages.
 * Displays the page title and a "coming soon" message.
 * Replace this component with real content in future phases.
 */
import React from 'react';
import './PlaceholderPage.css';

const PlaceholderPage = ({ icon: Icon, title, iconColor }) => (
  <div className="placeholder-page">
    <div className="placeholder-page__card">
      <div
        className="placeholder-page__icon-wrap"
        style={{ '--icon-color': iconColor || 'var(--color-primary)' }}
      >
        <Icon size={40} aria-hidden="true" />
      </div>
      <h1 className="placeholder-page__title">{title}</h1>
      <p className="placeholder-page__subtitle">
        Coming in the next development phase.
      </p>
    </div>
  </div>
);

export default PlaceholderPage;
