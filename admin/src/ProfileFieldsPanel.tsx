import { useState } from 'react';
import type { ProfileField, ProfileFieldType } from './types';
import { saveProfileFields } from './api';

type Props = {
  value: ProfileField[];
  onSaved: (fields: ProfileField[]) => void;
};

const TYPES: { value: ProfileFieldType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Choices (select)' },
];

// Derive a stable storage key from a label, e.g. "Emergency contact" -> "emergencyContact".
function keyFromLabel(label: string): string {
  const parts = label.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  if (!parts.length) return 'field';
  return parts[0] + parts.slice(1).map((p) => p[0].toUpperCase() + p.slice(1)).join('');
}

const newField = (): ProfileField => ({ key: '', label: '', type: 'text', required: false });

export function ProfileFieldsPanel({ value, onSaved }: Props) {
  const [fields, setFields] = useState<ProfileField[]>(
    [...value].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  );
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const update = (next: ProfileField[]) => {
    setFields(next);
    setDirty(true);
  };
  const patch = (i: number, p: Partial<ProfileField>) =>
    update(fields.map((f, idx) => (idx === i ? { ...f, ...p } : f)));
  const add = () => update([...fields, newField()]);
  const remove = (i: number) => update(fields.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= fields.length) return;
    const next = [...fields];
    [next[i], next[j]] = [next[j], next[i]];
    update(next);
  };

  async function save() {
    // Validate + normalise
    const cleaned: ProfileField[] = [];
    const seen = new Set<string>();
    for (const f of fields) {
      const label = f.label.trim();
      if (!label) return alert('Every field needs a label.');
      let key = (f.key || keyFromLabel(label)).trim();
      if (seen.has(key)) key = `${key}_${cleaned.length}`;
      seen.add(key);
      const out: ProfileField = {
        key,
        label,
        type: f.type,
        required: !!f.required,
        order: cleaned.length,
      };
      if (f.placeholder?.trim()) out.placeholder = f.placeholder.trim();
      if (f.type === 'select') {
        const options = (f.options ?? []).map((o) => o.trim()).filter(Boolean);
        if (!options.length) return alert(`"${label}" is a choices field — add at least one option.`);
        out.options = options;
      }
      cleaned.push(out);
    }
    setSaving(true);
    try {
      await saveProfileFields(cleaned);
      setFields(cleaned);
      setDirty(false);
      onSaved(cleaned);
    } catch (e: any) {
      alert('Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <div className="banner">
        These fields appear in the mobile app's signup form, <strong>below</strong> the
        built-in ones (name, gender, age group, phone, blood group). Changes reach users
        the next time their app syncs.
      </div>

      <div className="toolbar">
        <div className="spacer" />
        <button className="btn" onClick={add}>+ Add field</button>
        <button className="btn primary" onClick={save} disabled={saving || !dirty}>
          {saving ? 'Saving…' : dirty ? 'Save changes' : 'Saved'}
        </button>
      </div>

      {fields.length === 0 && (
        <div className="empty">No custom fields yet. Click “Add field” to create one.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {fields.map((f, i) => (
          <div className="table" key={i} style={{ padding: 14 }}>
            <div className="form-grid" style={{ padding: 0 }}>
              <label>
                <span>Label *</span>
                <input
                  value={f.label}
                  placeholder="e.g. Emergency contact"
                  onChange={(e) =>
                    patch(i, {
                      label: e.target.value,
                      // keep key auto-synced until the user overrides it
                      key: !f.key || f.key === keyFromLabel(f.label) ? keyFromLabel(e.target.value) : f.key,
                    })
                  }
                />
              </label>
              <label>
                <span>Type</span>
                <select value={f.type} onChange={(e) => patch(i, { type: e.target.value as ProfileFieldType })}>
                  {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </label>

              <label>
                <span>Storage key</span>
                <input value={f.key} onChange={(e) => patch(i, { key: e.target.value.trim() })} placeholder="emergencyContact" />
              </label>
              <label>
                <span>Placeholder</span>
                <input value={f.placeholder ?? ''} onChange={(e) => patch(i, { placeholder: e.target.value })} />
              </label>

              {f.type === 'select' && (
                <label className="full">
                  <span>Options (comma separated)</span>
                  <input
                    value={(f.options ?? []).join(', ')}
                    onChange={(e) => patch(i, { options: e.target.value.split(',').map((o) => o.trimStart()) })}
                    placeholder="Yes, No, Maybe"
                  />
                </label>
              )}

              <label className="check">
                <input type="checkbox" checked={!!f.required} onChange={(e) => patch(i, { required: e.target.checked })} />
                <span>Required</span>
              </label>

              <div className="full" style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                <button className="btn small" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                <button className="btn small" onClick={() => move(i, 1)} disabled={i === fields.length - 1}>↓</button>
                <button className="btn small danger" onClick={() => remove(i)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
