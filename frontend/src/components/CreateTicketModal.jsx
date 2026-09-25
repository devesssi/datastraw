import React, { useState } from 'react';
import { X, PlusCircle, AlertCircle } from 'lucide-react';

export function CreateTicketModal({ isOpen, onClose, onTicketCreated }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: '',
    priority: 'Medium'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail?.[0]?.msg || errData.detail || 'Failed to create ticket');
      }

      const data = await response.json();
      onTicketCreated(data);
      onClose();
      setFormData({
        customer_name: '',
        customer_email: '',
        subject: '',
        description: '',
        priority: 'Medium'
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
            <PlusCircle size={18} style={{ color: 'var(--accent-primary)' }} /> Create New Support Ticket
          </h2>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.6rem 0.85rem', borderRadius: '6px', marginBottom: '0.85rem', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="input-group">
              <label className="input-label">Customer Name</label>
              <input 
                type="text" 
                name="customer_name" 
                required 
                placeholder="e.g. Jane Doe"
                className="input-field" 
                value={formData.customer_name} 
                onChange={handleChange} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">Customer Email</label>
              <input 
                type="email" 
                name="customer_email" 
                required 
                placeholder="jane@example.com"
                className="input-field" 
                value={formData.customer_email} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.85rem' }}>
            <div className="input-group">
              <label className="input-label">Issue Subject</label>
              <input 
                type="text" 
                name="subject" 
                required 
                placeholder="Brief summary of the issue"
                className="input-field" 
                value={formData.subject} 
                onChange={handleChange} 
              />
            </div>
            <div className="input-group">
              <label className="input-label">Priority</label>
              <select 
                name="priority" 
                className="select-field" 
                value={formData.priority} 
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea 
              name="description" 
              rows={4} 
              required 
              placeholder="Provide details about the customer's request or problem..."
              className="textarea-field" 
              value={formData.description} 
              onChange={handleChange} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
