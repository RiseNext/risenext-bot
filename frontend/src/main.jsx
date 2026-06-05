import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MessageCircle, Instagram, Phone, Globe2, Mail, RefreshCw } from 'lucide-react';
import { api } from './api/client.js';
import './styles.css';

function App() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({ total: 0, byChannel: [], byStatus: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadData() {
    try {
      setLoading(true);
      const [leadRes, statRes] = await Promise.all([api.get('/api/leads'), api.get('/api/leads/stats/summary')]);
      setLeads(leadRes.data);
      setStats(statRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  return (
    <main className="app">
      <section className="hero">
        <div>
          <p className="eyebrow">Rise Next Solutions</p>
          <h1>WhatsApp + Instagram Bot CRM</h1>
          <p className="sub">Official Meta API based automation for enquiries, service menus and lead tracking.</p>
          <div className="contact-row"><span><Phone size={16}/> +91 94941 19354</span><span><Mail size={16}/> info@risenext.in</span><span><Globe2 size={16}/> risenext.in</span></div>
        </div>
        <button onClick={loadData}><RefreshCw size={16}/> Refresh</button>
      </section>

      <section className="cards">
        <div className="card"><p>Total Leads</p><strong>{stats.total}</strong></div>
        <div className="card"><p>WhatsApp</p><strong>{stats.byChannel?.find(x => x._id === 'whatsapp')?.count || 0}</strong></div>
        <div className="card"><p>Instagram</p><strong>{stats.byChannel?.find(x => x._id === 'instagram')?.count || 0}</strong></div>
      </section>

      <section className="panel">
        <div className="panel-head"><h2>Recent Enquiries</h2><p>{loading ? 'Loading...' : `${leads.length} records`}</p></div>
        {error && <div className="error">{error}</div>}
        <div className="table-wrap">
          <table>
            <thead><tr><th>Channel</th><th>Customer</th><th>Service</th><th>Requirement</th><th>Status</th><th>Updated</th></tr></thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead._id}>
                  <td>{lead.channel === 'whatsapp' ? <span className="badge green"><MessageCircle size={14}/> WhatsApp</span> : <span className="badge pink"><Instagram size={14}/> Instagram</span>}</td>
                  <td><b>{lead.name || lead.username || lead.customerId}</b><small>{lead.phone || lead.customerId}</small></td>
                  <td>{lead.selectedService || '-'}</td>
                  <td>{lead.requirement || lead.messages?.[0]?.text || '-'}</td>
                  <td><span className="status">{lead.status}</span></td>
                  <td>{new Date(lead.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
              {!loading && leads.length === 0 && <tr><td colSpan="6" className="empty">No leads found. Run backend seed or connect Meta webhooks.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
