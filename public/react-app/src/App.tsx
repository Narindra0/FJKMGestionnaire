import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { LayoutDashboard, Users, ArrowDownToLine, ArrowUpFromLine, HandCoins, HeartHandshake, FolderKanban, FileBarChart, ShieldCheck, ClipboardList, Menu, LogOut, ChevronRight, Check, X, Search, Bell, Plus, Download, Filter, CalendarDays, TrendingUp, CircleDollarSign, WalletCards, MoreHorizontal, Settings, FileText, ArrowDownLeft, ArrowUpRight, UserRound, BookOpen } from 'lucide-react';
import './index.css';

// Types
type Role = 'ADMIN' | 'USER' | 'VISITEUR';
type ModuleKey = 'dashboard' | 'entrees' | 'sorties' | 'fideles' | 'obligations' | 'communion' | 'projects' | 'reports' | 'users' | 'imports' | 'logs';

// API client
const API_BASE = import.meta.env.MODE === 'development' ? 'http://localhost:8000/api' : '/api';

const api = {
  login: async (identifier: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Erreur de connexion');
    return data;
  },
  logout: async () => {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
  },
  me: async () => {
    const res = await fetch(`${API_BASE}/auth/me`);
    if (!res.ok) return null;
    return await res.json();
  },
  dashboardStats: async () => {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    return await res.json();
  },
  fideles: async (page = 1, search = '') => {
    const res = await fetch(`${API_BASE}/fideles?page=${page}&search=${encodeURIComponent(search)}`);
    return await res.json();
  },
  fidelCreate: async (data: any) => {
    const res = await fetch(`${API_BASE}/fideles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  },
  fidelUpdate: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE}/fideles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  },
  fidelDelete: async (id: number) => {
    const res = await fetch(`${API_BASE}/fideles/${id}`, { method: 'DELETE' });
    return await res.json();
  },
  obligations: async (page = 1, search = '', status = '', month = 0, year = 0) => {
    const params = new URLSearchParams({ page: String(page), search, status, month: String(month), year: String(year) });
    const res = await fetch(`${API_BASE}/obligations?${params}`);
    return await res.json();
  },
  obligationCreate: async (data: any) => {
    const res = await fetch(`${API_BASE}/obligations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  },
  obligationUpdate: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE}/obligations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  },
  obligationDelete: async (id: number) => {
    const res = await fetch(`${API_BASE}/obligations/${id}`, { method: 'DELETE' });
    return await res.json();
  },
  communion: async (page = 1, year = 0, month = 0) => {
    const params = new URLSearchParams({ page: String(page), year: String(year), month: String(month) });
    const res = await fetch(`${API_BASE}/communion?${params}`);
    return await res.json();
  },
  communionCreate: async (data: any) => {
    const res = await fetch(`${API_BASE}/communion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  },
  communionDelete: async (id: number) => {
    const res = await fetch(`${API_BASE}/communion/${id}`, { method: 'DELETE' });
    return await res.json();
  },
  projects: async () => {
    const res = await fetch(`${API_BASE}/projects`);
    return await res.json();
  },
  projectCreate: async (data: any) => {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  },
  projectPayment: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE}/projects/${id}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await res.json();
  },
  logs: async (page = 1, search = '') => {
    const res = await fetch(`${API_BASE}/logs?page=${page}&search=${encodeURIComponent(search)}`);
    return await res.json();
  },
  users: async () => {
    const res = await fetch(`${API_BASE}/users`);
    return await res.json();
  },
  entries: async (page = 1, search = '') => {
    const res = await fetch(`${API_BASE}/entries?page=${page}&search=${encodeURIComponent(search)}`);
    return await res.json();
  },
  exits: async (page = 1, search = '') => {
    const res = await fetch(`${API_BASE}/exits?page=${page}&search=${encodeURIComponent(search)}`);
    return await res.json();
  },
};

// Navigation
const navSections = [
  { title: 'Vue d\'ensemble', items: [{ key: 'dashboard' as ModuleKey, label: 'Tableau de bord', icon: LayoutDashboard }] },
  { title: 'Gestion financière', items: [
    { key: 'entrees' as ModuleKey, label: 'Entrées', icon: ArrowDownToLine },
    { key: 'sorties' as ModuleKey, label: 'Sorties', icon: ArrowUpFromLine },
    { key: 'obligations' as ModuleKey, label: 'Obligations', icon: HandCoins },
    { key: 'communion' as ModuleKey, label: 'Communion', icon: HeartHandshake },
    { key: 'projects' as ModuleKey, label: 'Projets', icon: FolderKanban }
  ]},
  { title: 'Vie de l\'église', items: [
    { key: 'fideles' as ModuleKey, label: 'Chrétiens', icon: Users },
    { key: 'reports' as ModuleKey, label: 'Rapports', icon: FileBarChart }
  ]},
  { title: 'Administration', items: [
    { key: 'users' as ModuleKey, label: 'Utilisateurs', icon: ShieldCheck },
    { key: 'imports' as ModuleKey, label: 'Importation', icon: Settings },
    { key: 'logs' as ModuleKey, label: 'Journal d\'activité', icon: ClipboardList }
  ]},
];

// Components
function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? 'brand-compact' : ''}`}>
      <div className="brand-mark">
        <span>F</span><span>J</span><span>K</span><span>M</span>
      </div>
      {!compact && (
        <div>
          <strong>FJKM</strong>
          <small>GESTIONNAIRE</small>
        </div>
      )}
    </div>
  );
}

function IconButton({ label, children, onClick }: { label: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button className="icon-button" aria-label={label} onClick={onClick}>
      {children}
    </button>
  );
}

// Login Page
function LoginPage({ onLogin }: { onLogin: (user: any) => void }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setLoading(true);
    try {
      const data = await api.login(identifier, password);
      onLogin(data.user);
      toast.success('Connexion réussie');
    } catch (err: any) {
      toast.error(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-visual">
        <div className="login-orbit orbit-one" />
        <div className="login-orbit orbit-two" />
        <div className="login-visual-content">
          <Logo />
          <span className="eyebrow light">Registre communautaire</span>
          <h1>Une gestion claire pour une communauté engagée.</h1>
          <p>Suivez les obligations, les contributions et les projets de FJKM Malaza Gileada dans un même espace de confiance.</p>
        </div>
        <div className="login-visual-footer">FJKM MALAZA GILEADA · ANTANANARIVO</div>
      </div>
      <div className="login-panel">
        <div className="mobile-login-logo"><Logo /></div>
        <div className="login-card">
          <span className="eyebrow">Espace sécurisé</span>
          <h2>Connexion</h2>
          <p className="muted">Accédez à votre registre de gestion.</p>
          <form onSubmit={handleSubmit} className="form-stack">
            <label>
              Matricule, nom ou adresse email
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Ex. ADMIN-001"
                required
              />
            </label>
            <label>
              Mot de passe
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </label>
            <button className="button button-primary button-large" type="submit" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'} <ChevronRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Sidebar
function Sidebar({ active, onNavigate, role, mobileOpen, onClose }: {
  active: ModuleKey;
  onNavigate: (key: ModuleKey) => void;
  role: Role;
  mobileOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <div className={`sidebar-backdrop ${mobileOpen ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <Logo />
          <IconButton label="Fermer le menu" onClick={onClose}><X size={18} /></IconButton>
        </div>
        <div className="workspace-switcher">
          <div className="workspace-seal">MG</div>
          <div><strong>Malaza Gileada</strong><small>Paroisse principale</small></div>
        </div>
        <nav>
          {navSections.map(section => (
            <div className="nav-section" key={section.title}>
              <span className="nav-section-title">{section.title}</span>
              {section.items.map(item => {
                const Icon = item.icon;
                const disabled = role === 'VISITEUR' && ['entrees', 'sorties', 'obligations', 'communion', 'projects', 'users', 'imports', 'logs'].includes(item.key);
                return (
                  <button
                    key={item.key}
                    className={`nav-item ${active === item.key ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                    onClick={() => {
                      if (disabled) {
                        toast.error('Votre rôle est limité à la consultation.');
                        return;
                      }
                      onNavigate(item.key);
                      onClose();
                    }}
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                    {active === item.key && <span className="nav-indicator" />}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-footer">
            <span>v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}

// Topbar
function Topbar({ active, role, onMenu, onLogout }: {
  active: ModuleKey;
  role: Role;
  onMenu: () => void;
  onLogout: () => void;
}) {
  const label = navSections.flatMap(section => section.items).find(item => item.key === active)?.label ?? 'Tableau de bord';
  return (
    <header className="topbar">
      <div className="topbar-left">
        <IconButton label="Ouvrir le menu" onClick={onMenu}><Menu size={21} /></IconButton>
        <div className="breadcrumbs">
          <span>FJKM Gestionnaire</span>
          <ChevronRight size={14} />
          <strong>{label}</strong>
        </div>
      </div>
      <div className="topbar-actions">
        <IconButton label="Notifications" onClick={() => toast.info('Aucune nouvelle notification')}>
          <Bell size={18} />
        </IconButton>
        <button className="logout-button" onClick={onLogout} title="Se déconnecter">
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}

// Dashboard Page
function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboardStats().then(data => {
      setStats(data);
      setLoading(false);
    }).catch(err => {
      toast.error('Erreur lors du chargement du dashboard');
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="panel">Chargement...</div>;

  const formatMGA = (value: number) => `${new Intl.NumberFormat('fr-FR').format(value)} Ar`;
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const chartData = stats?.series ? months.map((month, index) => ({
    month,
    entries: stats.series.entries?.[index] || 0,
    exits: stats.series.exits?.[index] || 0
  })) : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">FJKM MALAZA GILEADA</span>
          <h1>Tableau de bord</h1>
          <p className="page-description">La trésorerie et les activités de votre paroisse en un regard.</p>
        </div>
        <div className="page-header-actions">
          <button className="button button-secondary" onClick={() => toast.success('Export préparé')}>
            <Download size={16} />Exporter
          </button>
        </div>
      </div>

      <div className="dashboard-toolbar">
        <div className="period-label">
          <CalendarDays size={16} />
          <span>Période analysée</span>
          <strong>01 — 31 octobre 2026</strong>
        </div>
      </div>

      {stats && (
        <>
          <div className="metrics-grid">
            <div className="metric-card metric-gold">
              <div className="metric-card-top">
                <span>Entrées générales</span>
                <span className="metric-icon"><ArrowDownToLine size={18} /></span>
              </div>
              <strong>{formatMGA(stats.totals.entries)}</strong>
              <div className="metric-helper">
                <span className="trend-positive"><TrendingUp size={13} />+8,5 %</span>
                <span>vs. mois dernier</span>
              </div>
            </div>
            <div className="metric-card metric-coral">
              <div className="metric-card-top">
                <span>Sorties générales</span>
                <span className="metric-icon"><ArrowUpFromLine size={18} /></span>
              </div>
              <strong>{formatMGA(stats.totals.exits)}</strong>
              <div className="metric-helper">32 opérations ce mois</div>
            </div>
            <div className="metric-card metric-navy">
              <div className="metric-card-top">
                <span>Reste général</span>
                <span className="metric-icon"><WalletCards size={18} /></span>
              </div>
              <strong>{formatMGA(stats.totals.balance)}</strong>
              <div className="metric-helper">
                <span className="trend-positive"><TrendingUp size={13} />+12,4 %</span>
                <span>Solde disponible</span>
              </div>
            </div>
            <div className="metric-card metric-green">
              <div className="metric-card-top">
                <span>Entrées communion</span>
                <span className="metric-icon"><HeartHandshake size={18} /></span>
              </div>
              <strong>{formatMGA(stats.communionTotals?.entries || 0)}</strong>
              <div className="metric-helper">
                <span className="trend-positive"><TrendingUp size={13} />+5,2 %</span>
                <span>128 paiements</span>
              </div>
            </div>
            <div className="metric-card metric-blue">
              <div className="metric-card-top">
                <span>Chrétiens actifs</span>
                <span className="metric-icon"><Users size={18} /></span>
              </div>
              <strong>284</strong>
              <div className="metric-helper">
                <span className="trend-positive"><TrendingUp size={13} />+4,4 %</span>
                <span>+12 ce trimestre</span>
              </div>
            </div>
            <div className="metric-card metric-purple">
              <div className="metric-card-top">
                <span>Obligations à suivre</span>
                <span className="metric-icon"><HandCoins size={18} /></span>
              </div>
              <strong>38</strong>
              <div className="metric-helper">12 paiements partiels</div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="panel chart-panel chart-wide">
              <div className="panel-header">
                <div>
                  <span className="eyebrow">Flux financiers</span>
                  <h2>Évolution mensuelle</h2>
                </div>
                <div className="legend">
                  <span><i className="legend-dot entries" />Entrées</span>
                  <span><i className="legend-dot exits" />Sorties</span>
                </div>
              </div>
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8f938f' }}>
                <p>Graphique Chart.js à implémenter</p>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <div>
                  <span className="eyebrow">Activités récentes</span>
                  <h2>8 dernières actions</h2>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: ArrowDownToLine, tone: 'gold', title: 'Entrée enregistrée', detail: 'Obligation mensuelle — Octobre', meta: 'Il y a 2h' },
                  { icon: HeartHandshake, tone: 'green', title: 'Paiement communion', detail: 'Octobre 2026 — 15 000 Ar', meta: 'Il y a 3h' },
                  { icon: ArrowUpFromLine, tone: 'coral', title: 'Sortie enregistrée', detail: 'Achat fournitures — 180 000 Ar', meta: 'Il y a 5h' },
                  { icon: Users, tone: 'blue', title: 'Nouveau chrétien', detail: 'Ravelomanana Soa ajouté', meta: 'Hier' },
                ].map((activity, i) => (
                  <div key={i} className="activity-item">
                    <div className={`activity-icon activity-${activity.tone}`}>
                      <activity.icon size={16} />
                    </div>
                    <div className="activity-copy">
                      <strong>{activity.title}</strong>
                      <span>{activity.detail}</span>
                    </div>
                    <time>{activity.meta}</time>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Placeholder pages
function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
      <div className="panel">
        <p>Cette page sera implémentée prochainement.</p>
      </div>
    </div>
  );
}

// Fideles Page (Chrétiens)
function FidelesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await api.fideles(page, search);
      setData(result);
    } catch (err) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const result = await api.fidelUpdate(editingId, formData);
        if (!result.success) throw new Error(result.message || 'Erreur');
        toast.success('Chrétien modifié');
      } else {
        const result = await api.fidelCreate(formData);
        if (!result.success) throw new Error(result.message || 'Erreur');
        toast.success('Chrétien créé');
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({});
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (row: any) => {
    setEditingId(row.id);
    setFormData(row);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce chrétien ?')) return;
    try {
      const result = await api.fidelDelete(id);
      if (!result.success) throw new Error(result.message || 'Erreur');
      toast.success('Chrétien supprimé');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'green' : 'purple';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">VIE DE L'ÉGLISE</span>
          <h1>Chrétiens</h1>
          <p className="page-description">Une fiche fiable pour chaque membre de la communauté.</p>
        </div>
        <div className="page-header-actions">
          <button className="button button-primary" onClick={() => { setEditingId(null); setFormData({}); setShowModal(true); }}>
            <Plus size={17} />Nouveau chrétien
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-leading">
          <Filter size={16} />
          <span>Filtres</span>
        </div>
        <label className="inline-search">
          <Search size={16} />
          <input
            placeholder="Matricule, nom, groupe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      <div className="member-overview">
        <div className="member-count">
          <span className="count-orb"><Users size={21} /></span>
          <div>
            <strong>{data?.pagination?.total || 0}</strong>
            <span>chrétiens enregistrés</span>
          </div>
        </div>
        <div className="member-mini-stats">
          <div><span>Actifs</span><strong>{data?.data?.filter((f: any) => f.status === 'active').length || 0}</strong></div>
          <div><span>Nouveaux ce mois</span><strong>12</strong></div>
          <div><span>Groupes</span><strong>18</strong></div>
        </div>
      </div>

      {loading ? (
        <div className="panel">Chargement...</div>
      ) : (
        <div className="panel table-panel">
          <div className="table-header">
            <div>
              <span className="eyebrow">Registre paroissial</span>
              <h2>Liste des chrétiens</h2>
            </div>
            <span className="table-total">{data?.pagination?.total || 0} lignes</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Chrétien</th>
                  <th>Matricule</th>
                  <th>Groupe</th>
                  <th>Téléphone</th>
                  <th>Baptême</th>
                  <th>Communion</th>
                  <th>Statut</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((row: any) => (
                  <tr key={row.id}>
                    <td>
                      <div className="person-cell">
                        <div className={`avatar avatar-${getStatusColor(row.status)}`}>
                          {getInitials(row.full_name)}
                        </div>
                        <div>
                          <strong>{row.full_name}</strong>
                          <span className="mono">{row.gender === 'M' ? 'Homme' : 'Femme'}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="mono ref">{row.matricule}</span></td>
                    <td>{row.group_name || '-'}</td>
                    <td>{row.phone || '-'}</td>
                    <td>{row.baptized_at || '-'}</td>
                    <td>{row.communion_at || '-'}</td>
                    <td>
                      <span className={`status status-${row.status === 'active' ? 'payé' : 'impayé'}`}>
                        {row.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>
                      <IconButton label="Options" onClick={() => handleEdit(row)}>
                        <MoreHorizontal size={17} />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data?.pagination && data.pagination.pages > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
              <button
                className="button button-secondary"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Précédent
              </button>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: 11 }}>
                Page {page} / {data.pagination.pages}
              </span>
              <button
                className="button button-secondary"
                disabled={page === data.pagination.pages}
                onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => { setShowModal(false); setEditingId(null); setFormData({}); }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">NOUVEL ENREGISTREMENT</span>
                <h2>{editingId ? 'Modifier chrétien' : 'Nouveau chrétien'}</h2>
              </div>
              <IconButton label="Fermer" onClick={() => { setShowModal(false); setEditingId(null); setFormData({}); }}>
                <X size={18} />
              </IconButton>
            </div>
            <form className="modal-body" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  Nom complet
                  <input
                    value={formData.full_name || ''}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Matricule
                  <input
                    value={formData.matricule || ''}
                    onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Groupe
                  <input
                    value={formData.group_name || ''}
                    onChange={(e) => setFormData({ ...formData, group_name: e.target.value })}
                  />
                </label>
                <label>
                  Téléphone
                  <input
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </label>
                <label>
                  Date de naissance
                  <input
                    type="date"
                    value={formData.birth_date || ''}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  />
                </label>
                <label>
                  Statut
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </label>
                <label>
                  Date de baptême
                  <input
                    type="date"
                    value={formData.baptized_at || ''}
                    onChange={(e) => setFormData({ ...formData, baptized_at: e.target.value })}
                  />
                </label>
                <label>
                  Date de communion
                  <input
                    type="date"
                    value={formData.communion_at || ''}
                    onChange={(e) => setFormData({ ...formData, communion_at: e.target.value })}
                  />
                </label>
                <label className="full-span">
                  Adresse
                  <textarea
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="button button-secondary" onClick={() => { setShowModal(false); setEditingId(null); setFormData({}); }}>
                  Annuler
                </button>
                <button type="submit" className="button button-primary">
                  <Check size={16} />Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Obligations Page
function ObligationsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const currentYear = new Date().getFullYear();

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await api.obligations(page, search, status, 0, currentYear);
      setData(result);
    } catch (err) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, search, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await api.obligationCreate(formData);
      if (!result.success) throw new Error(result.message || 'Erreur');
      toast.success('Obligation enregistrée');
      setShowModal(false);
      setFormData({});
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette obligation ?')) return;
    try {
      const result = await api.obligationDelete(id);
      if (!result.success) throw new Error(result.message || 'Erreur');
      toast.success('Obligation supprimée');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression');
    }
  };

  const formatMGA = (value: number) => `${new Intl.NumberFormat('fr-FR').format(value)} Ar`;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid': return 'status-payé';
      case 'partial': return 'status-partiel';
      default: return 'status-impayé';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Payé';
      case 'partial': return 'Partiel';
      default: return 'Impayé';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">GESTION FINANCIÈRE</span>
          <h1>Obligations</h1>
          <p className="page-description">Suivez chaque obligation mensuelle et les paiements partiels.</p>
        </div>
        <div className="page-header-actions">
          <button className="button button-primary" onClick={() => setShowModal(true)}>
            <Plus size={17} />Enregistrer un paiement
          </button>
        </div>
      </div>

      <div className="notice-card">
        <div className="notice-icon"><Settings size={17} /></div>
        <div>
          <strong>Montant par défaut des obligations</strong>
          <span>30 000 Ar · Modifiable par un administrateur dans les paramètres.</span>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-leading">
          <Filter size={16} />
          <span>Filtres</span>
        </div>
        <label className="filter-select">
          <CalendarDays size={15} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="paid">Payé</option>
            <option value="partial">Partiel</option>
            <option value="unpaid">Impayé</option>
          </select>
        </label>
        <label className="inline-search">
          <Search size={16} />
          <input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      {loading ? (
        <div className="panel">Chargement...</div>
      ) : (
        <div className="panel table-panel">
          <div className="table-header">
            <div>
              <span className="eyebrow">{currentYear}</span>
              <h2>Obligations enregistrées</h2>
            </div>
            <span className="table-total">{data?.pagination?.total || 0} lignes</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Chrétien</th>
                  <th>Période</th>
                  <th>Montant dû</th>
                  <th>Payé</th>
                  <th>Reste</th>
                  <th>Statut</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((row: any) => (
                  <tr key={row.id}>
                    <td>
                      <div className="person-cell compact">
                        <div className="avatar avatar-navy">
                          {row.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <strong>{row.full_name}</strong>
                          <span className="mono">{row.matricule}</span>
                        </div>
                      </div>
                    </td>
                    <td>{row.period_name}</td>
                    <td>{formatMGA(row.amount_due)}</td>
                    <td>{formatMGA(row.amount_paid)}</td>
                    <td className="coral-text">{formatMGA(row.rest_amount || (row.amount_due - row.amount_paid))}</td>
                    <td>
                      <span className={`status ${getStatusStyle(row.status)}`}>
                        {getStatusLabel(row.status)}
                      </span>
                    </td>
                    <td>
                      <IconButton label="Options" onClick={() => handleDelete(row.id)}>
                        <MoreHorizontal size={17} />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data?.pagination && data.pagination.pages > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
              <button
                className="button button-secondary"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Précédent
              </button>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: 11 }}>
                Page {page} / {data.pagination.pages}
              </span>
              <button
                className="button button-secondary"
                disabled={page === data.pagination.pages}
                onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => { setShowModal(false); setFormData({}); }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">NOUVEL ENREGISTREMENT</span>
                <h2>Enregistrer un paiement d'obligation</h2>
              </div>
              <IconButton label="Fermer" onClick={() => { setShowModal(false); setFormData({}); }}>
                <X size={18} />
              </IconButton>
            </div>
            <form className="modal-body" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  Chrétien (ID)
                  <input
                    type="number"
                    value={formData.fidel_id || ''}
                    onChange={(e) => setFormData({ ...formData, fidel_id: parseInt(e.target.value) })}
                    required
                  />
                </label>
                <label>
                  Mois
                  <select
                    value={formData.period_month || ''}
                    onChange={(e) => setFormData({ ...formData, period_month: parseInt(e.target.value) })}
                    required
                  >
                    <option value="">Sélectionner</option>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                      <option key={m} value={m}>{['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'][m-1]}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Année
                  <input
                    type="number"
                    value={formData.period_year || currentYear}
                    onChange={(e) => setFormData({ ...formData, period_year: parseInt(e.target.value) })}
                    required
                  />
                </label>
                <label>
                  Montant dû
                  <input
                    type="number"
                    value={formData.amount_due || 30000}
                    onChange={(e) => setFormData({ ...formData, amount_due: parseFloat(e.target.value) })}
                    required
                  />
                </label>
                <label>
                  Montant payé maintenant
                  <input
                    type="number"
                    value={formData.amount_paid || ''}
                    onChange={(e) => setFormData({ ...formData, amount_paid: parseFloat(e.target.value) })}
                    required
                  />
                </label>
                <label>
                  Date de paiement
                  <input
                    type="date"
                    value={formData.payment_date || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    required
                  />
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="button button-secondary" onClick={() => { setShowModal(false); setFormData({}); }}>
                  Annuler
                </button>
                <button type="submit" className="button button-primary">
                  <Check size={16} />Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Communion Page
function CommunionPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await api.communion(page, year, month);
      setData(result);
    } catch (err) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, year, month]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await api.communionCreate(formData);
      if (!result.success) throw new Error(result.message || 'Erreur');
      toast.success(result.message || 'Paiement(s) enregistré(s)');
      setShowModal(false);
      setFormData({});
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) return;
    try {
      const result = await api.communionDelete(id);
      if (!result.success) throw new Error(result.message || 'Erreur');
      toast.success('Paiement supprimé');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression');
    }
  };

  const formatMGA = (value: number) => `${new Intl.NumberFormat('fr-FR').format(value)} Ar`;

  const toggleMonth = (m: number) => {
    const currentMonths = formData.months || [];
    if (currentMonths.includes(m)) {
      setFormData({ ...formData, months: currentMonths.filter((x: number) => x !== m) });
    } else {
      setFormData({ ...formData, months: [...currentMonths, m] });
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">GESTION FINANCIÈRE</span>
          <h1>Communion</h1>
          <p className="page-description">Enregistrez les participations mensuelles avec une traçabilité par mois.</p>
        </div>
        <div className="page-header-actions">
          <button className="button button-primary" onClick={() => setShowModal(true)}>
            <Plus size={17} />Nouveau paiement
          </button>
        </div>
      </div>

      <div className="communion-hero">
        <div className="communion-orb"><HeartHandshake size={25} /></div>
        <div>
          <span className="eyebrow light">Collecte communion · {year}</span>
          <h2>{formatMGA(data?.data?.reduce((sum: number, row: any) => sum + row.amount, 0) || 0)}</h2>
          <p>{data?.pagination?.total || 0} paiements</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-leading">
          <Filter size={16} />
          <span>Filtres</span>
        </div>
        <label className="filter-select">
          <CalendarDays size={15} />
          <select value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </label>
        <label className="filter-select">
          <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
            <option value={0}>Tous les mois</option>
            {months.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <div className="panel">Chargement...</div>
      ) : (
        <div className="panel table-panel">
          <div className="table-header">
            <div>
              <span className="eyebrow">Historique des paiements</span>
              <h2>Entrées communion</h2>
            </div>
            <span className="table-total">{data?.pagination?.total || 0} lignes</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Chrétien</th>
                  <th>Mois payé</th>
                  <th>Référence</th>
                  <th>Mode</th>
                  <th className="align-right">Montant</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((row: any) => (
                  <tr key={row.id}>
                    <td>{row.payment_date}</td>
                    <td>
                      <div className="person-cell compact">
                        <div className="avatar avatar-green">
                          {row.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                        </div>
                        <strong>{row.full_name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="month-chip">
                        {months[row.paid_month - 1]} {row.paid_year}
                      </span>
                    </td>
                    <td><span className="mono ref">{row.reference}</span></td>
                    <td>{row.payment_method}</td>
                    <td className="align-right amount">{formatMGA(row.amount)}</td>
                    <td>
                      <IconButton label="Options" onClick={() => handleDelete(row.id)}>
                        <MoreHorizontal size={17} />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data?.pagination && data.pagination.pages > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
              <button
                className="button button-secondary"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Précédent
              </button>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: 11 }}>
                Page {page} / {data.pagination.pages}
              </span>
              <button
                className="button button-secondary"
                disabled={page === data.pagination.pages}
                onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => { setShowModal(false); setFormData({}); }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">NOUVEL ENREGISTREMENT</span>
                <h2>Paiement communion</h2>
              </div>
              <IconButton label="Fermer" onClick={() => { setShowModal(false); setFormData({}); }}>
                <X size={18} />
              </IconButton>
            </div>
            <form className="modal-body" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  Chrétien (ID)
                  <input
                    type="number"
                    value={formData.fidel_id || ''}
                    onChange={(e) => setFormData({ ...formData, fidel_id: parseInt(e.target.value) })}
                    required
                  />
                </label>
                <label>
                  Année
                  <input
                    type="number"
                    value={formData.year || year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    required
                  />
                </label>
                <label>
                  Montant par mois
                  <input
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    required
                  />
                </label>
                <label>
                  Mode de paiement
                  <select
                    value={formData.payment_method || 'Espèces'}
                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  >
                    <option>Espèces</option>
                    <option>Mobile Money</option>
                    <option>Virement</option>
                  </select>
                </label>
                <label className="full-span">
                  Date de paiement
                  <input
                    type="date"
                    value={formData.payment_date || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    required
                  />
                </label>
                <fieldset className="full-span month-fieldset">
                  <legend>Mois concernés (sélection multiple)</legend>
                  <div className="month-grid">
                    {months.map((m, i) => (
                      <label key={i}>
                        <input
                          type="checkbox"
                          checked={(formData.months || []).includes(i + 1)}
                          onChange={() => toggleMonth(i + 1)}
                        />
                        {m}
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
              <div className="modal-footer">
                <button type="button" className="button button-secondary" onClick={() => { setShowModal(false); setFormData({}); }}>
                  Annuler
                </button>
                <button type="submit" className="button button-primary">
                  <Check size={16} />Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Projects Page
function ProjectsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [projectFormData, setProjectFormData] = useState<any>({});
  const [paymentFormData, setPaymentFormData] = useState<any>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await api.projects();
      setData(result);
    } catch (err) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await api.projectCreate(projectFormData);
      if (!result.success) throw new Error(result.message || 'Erreur');
      toast.success('Projet créé');
      setShowProjectModal(false);
      setProjectFormData({});
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création');
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await api.projectPayment(selectedProject.id, paymentFormData);
      if (!result.success) throw new Error(result.message || 'Erreur');
      toast.success('Paiement enregistré');
      setShowPaymentModal(false);
      setPaymentFormData({});
      setSelectedProject(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du paiement');
    }
  };

  const formatMGA = (value: number) => `${new Intl.NumberFormat('fr-FR').format(value)} Ar`;
  const shortMGA = (value: number) => `${(value / 1000000).toFixed(1).replace('.', ',')} M Ar`;

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'status-payé';
      case 'in_progress': return 'status-partiel';
      default: return 'status-impayé';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in_progress': return 'En cours';
      case 'planned': return 'Planifié';
      default: return status;
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">GESTION FINANCIÈRE</span>
          <h1>Projets</h1>
          <p className="page-description">Pilotez les projets paroissiaux et leurs collectes avec précision.</p>
        </div>
        <div className="page-header-actions">
          <button className="button button-secondary" onClick={() => { setSelectedProject(null); setShowPaymentModal(true); }}>
            <WalletCards size={16} />Enregistrer un paiement
          </button>
          <button className="button button-primary" onClick={() => setShowProjectModal(true)}>
            <Plus size={17} />Nouveau projet
          </button>
        </div>
      </div>

      <div className="project-overview">
        <div>
          <span className="eyebrow">Portefeuille projets</span>
          <h2>{formatMGA(data?.data?.reduce((sum: number, p: any) => sum + p.budget, 0) || 0)}</h2>
          <p>Budget total de {data?.data?.length || 0} projets actifs</p>
        </div>
        <div className="project-total">
          <span>Collecté</span>
          <strong>{formatMGA(data?.data?.reduce((sum: number, p: any) => sum + p.collected_amount, 0) || 0)}</strong>
        </div>
        <div>
          <span>Reste à collecter</span>
          <strong className="coral-text">
            {formatMGA(data?.data?.reduce((sum: number, p: any) => sum + (p.budget - p.collected_amount), 0) || 0)}
          </strong>
        </div>
      </div>

      {loading ? (
        <div className="panel">Chargement...</div>
      ) : (
        <div className="project-grid">
          {data?.data?.map((project: any) => {
            const ratio = Math.round((project.collected_amount / project.budget) * 100);
            return (
              <div className="project-card" key={project.id}>
                <div className="project-card-head">
                  <span className="mono ref">{project.reference}</span>
                  <span className={`status ${getStatusStyle(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                  <IconButton label="Options">
                    <MoreHorizontal size={17} />
                  </IconButton>
                </div>
                <h3>{project.name}</h3>
                <div className="project-amounts">
                  <div><span>Collecté</span><strong>{shortMGA(project.collected_amount)}</strong></div>
                  <div><span>Budget</span><strong>{shortMGA(project.budget)}</strong></div>
                </div>
                <div className="progress-track">
                  <span style={{ width: `${ratio}%` }} />
                </div>
                <div className="project-card-foot">
                  <span>{ratio}% réalisé</span>
                  <strong>{formatMGA(project.budget - project.collected_amount)}</strong>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      {showProjectModal && (
        <div className="modal-backdrop" onClick={() => { setShowProjectModal(false); setProjectFormData({}); }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">NOUVEAU PROJET</span>
                <h2>Créer un projet</h2>
              </div>
              <IconButton label="Fermer" onClick={() => { setShowProjectModal(false); setProjectFormData({}); }}>
                <X size={18} />
              </IconButton>
            </div>
            <form className="modal-body" onSubmit={handleCreateProject}>
              <div className="form-grid">
                <label>
                  Nom du projet
                  <input
                    value={projectFormData.name || ''}
                    onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Référence
                  <input
                    value={projectFormData.reference || ''}
                    onChange={(e) => setProjectFormData({ ...projectFormData, reference: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Budget total
                  <input
                    type="number"
                    value={projectFormData.budget || ''}
                    onChange={(e) => setProjectFormData({ ...projectFormData, budget: parseFloat(e.target.value) })}
                    required
                  />
                </label>
                <label>
                  Date de début
                  <input
                    type="date"
                    value={projectFormData.start_date || ''}
                    onChange={(e) => setProjectFormData({ ...projectFormData, start_date: e.target.value })}
                    required
                  />
                </label>
                <label className="full-span">
                  Description
                  <textarea
                    value={projectFormData.description || ''}
                    onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                  />
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="button button-secondary" onClick={() => { setShowProjectModal(false); setProjectFormData({}); }}>
                  Annuler
                </button>
                <button type="submit" className="button button-primary">
                  <Check size={16} />Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-backdrop" onClick={() => { setShowPaymentModal(false); setPaymentFormData({}); setSelectedProject(null); }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">VERSEMENT</span>
                <h2>Enregistrer un paiement</h2>
              </div>
              <IconButton label="Fermer" onClick={() => { setShowPaymentModal(false); setPaymentFormData({}); setSelectedProject(null); }}>
                <X size={18} />
              </IconButton>
            </div>
            <form className="modal-body" onSubmit={handlePayment}>
              <div className="form-grid">
                <label>
                  Projet
                  <select
                    value={paymentFormData.project_id || ''}
                    onChange={(e) => {
                      const project = data?.data?.find((p: any) => p.id === parseInt(e.target.value));
                      setSelectedProject(project);
                      setPaymentFormData({ ...paymentFormData, project_id: parseInt(e.target.value) });
                    }}
                    required
                  >
                    <option value="">Sélectionner</option>
                    {data?.data?.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Montant
                  <input
                    type="number"
                    value={paymentFormData.amount || ''}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: parseFloat(e.target.value) })}
                    required
                  />
                </label>
                <label>
                  Date de paiement
                  <input
                    type="date"
                    value={paymentFormData.payment_date || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, payment_date: e.target.value })}
                    required
                  />
                </label>
                <label className="full-span">
                  Description
                  <textarea
                    value={paymentFormData.description || ''}
                    onChange={(e) => setPaymentFormData({ ...paymentFormData, description: e.target.value })}
                  />
                </label>
              </div>
              {selectedProject && (
                <div style={{ marginTop: 16, padding: 12, background: '#faf7f1', borderRadius: 8 }}>
                  <small>Reste disponible: <strong>{formatMGA(selectedProject.budget - selectedProject.collected_amount)}</strong></small>
                </div>
              )}
              <div className="modal-footer">
                <button type="button" className="button button-secondary" onClick={() => { setShowPaymentModal(false); setPaymentFormData({}); setSelectedProject(null); }}>
                  Annuler
                </button>
                <button type="submit" className="button button-primary">
                  <Check size={16} />Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Reports Page
function ReportsPage() {
  const [reportType, setReportType] = useState('general');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const handleExport = () => {
    toast.success('Export CSV téléchargé');
  };

  const handlePrint = () => {
    toast.success('Vue imprimable prête');
    window.print();
  };

  const formatMGA = (value: number) => `${new Intl.NumberFormat('fr-FR').format(value)} Ar`;

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">PILOTAGE</span>
          <h1>Rapports</h1>
          <p className="page-description">Préparez des vues fiables pour vos réunions et vos décisions.</p>
        </div>
        <div className="page-header-actions">
          <button className="button button-secondary" onClick={handleExport}>
            <Download size={16} />Exporter CSV
          </button>
          <button className="button button-primary" onClick={handlePrint}>
            <FileText size={16} />Imprimer le rapport
          </button>
        </div>
      </div>

      <div className="report-filter panel">
        <div>
          <span className="eyebrow">Construire un rapport</span>
          <h2>Vue consolidée</h2>
        </div>
        <label>
          <span>Type de rapport</span>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="general">Général</option>
            <option value="entree">Entrées uniquement</option>
            <option value="sortie">Sorties uniquement</option>
            <option value="obligation">Obligations</option>
            <option value="communion">Communion</option>
            <option value="projet">Projets</option>
            <option value="christiane">Chrétiens</option>
          </select>
        </label>
        <label>
          <span>Du</span>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          <span>Au</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <button className="button button-primary">Filtrer</button>
      </div>

      <div className="report-summary">
        <div className="report-summary-card green">
          <ArrowDownLeft size={19} />
          <span>Entrées</span>
          <strong>7 420 000 Ar</strong>
        </div>
        <div className="report-summary-card coral">
          <ArrowUpRight size={19} />
          <span>Sorties</span>
          <strong>2 950 000 Ar</strong>
        </div>
        <div className="report-summary-card gold">
          <CircleDollarSign size={19} />
          <span>Solde</span>
          <strong>4 470 000 Ar</strong>
        </div>
      </div>

      <div className="panel table-panel">
        <div className="table-header">
          <div>
            <span className="eyebrow">Rapport {reportType}</span>
            <h2>Opérations du {startDate} au {endDate}</h2>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Référence</th>
                <th className="align-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#8f938f' }}>
                  Sélectionnez des filtres et cliquez sur "Filtrer" pour générer le rapport
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Administration Page
function AdminPage({ module }: { module: 'users' | 'imports' | 'logs' }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      if (module === 'logs') {
        const result = await api.logs(page, search);
        setData(result);
      } else if (module === 'users') {
        const result = await api.users();
        setData(result);
      }
    } catch (err) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, search, module]);

  if (module === 'users') {
    return (
      <div>
        <div className="page-header">
          <div>
            <span className="eyebrow">ADMINISTRATION</span>
            <h1>Utilisateurs</h1>
            <p className="page-description">Gérez les accès, les rôles et la sécurité du registre.</p>
          </div>
        </div>

        <div className="role-cards">
          <div>
            <ShieldCheck size={19} />
            <strong>Administrateurs</strong>
            <span>{data?.data?.filter((u: any) => u.role === 'ADMIN').length || 0} utilisateurs · Accès complet</span>
          </div>
          <div>
            <UserRound size={19} />
            <strong>Opérateurs</strong>
            <span>{data?.data?.filter((u: any) => u.role === 'USER').length || 0} utilisateurs · Saisie du jour</span>
          </div>
          <div>
            <BookOpen size={19} />
            <strong>Visiteurs</strong>
            <span>{data?.data?.filter((u: any) => u.role === 'VISITEUR').length || 0} utilisateurs · Lecture seule</span>
          </div>
        </div>

        {loading ? (
          <div className="panel">Chargement...</div>
        ) : (
          <div className="panel table-panel">
            <div className="table-header">
              <div>
                <span className="eyebrow">Accès au registre</span>
                <h2>Utilisateurs actifs</h2>
              </div>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Utilisateur</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Dernière connexion</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.map((user: any) => (
                    <tr key={user.id}>
                      <td>
                        <div className="person-cell compact">
                          <div className="avatar avatar-navy">
                            {user.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                          </div>
                          <strong>{user.name}</strong>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`status ${user.role === 'ADMIN' ? 'status-payé' : user.role === 'USER' ? 'status-partiel' : 'status-impayé'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.last_login_at || '-'}</td>
                      <td>
                        <span className={`status ${user.status === 'active' ? 'status-payé' : 'status-impayé'}`}>
                          {user.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (module === 'logs') {
    return (
      <div>
        <div className="page-header">
          <div>
            <span className="eyebrow">ADMINISTRATION</span>
            <h1>Journal d'activité</h1>
            <p className="page-description">Consultez l'historique des actions sur le registre.</p>
          </div>
        </div>

        <div className="filter-bar">
          <div className="filter-leading">
            <Filter size={16} />
            <span>Filtres</span>
          </div>
          <label className="inline-search">
            <Search size={16} />
            <input
              placeholder="Rechercher dans les logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>

        {loading ? (
          <div className="panel">Chargement...</div>
        ) : (
          <div className="panel table-panel">
            <div className="table-header">
              <div>
                <span className="eyebrow">Historique</span>
                <h2>Actions enregistrées</h2>
              </div>
              <span className="table-total">{data?.pagination?.total || 0} lignes</span>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Utilisateur</th>
                    <th>Action</th>
                    <th>Entité</th>
                    <th>Détails</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data?.map((log: any) => (
                    <tr key={log.id}>
                      <td>{log.created_at}</td>
                      <td>{log.user_name || '-'}</td>
                      <td><span className="mono">{log.action}</span></td>
                      <td>{log.entity}</td>
                      <td><span className="mono" style={{ fontSize: 9 }}>{log.entity_id || '-'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data?.pagination && data.pagination.pages > 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
                <button
                  className="button button-secondary"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Précédent
                </button>
                <span style={{ display: 'flex', alignItems: 'center', fontSize: 11 }}>
                  Page {page} / {data.pagination.pages}
                </span>
                <button
                  className="button button-secondary"
                  disabled={page === data.pagination.pages}
                  onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
                >
                  Suivant
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return <PlaceholderPage title={module} description="Module en cours de développement" />;
}

// Finance Page (Entrées/Sorties)
function FinancePage({ type }: { type: 'entrees' | 'sorties' }) {
  const isEntry = type === 'entrees';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const result = isEntry ? await api.entries(page, search) : await api.exits(page, search);
      setData(result);
    } catch (err) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = isEntry ? '/api/entries' : '/api/exits';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Erreur');
      toast.success(isEntry ? 'Entrée enregistrée' : 'Sortie enregistrée');
      setShowModal(false);
      setFormData({});
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette opération ?')) return;
    try {
      const endpoint = isEntry ? '/api/entries' : '/api/exits';
      const res = await fetch(`${API_BASE}${endpoint}/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Erreur');
      toast.success('Opération supprimée');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression');
    }
  };

  const formatMGA = (value: number) => `${new Intl.NumberFormat('fr-FR').format(value)} Ar`;

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">GESTION FINANCIÈRE</span>
          <h1>{isEntry ? 'Entrées' : 'Sorties'}</h1>
          <p className="page-description">
            {isEntry ? 'Centralisez les contributions et recettes de la paroisse.' : 'Suivez les dépenses avec un contrôle permanent du solde.'}
          </p>
        </div>
        <div className="page-header-actions">
          <button className="button button-primary" onClick={() => setShowModal(true)}>
            <Plus size={17} />{isEntry ? 'Nouvelle entrée' : 'Nouvelle sortie'}
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-leading">
          <Filter size={16} />
          <span>Filtres</span>
        </div>
        <label className="inline-search">
          <Search size={16} />
          <input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      {loading ? (
        <div className="panel">Chargement...</div>
      ) : (
        <div className="panel table-panel">
          <div className="table-header">
            <div>
              <span className="eyebrow">Registre des opérations</span>
              <h2>{isEntry ? 'Dernières entrées' : 'Dernières sorties'}</h2>
            </div>
            <span className="table-total">{data?.pagination?.total || 0} lignes</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Référence</th>
                  <th>Libellé</th>
                  <th>Catégorie</th>
                  {isEntry ? <th>Mode</th> : <th>Bénéficiaire</th>}
                  <th className="align-right">Montant</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((row: any) => (
                  <tr key={row.id}>
                    <td>{row.operation_date}</td>
                    <td><span className="mono ref">{row.reference}</span></td>
                    <td><strong>{row.label}</strong></td>
                    <td>{row.category}</td>
                    {isEntry ? <td>{row.payment_method}</td> : <td>{row.beneficiary || '-'}</td>}
                    <td className="align-right amount">{formatMGA(row.amount)}</td>
                    <td>
                      <IconButton label="Options" onClick={() => handleDelete(row.id)}>
                        <MoreHorizontal size={17} />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data?.pagination && data.pagination.pages > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'center' }}>
              <button
                className="button button-secondary"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Précédent
              </button>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: 11 }}>
                Page {page} / {data.pagination.pages}
              </span>
              <button
                className="button button-secondary"
                disabled={page === data.pagination.pages}
                onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">NOUVEL ENREGISTREMENT</span>
                <h2>{isEntry ? 'Nouvelle entrée' : 'Nouvelle sortie'}</h2>
              </div>
              <IconButton label="Fermer" onClick={() => setShowModal(false)}>
                <X size={18} />
              </IconButton>
            </div>
            <form className="modal-body" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  Libellé
                  <input
                    value={formData.label || ''}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Catégorie
                  <input
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Montant
                  <input
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Date
                  <input
                    type="date"
                    value={formData.operation_date || ''}
                    onChange={(e) => setFormData({ ...formData, operation_date: e.target.value })}
                    required
                  />
                </label>
                {isEntry ? (
                  <label>
                    Mode de paiement
                    <select
                      value={formData.payment_method || 'Espèces'}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                    >
                      <option>Espèces</option>
                      <option>Mobile Money</option>
                      <option>Virement</option>
                      <option>Chèque</option>
                    </select>
                  </label>
                ) : (
                  <label>
                    Bénéficiaire
                    <input
                      value={formData.beneficiary || ''}
                      onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })}
                    />
                  </label>
                )}
                <label className="full-span">
                  Description
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="button button-secondary" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="button button-primary">
                  <Check size={16} />Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Main App
function App() {
  const [user, setUser] = useState<any>(null);
  const [activeModule, setActiveModule] = useState<ModuleKey>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    api.me().then(data => {
      if (data?.success) setUser(data.user);
    });
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    toast.success('Déconnexion réussie');
  };

  if (!user) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  const renderPage = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardPage />;
      case 'entrees':
        return <FinancePage type="entrees" />;
      case 'sorties':
        return <FinancePage type="sorties" />;
      case 'fideles':
        return <FidelesPage />;
      case 'obligations':
        return <ObligationsPage />;
      case 'communion':
        return <CommunionPage />;
      case 'projects':
        return <ProjectsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'users':
        return <AdminPage module="users" />;
      case 'imports':
        return <PlaceholderPage title="Importation" description="Importez des données existantes avec un contrôle strict." />;
      case 'logs':
        return <AdminPage module="logs" />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        active={activeModule}
        onNavigate={setActiveModule}
        role={user.role}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <main className="main-content">
        <Topbar
          active={activeModule}
          role={user.role}
          onMenu={() => setMobileMenuOpen(true)}
          onLogout={handleLogout}
        />
        <section className="page-content">
          {renderPage()}
        </section>
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
