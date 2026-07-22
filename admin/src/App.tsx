import { useEffect, useMemo, useState } from 'react';
import type { Category, Service, ProfileField } from './types';
import {
  fetchBootstrap,
  createCategory,
  updateCategory,
  deleteCategory,
  createService,
  updateService,
  deleteService,
  getConfig,
  checkHealth,
} from './api';
import { ServiceForm } from './ServiceForm';
import { CategoryForm } from './CategoryForm';
import { ProfileFieldsPanel } from './ProfileFieldsPanel';
import { SettingsModal } from './Settings';

type Tab = 'services' | 'categories' | 'signup';

export default function App() {
  const [tab, setTab] = useState<Tab>('services');
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [profileFields, setProfileFields] = useState<ProfileField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState<boolean | null>(null);
  const [query, setQuery] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const [editingService, setEditingService] = useState<Service | 'new' | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | 'new' | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Theme (light/dark) — persisted, defaults to the OS preference.
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('seva.theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('seva.theme', theme);
  }, [theme]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBootstrap();
      setCategories(data.categories.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      setServices(data.services.sort((a, b) => a.name.localeCompare(b.name)));
      setProfileFields(data.profileFields ?? []);
      setOnline(true);
    } catch (e: any) {
      setError(e.message);
      setOnline(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const { apiUrl, adminKey } = getConfig();
    if (!apiUrl || !adminKey) {
      setShowSettings(true);
      setLoading(false);
    } else {
      load();
    }
    checkHealth().then(setOnline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const catName = (id: string) => categories.find((c) => c.id === id)?.title ?? id;

  const filteredServices = useMemo(() => {
    const q = query.trim().toLowerCase();
    return services.filter((s) => {
      if (filterCat && s.categoryId !== filterCat) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.department ?? '').toLowerCase().includes(q) ||
        (s.keywords ?? []).join(' ').toLowerCase().includes(q)
      );
    });
  }, [services, query, filterCat]);

  // ---- Service handlers ----
  async function saveService(s: Service) {
    try {
      if (editingService === 'new') {
        const { item } = await createService(s);
        setServices((prev) => [...prev, item].sort((a, b) => a.name.localeCompare(b.name)));
      } else {
        const { item } = await updateService(s.id, s);
        setServices((prev) =>
          prev.map((x) => (x.id === item.id ? item : x)).sort((a, b) => a.name.localeCompare(b.name))
        );
      }
      setEditingService(null);
    } catch (e: any) {
      alert('Save failed: ' + e.message);
    }
  }
  async function removeService(s: Service) {
    if (!confirm(`Delete service "${s.name}"?`)) return;
    try {
      await deleteService(s.id);
      setServices((prev) => prev.filter((x) => x.id !== s.id));
    } catch (e: any) {
      alert('Delete failed: ' + e.message);
    }
  }

  // ---- Category handlers ----
  async function saveCategory(c: Category) {
    try {
      if (editingCategory === 'new') {
        const { item } = await createCategory(c);
        setCategories((prev) => [...prev, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
      } else {
        const { item } = await updateCategory(c.id, c);
        setCategories((prev) =>
          prev.map((x) => (x.id === item.id ? item : x)).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        );
      }
      setEditingCategory(null);
    } catch (e: any) {
      alert('Save failed: ' + e.message);
    }
  }
  async function removeCategory(c: Category) {
    const count = services.filter((s) => s.categoryId === c.id).length;
    const warn = count ? `\n\n⚠ ${count} service(s) use this category and will be orphaned.` : '';
    if (!confirm(`Delete category "${c.title}"?${warn}`)) return;
    try {
      await deleteCategory(c.id);
      setCategories((prev) => prev.filter((x) => x.id !== c.id));
    } catch (e: any) {
      alert('Delete failed: ' + e.message);
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">◈</span>
          <div>
            <h1>SevaApp Admin</h1>
            <div className="sub">Manage categories & services · DynamoDB</div>
          </div>
        </div>
        <div className="topbar-right">
          <span className={`status ${online ? 'ok' : online === false ? 'bad' : ''}`}>
            <span className="dot" /> {online == null ? 'checking' : online ? 'connected' : 'offline'}
          </span>
          <button
            className="btn ghost icon-btn"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? '☀' : '🌙'}
          </button>
          <button className="btn ghost" onClick={load}>↻ Refresh</button>
          <button className="btn ghost" onClick={() => setShowSettings(true)}>⚙ Settings</button>
        </div>
      </header>

      <div className="tabs">
        <button className={tab === 'services' ? 'tab active' : 'tab'} onClick={() => setTab('services')}>
          Services <span className="count">{services.length}</span>
        </button>
        <button className={tab === 'categories' ? 'tab active' : 'tab'} onClick={() => setTab('categories')}>
          Categories <span className="count">{categories.length}</span>
        </button>
        <button className={tab === 'signup' ? 'tab active' : 'tab'} onClick={() => setTab('signup')}>
          Signup form <span className="count">{profileFields.length}</span>
        </button>
      </div>

      {error && <div className="banner error">⚠ {error} <button onClick={load}>retry</button></div>}
      {loading && <div className="banner">Loading…</div>}

      {tab === 'services' && !loading && (
        <section>
          <div className="toolbar">
            <input
              className="search"
              placeholder="Search services…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <div className="spacer" />
            <button className="btn primary" onClick={() => setEditingService('new')}>+ New service</button>
          </div>

          <div className="table">
            <div className="tr th">
              <div className="td name">Name</div>
              <div className="td">Category</div>
              <div className="td">Scope</div>
              <div className="td">Phones</div>
              <div className="td flags">Flags</div>
              <div className="td actions">Actions</div>
            </div>
            {filteredServices.map((s) => (
              <div className="tr" key={s.id}>
                <div className="td name">
                  <div className="strong">{s.name}</div>
                  <div className="muted">{s.department}</div>
                </div>
                <div className="td"><span className="chip">{catName(s.categoryId)}</span></div>
                <div className="td">
                  <span className={`chip ${s.scope === 'national' ? 'blue' : 'amber'}`}>{s.scope}</span>
                  {s.district ? <div className="muted">{s.district}</div> : null}
                </div>
                <div className="td">{(s.phones ?? []).map((p) => p.number).join(', ') || '—'}</div>
                <div className="td flags">
                  {s.emergency && <span className="chip red">SOS</span>}
                  {s.femaleOnly && <span className="chip pink">Women</span>}
                </div>
                <div className="td actions">
                  <button className="btn small" onClick={() => setEditingService(s)}>Edit</button>
                  <button className="btn small danger" onClick={() => removeService(s)}>Delete</button>
                </div>
              </div>
            ))}
            {filteredServices.length === 0 && <div className="empty">No services match.</div>}
          </div>
        </section>
      )}

      {tab === 'categories' && !loading && (
        <section>
          <div className="toolbar">
            <div className="spacer" />
            <button className="btn primary" onClick={() => setEditingCategory('new')}>+ New category</button>
          </div>
          <div className="table">
            <div className="tr th">
              <div className="td">Order</div>
              <div className="td name">Title</div>
              <div className="td">Icon</div>
              <div className="td">Color</div>
              <div className="td">Services</div>
              <div className="td actions">Actions</div>
            </div>
            {categories.map((c) => (
              <div className="tr" key={c.id}>
                <div className="td">{c.order ?? 0}</div>
                <div className="td name">
                  <div className="strong">{c.title}</div>
                  <div className="muted">{c.subtitle}</div>
                </div>
                <div className="td"><code>{c.icon}</code></div>
                <div className="td">
                  <span className="swatch" style={{ background: c.color }} /> {c.color}
                </div>
                <div className="td">{services.filter((s) => s.categoryId === c.id).length}</div>
                <div className="td actions">
                  <button className="btn small" onClick={() => setEditingCategory(c)}>Edit</button>
                  <button className="btn small danger" onClick={() => removeCategory(c)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {tab === 'signup' && !loading && (
        <ProfileFieldsPanel value={profileFields} onSaved={setProfileFields} />
      )}

      {editingService && (
        <ServiceForm
          value={editingService === 'new' ? null : editingService}
          categories={categories}
          onCancel={() => setEditingService(null)}
          onSave={saveService}
        />
      )}
      {editingCategory && (
        <CategoryForm
          value={editingCategory === 'new' ? null : editingCategory}
          nextOrder={categories.length}
          onCancel={() => setEditingCategory(null)}
          onSave={saveCategory}
        />
      )}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSaved={() => {
            setShowSettings(false);
            load();
            checkHealth().then(setOnline);
          }}
        />
      )}
    </div>
  );
}
