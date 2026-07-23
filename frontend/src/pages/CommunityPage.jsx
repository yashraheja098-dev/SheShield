/**
 * SafetyRoomsPage — route-based travel community for safer commuting.
 * Fully integrated with backend REST APIs and Socket.IO for real-time features.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  Users, Plus, MapPin, ArrowRight, Clock,
  Shield, ShieldCheck, Send, ChevronLeft,
  Radio, Navigation, CheckCircle2,
  Star, Globe, UserCheck, MessageCircle,
  UserPlus, X, Zap, Search, Bike, LogOut,
  CalendarDays, Info, Route
} from 'lucide-react';
import './CommunityPage.css';
import { roomApi } from '../services/api/roomApi';
import socketService from '../services/socketService';

const FREQUENCY_OPTIONS = ['Daily', 'Weekdays', 'Occasionally'];
const PRIVACY_OPTIONS   = [
  { value: 'women_only',    label: 'Women Only',    icon: Shield    },
  { value: 'everyone',      label: 'Everyone',       icon: Globe     },
  { value: 'verified_only', label: 'Verified Users', icon: UserCheck },
];

const PRIVACY_META = {
  women_only:    { label: 'Women Only', icon: Shield,    color: '#E91E8C' },
  everyone:      { label: 'Everyone',   icon: Globe,     color: '#42A5F5' },
  verified_only: { label: 'Verified',   icon: UserCheck, color: '#AB47BC' },
};

// Extracted from local storage or auth context
const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('ss_user'));
    return user?._id || user?.id || 'mock_user_id';
  } catch(e) { return 'mock_user_id'; }
};

/* ══════════════════════════════════════════════
   ROOM CARD
   ══════════════════════════════════════════════ */
const RoomCard = ({ room, onJoin }) => {
  const privacy  = PRIVACY_META['everyone']; // Using default for now
  const PrivIcon = privacy.icon;
  const creatorName = room.createdBy?.name || 'Unknown';

  return (
    <article className="sr-room-card anim-fade-in" onClick={() => onJoin(room)}>
      <div className="sr-room-accent" style={{ background: '#7C4DFF' }} />
      <div className="sr-room-body">
        <div className="sr-route-row">
          <span className="sr-route-point">{room.startLocation}</span>
          <ArrowRight size={14} className="sr-route-arrow" />
          <span className="sr-route-point">{room.destination}</span>
        </div>
        <div className="sr-meta-row">
          <span className="sr-meta-pill">
            <Clock size={11} /> {room.frequency} · {room.preferredTime || 'Any time'}
          </span>
          <span className="sr-meta-pill" style={{ color: privacy.color, borderColor: `${privacy.color}44` }}>
            <PrivIcon size={11} /> {privacy.label}
          </span>
        </div>
        <div className="sr-creator-row">
          <span className="sr-creator">Created by {creatorName}</span>
          <span className="sr-member-badge">
            <Users size={11} /> {room.members?.length || 1} members
          </span>
        </div>
        <p className="sr-reason">"{room.reason || 'Looking for travel companions.'}"</p>
        <div className="sr-card-footer">
          <div className="sr-score-chip">
            <Star size={11} /> {room.safeScore || 85}/100
          </div>
        </div>
        <button className="sr-join-btn" onClick={e => { e.stopPropagation(); onJoin(room); }}>
          Open Room <ArrowRight size={14} />
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
    startLocation: '', destination: '', frequency: 'Daily',
    preferredTime: '', reason: '', preferredTravelMode: 'Any',
    meetingPoint: ''
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.startLocation.trim() || !form.destination.trim()) return;
    
    setLoading(true);
    try {
      const data = await roomApi.createRoom(form);
      onCreate(data);
      onClose();
    } catch (error) {
      console.error("Failed to create room", error);
      alert("Error creating room.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sr-modal-overlay" onClick={onClose}>
      <div className="sr-modal anim-scale-in-spring" onClick={e => e.stopPropagation()}>
        <div className="sr-modal-header">
          <h2 className="sr-modal-title">Create Safety Room</h2>
          <button className="sr-modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <form className="sr-modal-form" onSubmit={handleSubmit}>
          <div className="sr-form-section">
            <label className="sr-form-label">Route</label>
            <div className="sr-route-inputs">
              <div className="sr-input-wrap">
                <MapPin size={14} className="sr-input-icon" />
                <input className="sr-input" placeholder="Starting location" value={form.startLocation} onChange={e => set('startLocation', e.target.value)} required />
              </div>
              <div className="sr-route-connector"><ArrowRight size={16} /></div>
              <div className="sr-input-wrap">
                <Navigation size={14} className="sr-input-icon" />
                <input className="sr-input" placeholder="Destination" value={form.destination} onChange={e => set('destination', e.target.value)} required />
              </div>
            </div>
          </div>
          <div className="sr-form-section">
            <label className="sr-form-label">Travel Frequency</label>
            <div className="sr-chip-group">
              {FREQUENCY_OPTIONS.map(f => (
                <button key={f} type="button" className={`sr-chip ${form.frequency === f ? 'sr-chip--active' : ''}`} onClick={() => set('frequency', f)}>{f}</button>
              ))}
            </div>
          </div>
          <div className="sr-form-section">
            <label className="sr-form-label">Preferred Travel Time</label>
            <div className="sr-input-wrap">
              <Clock size={14} className="sr-input-icon" />
              <input className="sr-input" placeholder="e.g. 8:00 AM – 9:00 AM" value={form.preferredTime} onChange={e => set('preferredTime', e.target.value)} />
            </div>
          </div>
          <div className="sr-form-section">
            <label className="sr-form-label">Meeting Point (Optional)</label>
            <div className="sr-input-wrap">
              <MapPin size={14} className="sr-input-icon" />
              <input className="sr-input" placeholder="e.g. Gate 2" value={form.meetingPoint} onChange={e => set('meetingPoint', e.target.value)} />
            </div>
          </div>
          <div className="sr-form-section">
            <label className="sr-form-label">Why are you creating this room?</label>
            <textarea className="sr-textarea" placeholder="e.g. I travel this route daily for work…" value={form.reason} onChange={e => set('reason', e.target.value)} rows={3} />
          </div>
          <button type="submit" className="sr-submit-btn" disabled={loading}>
            {loading ? "Creating..." : <><Plus size={16} /> Create Room</>}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   ROOM DETAIL — SUB-COMPONENTS
   ══════════════════════════════════════════════ */

const RoomHeader = ({ room, onBack }) => (
  <header className="rd-header anim-slide-down">
    <div className="rd-header-top">
      <button className="sr-back-btn" onClick={onBack} aria-label="Back">
        <ChevronLeft size={20} /> Back
      </button>
    </div>
    <div className="rd-accent-bar" style={{ background: `linear-gradient(90deg, #7C4DFF, transparent)` }} />
    <div className="rd-route-row">
      <div className="rd-route-point rd-route-from">
        <MapPin size={14} style={{ color: '#7C4DFF' }} />
        <span>{room.startLocation}</span>
      </div>
      <div className="rd-route-dashes" />
      <ArrowRight size={18} style={{ color: '#7C4DFF', flexShrink: 0 }} />
      <div className="rd-route-dashes" />
      <div className="rd-route-point rd-route-to">
        <Navigation size={14} style={{ color: '#7C4DFF' }} />
        <span>{room.destination}</span>
      </div>
    </div>
    <div className="rd-stats-row">
      <div className="rd-stat-chip" style={{ '--chip-color': '#00E676' }}>
        <Star size={12} /> {room.safeScore || 85}/100
      </div>
      <div className="rd-stat-chip" style={{ '--chip-color': '#AB47BC' }}>
        <Bike size={12} /> {room.preferredTravelMode || 'Any'}
      </div>
    </div>
    <div className="rd-creator-row">
      <span className="rd-creator-label">Created by <strong>{room.createdBy?.name || 'Unknown'}</strong></span>
      <span className="rd-members-chip"><Users size={12} /> {room.members?.length || 1} Members</span>
    </div>
  </header>
);

const StatusCard = ({ room, onUpdate }) => {
  const userId = getUserId();
  const currentMember = room.members?.find(m => m.userId?._id === userId || m.userId === userId);
  const isTravelling = currentMember?.travellingToday || false;

  const [loading, setLoading] = useState(false);

  const toggleTravelling = async () => {
    setLoading(true);
    try {
      await roomApi.markTravelling(room.roomId, !isTravelling);
      onUpdate(); // refresh room data
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const activeTravellersList = room.members?.filter(m => m.travellingToday) || [];

  return (
    <div className={`rd-status-card ${isTravelling ? 'rd-status-card--active' : ''}`}>
      <div className="rd-status-top">
        <div className="rd-status-text">
          <span className="rd-status-title">
            {isTravelling ? '✅ You\'re marked as travelling today!' : 'Travelling today?'}
          </span>
          <span className="rd-status-sub">
            {isTravelling ? 'Other members can see you are on the way.' : 'Let your room know you\'re heading out.'}
          </span>
        </div>
        <button
          className={`rd-travel-toggle ${isTravelling ? 'rd-travel-toggle--on' : ''}`}
          onClick={toggleTravelling}
          disabled={loading}
        >
          {loading ? "..." : (isTravelling ? 'Cancel' : "I'm Travelling Today")}
        </button>
      </div>
      <div className="rd-divider" />
      <div className="rd-active-travellers">
        <span className="rd-travellers-label">
          <Radio size={13} className="rd-live-pulse" /> Today's Active Travellers
        </span>
        <div className="rd-avatars-row">
          {activeTravellersList.map((t, i) => (
            <div key={i} className="rd-avatar-wrap" title={t.userId?.name || 'User'}>
              <div className="rd-avatar">{(t.userId?.name || 'U').charAt(0)}</div>
            </div>
          ))}
          {activeTravellersList.length === 0 && (
            <span className="rd-no-travellers">No one yet — be the first!</span>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatSection = ({ room }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const userId = getUserId();
  const userName = JSON.parse(localStorage.getItem('ss_user'))?.name || 'User';

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await roomApi.getRoomMessages(room.roomId);
        setMessages(data || []);
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      } catch (e) { console.error("Could not fetch messages", e); }
    };
    fetchMessages();

    const socket = socketService.connect(userId);
    socket.emit('join-room', room.roomId);

    socket.on('receive-message', (data) => {
      if (data.roomId === room.roomId) {
        setMessages(prev => [...prev, data]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    });

    return () => {
      socket.off('receive-message');
      socket.emit('leave-room', room.roomId);
    };
  }, [room.roomId, userId]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const msgData = {
      messageId: `msg-${Date.now()}`,
      roomId: room.roomId,
      senderId: userId,
      senderName: userName,
      message: text,
      timestamp: Date.now()
    };
    const socket = socketService.getSocket();
    if (socket) socket.emit('send-message', msgData);
    setInput('');
  };

  return (
    <div className="rd-section">
      <div className="rd-section-label"><MessageCircle size={14} /> Group Chat</div>
      <div className="rd-chat-box">
        <div className="rd-chat-messages">
          {messages.length === 0 && (
            <div className="sr-chat-empty">
              <MessageCircle size={32} />
              <p>No messages yet. Say hello!</p>
            </div>
          )}
          {messages.map(msg => {
            const isSelf = msg.senderId === userId;
            return (
              <div key={msg.messageId || msg._id} className={`sr-msg ${isSelf ? 'sr-msg--self' : ''}`}>
                {!isSelf && <span className="sr-msg-author">{msg.senderName}</span>}
                <div className="sr-msg-bubble">{msg.message}</div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <div className="sr-chat-input-row">
          <input
            className="sr-chat-input"
            placeholder="Type a message…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          <button className="sr-chat-send" onClick={send} aria-label="Send">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const QuickActions = ({ room, onBack, onUpdate }) => {
  const [reached, setReached] = useState(false);
  const [locShared, setLocShared] = useState(false);
  const [showLeave, setShowLeave] = useState(false);
  const watchIdRef = useRef(null);
  const userId = getUserId();

  const toggleLocation = () => {
    if (locShared) {
      setLocShared(false);
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    } else {
      setLocShared(true);
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const socket = socketService.getSocket();
            if (socket) {
              socket.emit('update-location', {
                roomId: room.roomId,
                userId,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              });
            }
          },
          (error) => { console.error(error); setLocShared(false); },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
      }
    }
  };

  const handleMarkReached = async () => {
    setReached(true);
    try {
      await roomApi.markReached(room.roomId, true);
      onUpdate();
    } catch(e) { console.error(e); setReached(false); }
  };

  const handleLeave = async () => {
    try {
      await roomApi.leaveRoom(room.roomId);
      onBack(); // go back to room list
    } catch(e) { console.error(e); }
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  const actions = [
    {
      id: 'location', icon: MapPin,
      label: locShared ? 'Sharing Location' : 'Share Live Location',
      color: '#42A5F5', active: locShared, onClick: toggleLocation,
    },
    {
      id: 'reached', icon: CheckCircle2,
      label: reached ? '✅ Marked Safe' : 'Mark Reached Safely',
      color: '#00E676', active: reached, onClick: handleMarkReached,
    },
    {
      id: 'sos', icon: Zap,
      label: 'Emergency SOS', color: '#FF1744',
      active: false, onClick: () => {}, 
    },
    {
      id: 'leave', icon: LogOut,
      label: 'Leave Room', color: '#FF6B6B',
      active: false, onClick: () => setShowLeave(true),
    },
  ];

  return (
    <div className="rd-section">
      <div className="rd-section-label"><Zap size={14} /> Quick Actions</div>
      <div className="rd-actions-grid">
        {actions.map(({ id, icon: Icon, label, color, active, onClick }) => (
          <button key={id} className={`rd-action-btn ${active ? 'rd-action-btn--done' : ''}`} style={{ '--qa-color': color }} onClick={onClick}>
            <div className="rd-action-icon"><Icon size={20} /></div>
            <span className="rd-action-label">{label}</span>
          </button>
        ))}
      </div>
      {showLeave && (
        <div className="rd-confirm-overlay" onClick={() => setShowLeave(false)}>
          <div className="rd-confirm-box anim-scale-in-spring" onClick={e => e.stopPropagation()}>
            <LogOut size={28} style={{ color: '#FF6B6B' }} />
            <p className="rd-confirm-title">Leave Room?</p>
            <div className="rd-confirm-btns">
              <button className="rd-confirm-cancel" onClick={() => setShowLeave(false)}>Cancel</button>
              <button className="rd-confirm-danger" onClick={handleLeave}>Leave</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MembersList = ({ room }) => (
  <div className="rd-section">
    <div className="rd-section-label"><Users size={14} /> Members ({room.members?.length || 0})</div>
    <div className="rd-members-list">
      {room.members?.map((m, i) => (
        <div key={i} className="rd-member-card">
          <div className="rd-member-avatar" style={{ background: m.travellingToday ? 'linear-gradient(135deg,#00C853,#00E676)' : 'linear-gradient(135deg,#1E1E38,#2A2A50)' }}>
            {(m.userId?.name || 'U').charAt(0)}
          </div>
          <div className="rd-member-info">
            <span className="rd-member-name">{m.userId?.name || 'User'}</span>
            <span className="rd-member-mode"><Bike size={10} /> {m.travelMode || 'Any'}</span>
          </div>
          <span className={`rd-member-status ${m.travellingToday ? 'rd-member-status--live' : ''}`}>
            {m.travellingToday ? '🟢 Travelling' : '⚫ Offline'}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const RoomInfoCard = ({ room }) => (
  <div className="rd-section">
    <div className="rd-section-label"><Info size={14} /> Room Information</div>
    <div className="rd-info-card">
      <div className="rd-info-row"><div className="rd-info-icon"><CalendarDays size={14} /></div><div className="rd-info-text"><span className="rd-info-label">Created</span><span className="rd-info-value">{new Date(room.createdAt).toLocaleDateString()}</span></div></div>
      <div className="rd-info-row"><div className="rd-info-icon"><Clock size={14} /></div><div className="rd-info-text"><span className="rd-info-label">Frequency</span><span className="rd-info-value">{room.frequency}</span></div></div>
      <div className="rd-info-row"><div className="rd-info-icon"><MapPin size={14} /></div><div className="rd-info-text"><span className="rd-info-label">Meeting Point</span><span className="rd-info-value">{room.meetingPoint || 'None'}</span></div></div>
      <div className="rd-info-reason">
        <span className="rd-info-label">Reason for Room</span>
        <p className="rd-info-reason-text">"{room.reason || 'None'}"</p>
      </div>
    </div>
  </div>
);

const RoomDetail = ({ room, onBack, onUpdate }) => (
  <div className="rd-page">
    <RoomHeader room={room} onBack={onBack} />
    <div className="rd-scroll">
      <StatusCard room={room} onUpdate={onUpdate} />
      <ChatSection room={room} />
      <QuickActions room={room} onBack={onBack} onUpdate={onUpdate} />
      <MembersList room={room} />
      <RoomInfoCard room={room} />
      <div style={{ height: 24 }} />
    </div>
  </div>
);

/* ══════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════ */
const SafetyRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [myRooms, setMyRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showMyRooms, setShowMyRooms] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const [allRes, myRes] = await Promise.all([
        roomApi.getAllRooms(),
        roomApi.getMyRooms()
      ]);
      setRooms(allRes.data || allRes); // axios interceptor might unwrap .data
      setMyRooms(myRes.data || myRes);
    } catch (error) {
      console.error("Failed to fetch rooms", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const refreshActiveRoom = async () => {
    if (!activeRoom) return;
    try {
      const res = await roomApi.getRoomById(activeRoom.roomId);
      setActiveRoom(res.data || res);
    } catch(e) {}
  };

  const handleJoin = async (room) => {
    const isMember = myRooms.some(r => r.roomId === room.roomId);
    if (!isMember) {
      try {
        await roomApi.joinRoom(room.roomId, "WALK");
        await fetchRooms();
      } catch (error) {
        console.error("Join room failed", error);
      }
    }
    setActiveRoom(room);
  };

  const handleCreate = async (newRoom) => {
    await fetchRooms();
    setActiveRoom(newRoom);
  };

  const activeList = showMyRooms ? myRooms : rooms;
  const filteredRooms = (activeList || []).filter(r => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (r.startLocation?.toLowerCase().includes(q) || r.destination?.toLowerCase().includes(q));
  });

  if (activeRoom) {
    return (
      <div className="cp-page">
        <RoomDetail 
          room={activeRoom} 
          onBack={() => { setActiveRoom(null); fetchRooms(); }} 
          onUpdate={refreshActiveRoom} 
        />
      </div>
    );
  }

  return (
    <div className="cp-page">
      <div className="cp-scroll">
        <header className="cp-header anim-slide-down">
          <div>
            <h1 className="cp-page-title">Safety Rooms</h1>
            <p className="cp-page-sub">Find people who travel the same routes as you</p>
          </div>
          <button className="cp-report-fab" id="sr-create-btn" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Create
          </button>
        </header>

        <div className="sr-search-wrap anim-fade-in">
          <Search size={15} className="sr-search-icon" />
          <input className="sr-search-input" placeholder="Search by route or location…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="sr-action-row anim-fade-in">
          <button className={`sr-action-btn ${!showMyRooms ? 'sr-action-btn--active' : ''}`} onClick={() => setShowMyRooms(false)}>
            <Globe size={14} /> All Rooms
          </button>
          <button className={`sr-action-btn ${showMyRooms ? 'sr-action-btn--active' : ''}`} onClick={() => setShowMyRooms(true)}>
            <UserPlus size={14} /> My Rooms {myRooms.length > 0 && <span className="sr-badge-dot">{myRooms.length}</span>}
          </button>
        </div>

        <div className="cp-stats-bar anim-fade-in">
          <div className="cp-stat">
            <span className="cp-stat-num">{rooms.length}</span>
            <span className="cp-stat-label">Total Rooms</span>
          </div>
          <div className="cp-stat-divider" />
          <div className="cp-stat">
            <span className="cp-stat-num">{myRooms.length}</span>
            <span className="cp-stat-label">Joined</span>
          </div>
        </div>

        <section className="cp-feed">
          {loading ? (
            <p style={{ textAlign: 'center', marginTop: 20 }}>Loading rooms...</p>
          ) : filteredRooms.length === 0 ? (
            <div className="cp-empty">
              <Shield size={44} />
              <p style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>
                {showMyRooms ? "You haven't joined any rooms yet." : 'No rooms found.'}
              </p>
              <button className="sr-submit-btn" style={{ marginTop: 8 }} onClick={() => setShowCreate(true)}>
                <Plus size={15} /> Create a Room
              </button>
            </div>
          ) : (
            filteredRooms.map(room => (
              <RoomCard key={room.roomId || room._id} room={room} onJoin={handleJoin} />
            ))
          )}
        </section>
      </div>

      {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
    </div>
  );
};

export default SafetyRoomsPage;
