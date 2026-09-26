import { useState } from 'react';
import { saveReport } from '../lib/offlineQueue';

const INCIDENT_TYPES = ['Structure fire', 'Bush/grass fire', 'Vehicle fire', 'Electrical fault', 'Gas leak', 'Other'];
const SEVERITIES = [
  { value: 'critical', label: 'Critical — immediate danger to life' },
  { value: 'high', label: 'High — spreading, significant risk' },
  { value: 'medium', label: 'Medium — contained but active' }
];

export default function ReportForm({ reporterRole, onSubmitted }) {
  const [incidentType, setIncidentType] = useState(INCIDENT_TYPES[0]);
  const [severity, setSeverity] = useState('high');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('locating');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const report = {
            incident_type: incidentType,
            severity,
            description,
            reporter_phone: phone || null,
            reported_by: reporterRole,
            status: 'active',
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          const result = await saveReport(report);
          setStatus(result.status);
          setDescription('');
          onSubmitted?.(result.status);
        } catch (err) {
          console.error(err);
          setStatus('error');
        }
      },
      () => setStatus('error'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="report-form">
      <label>
        Incident type
        <select value={incidentType} onChange={(e) => setIncidentType(e.target.value)}>
          {INCIDENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>

      <label>
        Severity
        <select value={severity} onChange={(e) => setSeverity(e.target.value)}>
          {SEVERITIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </label>

      <label>
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's happening, and anything crews should know"
          rows={4}
        />
      </label>

      <label>
        Your phone number (optional)
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+254 7XX XXX XXX"
        />
      </label>

      <button type="submit" disabled={status === 'locating'}>
        {status === 'locating' ? 'Getting location…' : 'Submit report'}
      </button>

      {status === 'synced' && <p className="status ok">✅ Sent — appears on the dashboard now.</p>}
      {status === 'queued' && <p className="status warn">📶 No connection — saved on this device, will send automatically once online.</p>}
      {status === 'error' && <p className="status error">Couldn't get your location. Check location permissions and try again.</p>}
    </form>
  );
}
