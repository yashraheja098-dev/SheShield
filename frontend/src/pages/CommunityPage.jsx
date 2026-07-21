/**
 * SafetyRoomsPage — route-based travel community for safer commuting.
 * Replaces the old Community / incident-reports page.
 * Uses local state + mock data only (no backend changes).
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  Users, Plus, MapPin, ArrowRight, Clock,
  Shield, ShieldCheck, Send, ChevronLeft,
  Radio, Navigation, AlertTriangle, CheckCircle2,
  Star, Lock, Globe, UserCheck, MessageCircle,
  UserPlus, X, Zap, Search
} from 'lucide-react';
import './CommunityPage.css';

/* ══════════════════════════════════════════════
   MOCK DATA
   ══════════════════════════════════════════════ */
const SEED_ROOMS = [
  {
    id: 'r1',
    from: 'Sarojini Nagar',
    to: 'Delhi Railway Station',
    creator: 'Priya S.',
    frequency: 'Daily',
    timing: '8:30 AM',
    members: 24,
    reason: 'I travel this route daily for work and want to connect with others for safer commuting together.',
    privacy: 'women_only',
    safetyScore: 92,
    verified: true,
    color: '#E91E8C',
    messages: [
      { id: 'm1', author: 'Priya S.',  text: 'Good morning! Anyone heading out at 8:30?',              time: '8:12 AM', self: false },
      { id: 'm2', author: 'Ananya K.', text: "Yes! I'll be at Gate 2 by 8:25.",                        time: '8:14 AM', self: false },
      { id: 'm3', author: 'Neha R.',   text: "Same. Let's wait for each other near the auto stand.",   time: '8:16 AM', self: false },
      { id: 'm4', author: 'You',       text: "Perfect, I'll join at the auto stand 👍",                 time: '8:18 AM', self: true  },
    ],
    travelling: [
      { name: 'Priya S.',  time: '8:20 AM' },
      { name: 'Ananya K.', time: '8:30 AM' },
      { name: 'Neha R.',   time: '8:35 AM' },
    ],
  },
  {
    id: 'r2',
    from: 'Lajpat Nagar',
    to: 'Connaught Place',
    creator: 'Meena T.',
    frequency: 'Weekdays',
    timing: '9:00 AM',
    members: 11,
    reason: 'Metro line is often crowded and sometimes feels unsafe. Looking for travel companions.',
    privacy: 'everyone',
    safetyScore: 88,
    verified: true,
    color: '#7C4DFF',
    messages: [
      { id: 'm1', author: 'Meena T.',  text: 'Anyone taking the blue line metro today?',  time: '8:55 AM', self: false },
      { id: 'm2', author: 'Divya P.',  text: 'Yes! See you at the platform.',              time: '8:57 AM', self: false },
    ],
    travelling: [
      { name: 'Meena T.',  time: '9:00 AM' },
      { name: 'Divya P.',  time: '9:10 AM' },
    ],
  },
  {
    id: 'r3',
    from: 'Sector 44',
    to: 'Huda City Centre',
    creator: 'Rina M.',
    frequency: 'Daily',
    timing: '7:45 AM',
    members: 8,
    reason: 'The stretch near the underpass can feel isolated early in the morning. Safety in numbers!',
    privacy: 'verified_only',
    safetyScore: 79,
    verified: false,
    color: '#00BCD4',
    messages: [
      { id: 'm1', author: 'Rina M.',  text: 'Morning everyone! Safe travel today 🙏',   time: '7:40 AM', self: false },
    ],
    travelling: [
      { name: 'Rina M.',   time: '7:45 AM' },
    ],
  },
];

const FREQUENCY_OPTIONS  = ['Daily', 'Weekdays', 'Occasionally'];
const PRIVACY_OPTIONS    = [
  { value: 'women_only',    label: 'Women Only',       icon: Shield },
  { value: 'everyone',      label: 'Everyone',          icon: Globe  },
  { value: 'verified_only', label: 'Verified Users',    icon: UserCheck },
];

const PRIVACY_META = {
  women_only:    { label: 'Women Only',    icon: Shield,    color: '#E91E8C' },
  everyone:      { label: 'Everyone',      icon: Globe,     color: '#42A5F5' },
  verified_only: { label: 'Verified',      icon: UserCheck, color: '#AB47BC' },
};

/* ══════════════════════════════════════════════
   ROOM CARD
   ══════════════════════════════════════════════ */
const RoomCard = ({ room, onJoin }) => {
  const privacy  = PRIVACY_META[room.privacy] || PRIVACY_META.everyone;
  const PrivIcon = privacy.icon;

  return (
    <article className="sr-room-card anim-fade-in" onClick={() => onJoin(room)}>
      {/* Top accent bar */}
      <div className="sr-room-accent" style={{ background: room.color }} />

      <div className="sr-room-body">
        {/* Route */}
        <div className="sr-route-row">
          <span className="sr-route-point">{room.from}</span>
          <ArrowRight size={14} className="sr-route-arrow" />
          <span className="sr-route-point">{room.to}</span>
        </div>

        {/* Meta row */}
        <div className="sr-meta-row">
          <span className="sr-meta-pill">
            <Clock size={11} /> {room.frequency} · {room.timing}
          </span>
          <span className="sr-meta-pill" style={{ color: privacy.color, borderColor: `${privacy.color}44` }}>
            <PrivIcon size={11} /> {privacy.label}
          </span>
        </div>

        {/* Creator + members */}
        <div className="sr-creator-row">
          <span className="sr-creator">Created by {room.creator}</span>
          <span className="sr-member-badge">
            <Users size={11} /> {room.members} members
          </span>
        </div>

        {/* Reason */}
        <p className="sr-reason">"{room.reason}"</p>

        {/* Footer */}
        <div className="sr-card-footer">
          {room.verified && (
            <span className="sr-verified-badge">
              <ShieldCheck size={12} /> Verified Safety Room
            </span>
          )}
          <div className="sr-score-chip">
            <Star size={11} /> {room.safetyScore}/100
          </div>
        </div>

        <button className="sr-join-btn" onClick={(e) => { e.stopPropagation(); onJoin(room); }}>
          Join Room <ArrowRight size={14} />
        </button>
      </div>
    </article>
  );
};

/* ══════════════════════════════════════════════
   CREATE ROOM MODAL
   ══════════════════════════════════════════════ */
const CreateRoomModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({
    from: '', to: '', frequency: 'Daily',
    timing: '', reason: '', privacy: 'women_only',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.from.trim() || !form.to.trim()) return;
    onCreate({
      id: `r-${Date.now()}`,
      from: form.from.trim(),
      to: form.to.trim(),
      creator: 'You',
      frequency: form.frequency,
      timing: form.timing || '—',
      members: 1,
      reason: form.reason.trim() || 'Looking for travel companions on this route.',
      privacy: form.privacy,
      safetyScore: 85,
      verified: false,
      color: '#E91E8C',
      messages: [],
      travelling: [],
    });
    onClose();
  };

  return (
    <div className="sr-modal-overlay" onClick={onClose}>
      <div className="sr-modal anim-scale-in-spring" onClick={e => e.stopPropagation()}>
        <div className="sr-modal-header">
          <h2 className="sr-modal-title">Create Safety Room</h2>
          <button className="sr-modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <form className="sr-modal-form" onSubmit={handleSubmit}>
          {/* Route */}
          <div className="sr-form-section">
            <label className="sr-form-label">Route</label>
            <div className="sr-route-inputs">
              <div className="sr-input-wrap">
                <MapPin size={14} className="sr-input-icon" />
                <input
                  className="sr-input"
                  placeholder="Starting location"
                  value={form.from}
                  onChange={e => set('from', e.target.value)}
                  required
                />
              </div>
              <div className="sr-route-connector"><ArrowRight size={16} /></div>
              <div className="sr-input-wrap">
                <Navigation size={14} className="sr-input-icon" />
                <input
                  className="sr-input"
                  placeholder="Destination"
                  value={form.to}
                  onChange={e => set('to', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Frequency */}
          <div className="sr-form-section">
            <label className="sr-form-label">Travel Frequency</label>
            <div className="sr-chip-group">
              {FREQUENCY_OPTIONS.map(f => (
                <button
                  key={f} type="button"
                  className={`sr-chip ${form.frequency === f ? 'sr-chip--active' : ''}`}
                  onClick={() => set('frequency', f)}
                >{f}</button>
              ))}
            </div>
          </div>

          {/* Timing */}
          <div className="sr-form-section">
            <label className="sr-form-label">Preferred Travel Time</label>
            <div className="sr-input-wrap">
              <Clock size={14} className="sr-input-icon" />
              <input
                className="sr-input"
                placeholder="e.g. 8:00 AM – 9:00 AM"
                value={form.timing}
                onChange={e => set('timing', e.target.value)}
              />
            </div>
          </div>

          {/* Reason */}
          <div className="sr-form-section">
            <label className="sr-form-label">Why are you creating this room?</label>
            <textarea
              className="sr-textarea"
              placeholder="e.g. I travel this route daily for work and want to find other people…"
              value={form.reason}
              onChange={e => set('reason', e.target.value)}
              rows={3}
            />
          </div>

          {/* Privacy */}
          <div className="sr-form-section">
            <label className="sr-form-label">Who can join?</label>
            <div className="sr-privacy-group">
              {PRIVACY_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value} type="button"
                  className={`sr-privacy-btn ${form.privacy === value ? 'sr-privacy-btn--active' : ''}`}
                  onClick={() => set('privacy', value)}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="sr-submit-btn">
            <Plus size={16} /> Create Room
          </button>
        </form>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   ROOM DETAIL (inside-room view)
   ══════════════════════════════════════════════ */
const RoomDetail = ({ room, onBack }) => {
  const [messages, setMessages]   = useState(room.messages);
  const [input, setInput]         = useState('');
  const [activeTab, setActiveTab] = useState('chat'); // chat | travel | safety
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}`,
      author: 'You',
      text,
      time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      self: true,
    }]);
    setInput('');
  };

  const privacy = PRIVACY_META[room.privacy] || PRIVACY_META.everyone;
  const PrivIcon = privacy.icon;

  return (
    <div className="sr-room-detail">
      {/* Header */}
      <header className="sr-detail-header anim-slide-down">
        <button className="sr-back-btn" onClick={onBack} aria-label="Back">
          <ChevronLeft size={20} />
        </button>
        <div className="sr-detail-route">
          <span className="sr-detail-from">{room.from}</span>
          <ArrowRight size={13} className="sr-route-arrow" />
          <span className="sr-detail-to">{room.to}</span>
        </div>
        <div className="sr-detail-meta">
          <span className="sr-detail-chip"><Users size={11} /> {room.members}</span>
          <span className="sr-detail-chip" style={{ color: '#00E676' }}>
            <Star size={11} /> {room.safetyScore}/100
          </span>
        </div>
      </header>

      {/* Tab bar */}
      <div className="sr-tab-bar" role="tablist">
        {[
          { id: 'chat',   label: 'Group Chat',      icon: MessageCircle },
          { id: 'travel', label: 'Travelling Today', icon: Radio },
          { id: 'safety', label: 'Safety Actions',   icon: Shield },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id} role="tab"
            className={`sr-tab ${activeTab === id ? 'sr-tab--active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ── Chat ── */}
      {activeTab === 'chat' && (
        <div className="sr-chat-wrap">
          <div className="sr-chat-messages">
            {messages.length === 0 && (
              <div className="sr-chat-empty">
                <MessageCircle size={36} />
                <p>No messages yet. Be the first to say hello!</p>
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`sr-msg ${msg.self ? 'sr-msg--self' : ''}`}>
                {!msg.self && <span className="sr-msg-author">{msg.author}</span>}
                <div className="sr-msg-bubble">{msg.text}</div>
                <span className="sr-msg-time">{msg.time}</span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="sr-chat-input-row">
            <input
              className="sr-chat-input"
              placeholder="Type a message…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button className="sr-chat-send" onClick={sendMessage} aria-label="Send">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Travelling Today ── */}
      {activeTab === 'travel' && (
        <div className="sr-travel-wrap">
          <div className="sr-travel-header">
            <Radio size={16} className="sr-live-dot" />
            <span>Members travelling today</span>
          </div>
          {room.travelling.length === 0 ? (
            <div className="sr-tab-empty">
              <Navigation size={36} />
              <p>No one has marked themselves as travelling yet.</p>
            </div>
          ) : (
            <div className="sr-travellers-list">
              {room.travelling.map((t, i) => (
                <div key={i} className="sr-traveller-card">
                  <div className="sr-traveller-avatar">
                    {t.name.charAt(0)}
                  </div>
                  <div className="sr-traveller-info">
                    <span className="sr-traveller-name">{t.name}</span>
                    <span className="sr-traveller-time"><Clock size={11} /> {t.time}</span>
                  </div>
                  <span className="sr-live-badge"><Radio size={10} /> Live</span>
                </div>
              ))}
            </div>
          )}
          <button className="sr-travel-mark-btn">
            <CheckCircle2 size={15} /> Mark Myself as Travelling
          </button>
        </div>
      )}

      {/* ── Safety Actions ── */}
      {activeTab === 'safety' && (
        <div className="sr-safety-wrap">
          {[
            { icon: MapPin,        label: 'Share Live Location', color: '#42A5F5', desc: 'Let room members see your location.' },
            { icon: Zap,           label: 'Emergency SOS',       color: '#FF1744', desc: 'Alert all members and contacts.' },
            { icon: CheckCircle2,  label: 'Mark Reached Safely', color: '#00E676', desc: 'Notify the room you arrived safely.' },
            { icon: AlertTriangle, label: 'Report Safety Concern', color: '#FFB300', desc: 'Warn the room about a hazard on the route.' },
          ].map(({ icon: Icon, label, color, desc }) => (
            <button key={label} className="sr-safety-action" style={{ '--sa-color': color }}>
              <div className="sr-safety-icon-wrap">
                <Icon size={20} />
              </div>
              <div className="sr-safety-text">
                <span className="sr-safety-label">{label}</span>
                <span className="sr-safety-desc">{desc}</span>
              </div>
              <ArrowRight size={16} className="sr-safety-chevron" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════ */
const SafetyRoomsPage = () => {
  const [rooms, setRooms]             = useState(SEED_ROOMS);
  const [activeRoom, setActiveRoom]   = useState(null);
  const [showCreate, setShowCreate]   = useState(false);
  const [showMyRooms, setShowMyRooms] = useState(false);
  const [search, setSearch]           = useState('');
  const [joined, setJoined]           = useState(new Set());

  const handleJoin = (room) => {
    setJoined(prev => new Set([...prev, room.id]));
    setActiveRoom(room);
  };

  const handleCreate = (room) => {
    setRooms(prev => [room, ...prev]);
    setJoined(prev => new Set([...prev, room.id]));
  };

  const filteredRooms = rooms.filter(r => {
    const q = search.toLowerCase();
    if (!q) return showMyRooms ? joined.has(r.id) : true;
    const match = r.from.toLowerCase().includes(q) || r.to.toLowerCase().includes(q);
    return showMyRooms ? joined.has(r.id) && match : match;
  });

  /* Inside-room view */
  if (activeRoom) {
    return (
      <div className="cp-page">
        <RoomDetail room={activeRoom} onBack={() => setActiveRoom(null)} />
      </div>
    );
  }

  return (
    <div className="cp-page">
      <div className="cp-scroll">

        {/* ── Header ── */}
        <header className="cp-header anim-slide-down">
          <div>
            <h1 className="cp-page-title">Safety Rooms</h1>
            <p className="cp-page-sub">Find people who travel the same routes as you</p>
          </div>
          <button className="cp-report-fab" id="sr-create-btn" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Create
          </button>
        </header>

        {/* ── Search ── */}
        <div className="sr-search-wrap anim-fade-in">
          <Search size={15} className="sr-search-icon" />
          <input
            className="sr-search-input"
            placeholder="Search by route or location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* ── Quick-action row ── */}
        <div className="sr-action-row anim-fade-in">
          <button
            className={`sr-action-btn ${!showMyRooms ? 'sr-action-btn--active' : ''}`}
            onClick={() => setShowMyRooms(false)}
          >
            <Globe size={14} /> All Rooms
          </button>
          <button
            className={`sr-action-btn ${showMyRooms ? 'sr-action-btn--active' : ''}`}
            onClick={() => setShowMyRooms(true)}
          >
            <UserPlus size={14} /> My Rooms {joined.size > 0 && <span className="sr-badge-dot">{joined.size}</span>}
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="cp-stats-bar anim-fade-in">
          <div className="cp-stat">
            <span className="cp-stat-num">{rooms.length}</span>
            <span className="cp-stat-label">Active Rooms</span>
          </div>
          <div className="cp-stat-divider" />
          <div className="cp-stat">
            <span className="cp-stat-num">{rooms.reduce((a, r) => a + r.members, 0)}</span>
            <span className="cp-stat-label">Total Members</span>
          </div>
          <div className="cp-stat-divider" />
          <div className="cp-stat">
            <span className="cp-stat-num">{joined.size}</span>
            <span className="cp-stat-label">Joined</span>
          </div>
        </div>

        {/* ── Rooms feed ── */}
        <section className="cp-feed">
          {filteredRooms.length === 0 ? (
            <div className="cp-empty">
              <Shield size={44} />
              <p style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                {showMyRooms ? "You haven't joined any rooms yet." : 'No rooms found for this route.'}
              </p>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>
                {showMyRooms
                  ? 'Browse All Rooms and join one, or create your own.'
                  : 'Create the first Safety Room and invite travellers.'}
              </p>
              <button className="sr-submit-btn" style={{ marginTop: 8 }} onClick={() => setShowCreate(true)}>
                <Plus size={15} /> Create a Room
              </button>
            </div>
          ) : (
            filteredRooms.map(room => (
              <RoomCard key={room.id} room={room} onJoin={handleJoin} />
            ))
          )}
        </section>

      </div>

      {/* ── Create Room Modal ── */}
      {showCreate && (
        <CreateRoomModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
};

export default SafetyRoomsPage;
