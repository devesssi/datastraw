import React, { useState, useEffect } from 'react';
import { X, Clock, MessageSquare, Send, User, Mail } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export function TicketDetailModal({ ticketId, isOpen, onClose, onTicketUpdated }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Open');
  const [priority, setPriority] = useState('Medium');
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  useEffect(() => {
    if (isOpen && ticketId) {
      fetchTicket();
    }
  }, [isOpen, ticketId]);

  const fetchTicket = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`);
      if (!res.ok) throw new Error('Failed to load ticket details');
      const data = await res.json();
      setTicket(data);
      setStatus(data.status);
      setPriority(data.priority);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusOrPriorityChange = async (newStat, newPrio) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStat,
          priority: newPrio,
          author_name: 'Support Specialist'
        })
      });
      if (res.ok) {
        fetchTicket();
        onTicketUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmittingNote(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note_text: newNote,
          author_name: 'Support Specialist'
        })
      });
      if (res.ok) {
        setNewNote('');
        fetchTicket();
        onTicketUpdated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingNote(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" style={{ maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
        {loading || !ticket ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading ticket details...</div>
        ) : (
          <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                    {ticket.ticket_id}
                  </span>
                  <span className={`badge badge-${ticket.status.toLowerCase().replace(' ', '-')}`}>
                    {ticket.status}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span className={`priority-dot priority-${ticket.priority}`}></span> Priority: {ticket.priority}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{ticket.subject}</h2>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem' }}>
                <X size={18} />
              </button>
            </div>

            {/* Customer & Ticket Info Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: '#f8fafc', border: '1px solid var(--border-color)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={15} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Customer:</span>
                <strong style={{ fontSize: '0.825rem', color: 'var(--text-primary)' }}>{ticket.customer_name}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={15} style={{ color: 'var(--text-secondary)' }} />
                <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Email:</span>
                <span style={{ fontSize: '0.825rem', color: 'var(--text-primary)' }}>{ticket.customer_email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={15} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Created:</span>
                <span style={{ fontSize: '0.825rem', color: 'var(--text-primary)' }}>{new Date(ticket.created_at).toLocaleString()}</span>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>Description</h4>
              <div style={{ background: '#ffffff', border: '1px solid var(--border-color)', padding: '0.85rem', borderRadius: '6px', fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                {ticket.description}
              </div>
            </div>

            {/* Update Status & Priority Controls */}
            <div style={{ display: 'flex', gap: '1rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid var(--border-color)', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <label className="input-label" style={{ marginBottom: '0.25rem', display: 'block' }}>Update Status</label>
                <select 
                  className="select-field" 
                  value={status} 
                  onChange={(e) => {
                    setStatus(e.target.value);
                    handleStatusOrPriorityChange(e.target.value, priority);
                  }}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label className="input-label" style={{ marginBottom: '0.25rem', display: 'block' }}>Update Priority</label>
                <select 
                  className="select-field" 
                  value={priority} 
                  onChange={(e) => {
                    setPriority(e.target.value);
                    handleStatusOrPriorityChange(status, e.target.value);
                  }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Internal Activity & Notes Timeline */}
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                <MessageSquare size={15} style={{ color: 'var(--accent-primary)' }} /> Internal Activity & Notes ({ticket.notes?.length || 0})
              </h4>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Add an internal note or comment..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" disabled={submittingNote || !newNote.trim()}>
                  <Send size={15} />
                </button>
              </form>

              {/* Timeline list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {ticket.notes && ticket.notes.length > 0 ? (
                  ticket.notes.map((note) => (
                    <div key={note.id} style={{ background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <strong style={{ fontSize: '0.825rem', color: 'var(--accent-primary)' }}>{note.author_name}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(note.created_at).toLocaleString()}</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{note.note_text}</p>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontStyle: 'italic', textAlign: 'center', padding: '0.75rem' }}>
                    No notes recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
