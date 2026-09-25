import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Search, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  Inbox,
  Eye
} from 'lucide-react';
import { CreateTicketModal } from './components/CreateTicketModal';
import { TicketDetailModal } from './components/TicketDetailModal';

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, in_progress: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const fetchTicketsAndStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'All') {
        params.append('status', statusFilter);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const [ticketsRes, statsRes] = await Promise.all([
        fetch(`http://127.0.0.1:8000/api/tickets?${params.toString()}`),
        fetch(`http://127.0.0.1:8000/api/stats`)
      ]);

      if (ticketsRes.ok) {
        const data = await ticketsRes.json();
        setTickets(data);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketsAndStats();
  }, [statusFilter, searchQuery]);

  return (
    <div className="app-container">
      {/* App Header */}
      <header className="header">
        <div className="brand">
          <div className="brand-icon">
            <Ticket size={22} />
          </div>
          <div>
            <h1 className="brand-title">Datastraw Support CRM</h1>
            <p className="brand-subtitle">Customer Ticketing & Support Operations</p>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
          <Plus size={16} /> Create Ticket
        </button>
      </header>

      {/* Analytics Dashboard Cards */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: '#f1f5f9', color: '#475569' }}>
            <Inbox size={20} />
          </div>
          <div>
            <div className="stat-val">{stats.total}</div>
            <div className="stat-lbl">Total Tickets</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'var(--status-open-bg)', color: 'var(--status-open-text)' }}>
            <AlertCircle size={20} />
          </div>
          <div>
            <div className="stat-val">{stats.open}</div>
            <div className="stat-lbl">Open Tickets</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'var(--status-progress-bg)', color: 'var(--status-progress-text)' }}>
            <Clock size={20} />
          </div>
          <div>
            <div className="stat-val">{stats.in_progress}</div>
            <div className="stat-lbl">In Progress</div>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'var(--status-closed-bg)', color: 'var(--status-closed-text)' }}>
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="stat-val">{stats.closed}</div>
            <div className="stat-lbl">Resolved / Closed</div>
          </div>
        </div>
      </div>

      {/* Control Toolbar: Search & Filter Tabs */}
      <div className="glass-card" style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Search input */}
        <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            className="input-field" 
            style={{ paddingLeft: '2.5rem' }} 
            placeholder="Search by name, email, ID, subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
          {['All', 'Open', 'In Progress', 'Closed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.825rem',
                fontWeight: 600,
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: statusFilter === tab ? '#ffffff' : 'transparent',
                color: statusFilter === tab ? 'var(--accent-primary)' : 'var(--text-secondary)',
                boxShadow: statusFilter === tab ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Refresh button */}
        <button className="btn btn-secondary" onClick={fetchTicketsAndStats} title="Refresh ticket list">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Tickets List Table */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading support tickets...</div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <Inbox size={40} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>No tickets found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {searchQuery || statusFilter !== 'All' ? 'Try adjusting your search query or status filter.' : 'Click "Create Ticket" above to get started.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Ticket ID</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Customer</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Subject</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Priority</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Date Created</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr 
                    key={t.ticket_id} 
                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.1s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {t.ticket_id}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.customer_name}</div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>{t.customer_email}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 500, color: 'var(--text-primary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.subject}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span className={`priority-dot priority-${t.priority}`}></span> {t.priority}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge badge-${t.status.toLowerCase().replace(' ', '-')}`}>
                        {t.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.775rem' }}
                        onClick={() => setSelectedTicketId(t.ticket_id)}
                      >
                        <Eye size={13} /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateTicketModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onTicketCreated={() => {
          fetchTicketsAndStats();
        }}
      />

      <TicketDetailModal 
        ticketId={selectedTicketId}
        isOpen={!!selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        onTicketUpdated={() => {
          fetchTicketsAndStats();
        }}
      />
    </div>
  );
}
