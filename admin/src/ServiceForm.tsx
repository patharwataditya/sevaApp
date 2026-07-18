import { useState } from 'react';
import type { Category, Service, Phone, AppLink } from './types';
import { STATES } from './types';

type Props = {
  value: Service | null; // null = new
  categories: Category[];
  onCancel: () => void;
  onSave: (s: Service) => void;
};

const empty: Service = {
  id: '',
  categoryId: '',
  name: '',
  description: '',
  department: '',
  scope: 'national',
  phones: [],
  apps: [],
  keywords: [],
  website: '',
  complaintUrl: '',
  emergency: false,
  femaleOnly: false,
};

export function ServiceForm({ value, categories, onCancel, onSave }: Props) {
  const [s, setS] = useState<Service>(value ? { ...empty, ...value } : { ...empty, categoryId: categories[0]?.id ?? '' });
  const set = (patch: Partial<Service>) => setS((prev) => ({ ...prev, ...patch }));

  const setPhone = (i: number, patch: Partial<Phone>) =>
    set({ phones: (s.phones ?? []).map((p, idx) => (idx === i ? { ...p, ...patch } : p)) });
  const addPhone = () => set({ phones: [...(s.phones ?? []), { label: '', number: '' }] });
  const rmPhone = (i: number) => set({ phones: (s.phones ?? []).filter((_, idx) => idx !== i) });

  const setApp = (i: number, patch: Partial<AppLink>) =>
    set({ apps: (s.apps ?? []).map((a, idx) => (idx === i ? { ...a, ...patch } : a)) });
  const addApp = () => set({ apps: [...(s.apps ?? []), { name: '' }] });
  const rmApp = (i: number) => set({ apps: (s.apps ?? []).filter((_, idx) => idx !== i) });

  function submit() {
    if (!s.name.trim()) return alert('Name is required');
    if (!s.categoryId) return alert('Category is required');
    if (!s.description.trim()) return alert('Description is required');
    // clean empties
    const clean: Service = {
      ...s,
      phones: (s.phones ?? []).filter((p) => p.number.trim()),
      apps: (s.apps ?? []).filter((a) => a.name.trim()),
      keywords: (s.keywords ?? []).map((k) => k.trim()).filter(Boolean),
      department: s.department?.trim() || undefined,
      website: s.website?.trim() || undefined,
      complaintUrl: s.complaintUrl?.trim() || undefined,
    };
    onSave(clean);
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{value ? 'Edit service' : 'New service'}</h2>
          {value && <code className="id">{value.id}</code>}
        </div>

        <div className="form-grid">
          <label className="full">
            <span>Name *</span>
            <input value={s.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Police (100)" />
          </label>

          <label>
            <span>Category *</span>
            <select value={s.categoryId} onChange={(e) => set({ categoryId: e.target.value })}>
              <option value="" disabled>Select…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </label>

          <label>
            <span>Scope *</span>
            <select value={s.scope} onChange={(e) => set({ scope: e.target.value })}>
              {STATES.map((st) => <option key={st.code} value={st.code}>{st.name}</option>)}
            </select>
          </label>

          <label className="full">
            <span>Description *</span>
            <textarea rows={3} value={s.description} onChange={(e) => set({ description: e.target.value })} />
          </label>

          <label className="full">
            <span>Department</span>
            <input value={s.department ?? ''} onChange={(e) => set({ department: e.target.value })} />
          </label>

          <label className="check">
            <input type="checkbox" checked={!!s.emergency} onChange={(e) => set({ emergency: e.target.checked })} />
            <span>Emergency (one-tap dial tile)</span>
          </label>
          <label className="check">
            <input type="checkbox" checked={!!s.femaleOnly} onChange={(e) => set({ femaleOnly: e.target.checked })} />
            <span>Women helpline (highlight for female users)</span>
          </label>

          {/* Phones */}
          <div className="full sub-section">
            <div className="sub-head"><span>Phone numbers</span><button className="btn small" onClick={addPhone}>+ Add</button></div>
            {(s.phones ?? []).map((p, i) => (
              <div className="row" key={i}>
                <input placeholder="Label (e.g. Police)" value={p.label} onChange={(e) => setPhone(i, { label: e.target.value })} />
                <input placeholder="Number (digits only)" value={p.number} onChange={(e) => setPhone(i, { number: e.target.value.replace(/[^0-9+]/g, '') })} />
                <button className="btn small danger" onClick={() => rmPhone(i)}>✕</button>
              </div>
            ))}
          </div>

          {/* Links */}
          <label>
            <span>Website</span>
            <input value={s.website ?? ''} onChange={(e) => set({ website: e.target.value })} placeholder="https://…" />
          </label>
          <label>
            <span>Complaint URL</span>
            <input value={s.complaintUrl ?? ''} onChange={(e) => set({ complaintUrl: e.target.value })} placeholder="https://…" />
          </label>

          {/* Apps */}
          <div className="full sub-section">
            <div className="sub-head"><span>Official apps</span><button className="btn small" onClick={addApp}>+ Add</button></div>
            {(s.apps ?? []).map((a, i) => (
              <div className="app-row" key={i}>
                <div className="row">
                  <input placeholder="App name" value={a.name} onChange={(e) => setApp(i, { name: e.target.value })} />
                  <button className="btn small danger" onClick={() => rmApp(i)}>✕</button>
                </div>
                <input placeholder="Short description" value={a.description ?? ''} onChange={(e) => setApp(i, { description: e.target.value })} />
                <div className="row">
                  <input placeholder="Android Play Store URL" value={a.android ?? ''} onChange={(e) => setApp(i, { android: e.target.value })} />
                  <input placeholder="iOS App Store URL" value={a.ios ?? ''} onChange={(e) => setApp(i, { ios: e.target.value })} />
                </div>
                <input placeholder="Website (fallback)" value={a.website ?? ''} onChange={(e) => setApp(i, { website: e.target.value })} />
              </div>
            ))}
          </div>

          <label className="full">
            <span>Search keywords (comma separated)</span>
            <input
              value={(s.keywords ?? []).join(', ')}
              onChange={(e) => set({ keywords: e.target.value.split(',').map((k) => k.trimStart()) })}
              placeholder="police, crime, theft, 100"
            />
          </label>
        </div>

        <div className="modal-foot">
          <button className="btn ghost" onClick={onCancel}>Cancel</button>
          <button className="btn primary" onClick={submit}>{value ? 'Save changes' : 'Create service'}</button>
        </div>
      </div>
    </div>
  );
}
