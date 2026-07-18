import { useState } from 'react';
import type { Category } from './types';
import { ICON_OPTIONS } from './types';

type Props = {
  value: Category | null;
  nextOrder: number;
  onCancel: () => void;
  onSave: (c: Category) => void;
};

const empty: Category = {
  id: '',
  title: '',
  subtitle: '',
  icon: 'shield',
  color: '#0B6E4F',
  emergency: false,
  order: 0,
};

export function CategoryForm({ value, nextOrder, onCancel, onSave }: Props) {
  const [c, setC] = useState<Category>(value ? { ...empty, ...value } : { ...empty, order: nextOrder });
  const set = (patch: Partial<Category>) => setC((prev) => ({ ...prev, ...patch }));

  function submit() {
    if (!c.title.trim()) return alert('Title is required');
    onSave({
      ...c,
      title: c.title.trim(),
      subtitle: c.subtitle.trim(),
      order: Number(c.order) || 0,
    });
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{value ? 'Edit category' : 'New category'}</h2>
          {value && <code className="id">{value.id}</code>}
        </div>

        <div className="form-grid">
          <label className="full">
            <span>Title *</span>
            <input value={c.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Emergency" />
          </label>
          <label className="full">
            <span>Subtitle</span>
            <input value={c.subtitle} onChange={(e) => set({ subtitle: e.target.value })} placeholder="Police · Fire · Ambulance" />
          </label>

          <label>
            <span>Icon (Ionicons)</span>
            <select value={c.icon} onChange={(e) => set({ icon: e.target.value })}>
              {ICON_OPTIONS.map((i) => <option key={i} value={i}>{i}</option>)}
              {!ICON_OPTIONS.includes(c.icon) && <option value={c.icon}>{c.icon}</option>}
            </select>
          </label>

          <label>
            <span>Color</span>
            <div className="color-row">
              <input type="color" value={c.color} onChange={(e) => set({ color: e.target.value })} />
              <input value={c.color} onChange={(e) => set({ color: e.target.value })} />
            </div>
          </label>

          <label>
            <span>Order</span>
            <input type="number" value={c.order ?? 0} onChange={(e) => set({ order: Number(e.target.value) })} />
          </label>

          <label className="check">
            <input type="checkbox" checked={!!c.emergency} onChange={(e) => set({ emergency: e.target.checked })} />
            <span>Emergency category (red styling)</span>
          </label>

          <div className="full preview" style={{ borderColor: c.color }}>
            <span className="preview-icon" style={{ background: c.color + '22', color: c.color }}>◈</span>
            <div>
              <div className="strong">{c.title || 'Category title'}</div>
              <div className="muted">{c.subtitle || 'Subtitle preview'}</div>
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button className="btn ghost" onClick={onCancel}>Cancel</button>
          <button className="btn primary" onClick={submit}>{value ? 'Save changes' : 'Create category'}</button>
        </div>
      </div>
    </div>
  );
}
