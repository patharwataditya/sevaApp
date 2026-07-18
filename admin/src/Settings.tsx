import { useState } from 'react';
import { getConfig, setConfig } from './api';

export function SettingsModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const cfg = getConfig();
  const [apiUrl, setApiUrl] = useState(cfg.apiUrl);
  const [adminKey, setAdminKey] = useState(cfg.adminKey);
  const [show, setShow] = useState(false);

  function save() {
    if (!apiUrl.trim()) return alert('API URL is required');
    setConfig(apiUrl.trim(), adminKey.trim());
    onSaved();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h2>⚙ Settings</h2></div>
        <div className="form-grid">
          <label className="full">
            <span>API URL</span>
            <input value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="https://xxxx.execute-api.us-east-1.amazonaws.com" />
          </label>
          <label className="full">
            <span>Admin key</span>
            <div className="row">
              <input type={show ? 'text' : 'password'} value={adminKey} onChange={(e) => setAdminKey(e.target.value)} placeholder="from backend/.env" />
              <button className="btn small ghost" onClick={() => setShow((v) => !v)}>{show ? 'Hide' : 'Show'}</button>
            </div>
          </label>
          <p className="hint full">
            These are stored in your browser (localStorage). You can also preset them in
            <code> admin/.env.local </code> as <code>VITE_API_URL</code> and <code>VITE_ADMIN_KEY</code>.
          </p>
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={save}>Save & connect</button>
        </div>
      </div>
    </div>
  );
}
