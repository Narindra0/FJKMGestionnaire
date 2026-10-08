import { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { LayoutDashboard, Users, ArrowDownToLine, ArrowUpFromLine, HandCoins, HeartHandshake, FolderKanban, FileBarChart, ShieldCheck, ClipboardList, Menu, LogOut, ChevronRight, Check, X, Search, Bell, Plus, Download, Filter, CalendarDays, TrendingUp, CircleDollarSign, WalletCards, MoreHorizontal, Settings, FileText, ArrowDownLeft, ArrowUpRight, UserRound, BookOpen, Upload, ChevronDown, Sparkles, FileCheck2 } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
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
  reports: async (from: string, to: string, type: string, q = '') => {
    const params = new URLSearchParams({ from, to, type, q });
    const res = await fetch(`${API_BASE}/reports?${params}`);
    return await res.json();
  },
  importTables: async () => {
    const res = await fetch(`${API_BASE}/imports`);
    return await res.json();
  },
  importUpload: async (table: string, file: File) => {
    const form = new FormData();
    form.append('table_name', table);
    form.append('excel', file);
    const res = await fetch(`${API_BASE}/imports`, { method: 'POST', body: form });
    return await res.json();
  },
};

// Téléchargement d'un fichier via l'API (session cookie incluse, blob côté client).
const downloadFromApi = async (path: string, filename: string) => {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    toast.error('Téléchargement impossible.');
    return;
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

// Objectif annuel de collecte communion (à terme : paramétrable via settings)
const COMMUNION_ANNUAL_GOAL = 2860000;

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
    { key: 'imports' as ModuleKey, label: 'Importation', icon: Upload },
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

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase().replaceAll(' ', '-');
  return <span className={`status status-${normalized}`}>{status}</span>;
}

function PageHeader({ eyebrow, title, description, action }: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        <span className="eyebrow">{eyebrow ?? 'FJKM MALAZA GILEADA'}</span>
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action && <div className="page-header-actions">{action}</div>}
    </div>
  );
}

function FilterBar({ search = true, onSearchChange, searchPlaceholder, children }: {
  search?: boolean;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="filter-bar">
      <div className="filter-leading">
        <Filter size={16} />
        <span>Filtres</span>
      </div>
      {children}
      <div className="filter-spacer" />
      {search && (
        <label className="inline-search">
          <Search size={16} />
          <input
            placeholder={searchPlaceholder ?? 'Rechercher dans la liste...'}
            onChange={onSearchChange ? (e) => onSearchChange(e.target.value) : undefined}
          />
        </label>
      )}
      <button className="button button-ghost">
        <span>Réafficher</span>
      </button>
    </div>
  );
}

function MetricCard({ label, value, helper, icon: Icon, tone, trend }: {
  label: string;
  value: string;
  helper: string;
  icon: typeof CircleDollarSign;
  tone: string;
  trend?: string;
}) {
  return (
    <div className={`metric-card metric-${tone}`}>
      <div className="metric-card-top">
        <span>{label}</span>
        <span className="metric-icon"><Icon size={18} /></span>
      </div>
      <strong>{value}</strong>
      <div className="metric-helper">
        {trend && (
          <span className="trend-positive"><TrendingUp size={13} />{trend}</span>
        )}
        <span>{helper}</span>
      </div>
    </div>
  );
}

function Activity({ icon: Icon, tone, title, detail, meta }: {
  icon: typeof ArrowDownToLine;
  tone: string;
  title: string;
  detail: string;
  meta: string;
}) {
  return (
    <div className="activity-item">
      <div className={`activity-icon activity-${tone}`}>
        <Icon size={16} />
      </div>
      <div className="activity-copy">
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
      <time>{meta}</time>
    </div>
  );
}

// Pagination au format du design mockup (.module-footer + .pagination)
function ModulePagination({ page, pages, total, label, onPage }: {
  page: number;
  pages: number;
  total: number;
  label: string;
  onPage: (page: number) => void;
}) {
  if (pages <= 1) {
    return (
      <div className="module-footer">
        <span>{total} {label}</span>
      </div>
    );
  }
  const numbers: number[] = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) numbers.push(i);
  }
  const items: React.ReactNode[] = [];
  let prev = 0;
  for (const n of numbers) {
    if (prev && n - prev > 1) items.push(<button key={`gap-${n}`} disabled>…</button>);
    items.push(
      <button key={n} className={n === page ? 'active' : ''} onClick={() => onPage(n)}>{n}</button>
    );
    prev = n;
  }
  return (
    <div className="module-footer">
      <span>Affichage de la page {page} sur {pages}</span>
      <div className="pagination">
        <button disabled={page === 1} onClick={() => onPage(page - 1)}>‹</button>
        {items}
        <button disabled={page === pages} onClick={() => onPage(page + 1)}>›</button>
      </div>
    </div>
  );
}

function formatMGA(value: number) {
  return `${new Intl.NumberFormat('fr-FR').format(value)} Ar`;
}
function shortMGA(value: number) {
  return `${(value / 1000000).toFixed(1).replace('.', ',')} M Ar`;
}

// Login Page
function LoginPage({ onLogin }: { onLogin: (user: any) => void }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
          <div className="login-quote">
            <BookOpen size={18} />
            <span>
              « Que tout se fasse avec bienséance et avec ordre. »
              <small>1 Corinthiens 14:40</small>
            </span>
          </div>
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
              <div className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
                <button type="button" onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? 'Masquer' : 'Afficher'}
                </button>
              </div>
            </label>
            <div className="form-row form-row-between">
              <label className="checkbox-label">
                <input type="checkbox" defaultChecked /> <span>Se souvenir de moi</span>
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info('Contactez un administrateur pour réinitialiser votre accès.');
                }}
              >
                Mot de passe oublié ?
              </a>
            </div>
            <button className="button button-primary button-large" type="submit" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'} <ChevronRight size={18} />
            </button>
          </form>
          <div className="login-note">
            <ShieldCheck size={16} />
            <span>Vos données sont réservées aux utilisateurs autorisés.</span>
          </div>
        </div>
        <div className="login-legal">
          <a href="/confidentialite">Confidentialité</a>
          <span>·</span>
          <a href="/mentions-legales">Mentions légales</a>
          <span>·</span>
          <span>Développement : Narindra Ranjalahy</span>
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
          <ChevronDown size={15} />
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
          <div className="storage-card">
            <div className="storage-icon"><Sparkles size={16} /></div>
            <div>
              <strong>Registre protégé</strong>
              <small>Synchronisation active</small>
            </div>
            <span className="pulse-dot" />
          </div>
          <div className="sidebar-footer">
            <span>v1.0.0</span>
            <a href="/confidentialite">Confidentialité</a>
          </div>
        </div>
      </aside>
    </>
  );
}

// Topbar
function Topbar({ active, role, user, onMenu, onLogout }: {
  active: ModuleKey;
  role: Role;
  user: any;
  onMenu: () => void;
  onLogout: () => void;
}) {
  const label = navSections.flatMap(section => section.items).find(item => item.key === active)?.label ?? 'Tableau de bord';
  const fullName = user?.full_name || user?.name || 'Utilisateur';
  const initials = fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
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
        <div className="topbar-search">
          <Search size={16} />
          <input placeholder="Rechercher..." />
          <kbd>⌘ K</kbd>
        </div>
        <IconButton label="Notifications" onClick={() => toast.info('Aucune nouvelle notification')}>
          <Bell size={18} />
          <span className="notification-dot" />
        </IconButton>
        <div className="profile-menu">
          <div className="avatar avatar-gold">{initials}</div>
          <div className="profile-copy">
            <strong>{fullName}</strong>
            <span>{role}</span>
          </div>
          <ChevronDown size={15} />
        </div>
        <button className="logout-button" onClick={onLogout} title="Se déconnecter">
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}

// Dashboard Page
function DashboardPage({ onNavigate }: { onNavigate: (key: ModuleKey) => void }) {
  const [stats, setStats] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboardStats().then(data => {
      setStats(data);
      setLoading(false);
    }).catch(() => {
      toast.error('Erreur lors du chargement du dashboard');
      setLoading(false);
    });
    api.logs(1, '').then(res => {
      setRecentLogs((res?.data ?? []).slice(0, 4));
    }).catch(() => {});
  }, []);

  if (loading) return <div className="panel">Chargement...</div>;

  const series = stats?.series ?? { labels: [], entries: [], exits: [] };
  const chartData = (series.labels ?? []).map((month: string, index: number) => ({
    month,
    entries: (series.entries?.[index] || 0) / 1000000,
    exits: (series.exits?.[index] || 0) / 1000000,
  }));
  const sum = (arr?: number[]) => (arr ?? []).reduce((a: number, b: number) => a + b, 0);
  const sources = [
    { name: 'Obligations', value: sum(series.obligation_entries), color: '#c58b3a' },
    { name: 'Communion', value: sum(series.communion_entries), color: '#287d68' },
    { name: 'Projets', value: sum(series.project_entries), color: '#6b8fb3' },
    { name: 'Entrées', value: sum(series.finance_entries), color: '#d7c6a6' },
  ];
  const sourcesTotal = sources.reduce((a, s) => a + s.value, 0);
  const distribution = sources.map(s => ({
    ...s,
    pct: sourcesTotal > 0 ? Math.round((s.value / sourcesTotal) * 100) : 0,
  }));

  const activityFor = (log: any) => {
    const action = String(log.action ?? '').toUpperCase();
    if (action.includes('EXIT') || action.includes('SORTIE')) return { icon: ArrowUpFromLine, tone: 'coral' };
    if (action.includes('OBLIGATION')) return { icon: HandCoins, tone: 'purple' };
    if (action.includes('COMMUNION')) return { icon: HeartHandshake, tone: 'green' };
    if (action.includes('FIDEL') || action.includes('CHRISTIAN')) return { icon: UserRound, tone: 'blue' };
    return { icon: ArrowDownToLine, tone: 'gold' };
  };

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        description="La trésorerie et les activités de votre paroisse en un regard."
        action={
          <>
            <button className="button button-secondary" onClick={() => toast.success('Rapport préparé pour impression')}>
              <Download size={16} />Exporter
            </button>
            <button className="button button-primary" onClick={() => onNavigate('entrees')}>
              <Plus size={17} />Nouvelle entrée
            </button>
          </>
        }
      />

      <div className="dashboard-toolbar">
        <div className="period-label">
          <CalendarDays size={16} />
          <span>Période analysée</span>
          <strong>{`01 janvier — 31 décembre ${new Date().getFullYear()}`}</strong>
        </div>
        <div className="toolbar-actions">
          <button className="select-button">
            Toutes les opérations <ChevronDown size={15} />
          </button>
          <button className="icon-button bordered">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {stats && (
        <>
          <div className="metrics-grid">
            <MetricCard
              label="Entrées générales"
              value={formatMGA(stats.totals?.entries ?? 0)}
              helper="vs. le mois dernier"
              trend="+8,5 %"
              icon={ArrowDownToLine}
              tone="gold"
            />
            <MetricCard
              label="Sorties générales"
              value={formatMGA(stats.totals?.exits ?? 0)}
              helper="opérations ce mois"
              icon={ArrowUpFromLine}
              tone="coral"
            />
            <MetricCard
              label="Reste général"
              value={formatMGA(stats.totals?.balance ?? 0)}
              helper="Solde disponible"
              trend="+12,4 %"
              icon={WalletCards}
              tone="navy"
            />
            <MetricCard
              label="Entrées communion"
              value={formatMGA(stats.communionTotals?.entries ?? 0)}
              helper="paiements enregistrés"
              trend="+5,2 %"
              icon={HeartHandshake}
              tone="green"
            />
            <MetricCard
              label="Chrétiens actifs"
              value={String(stats.counts?.fideles_actifs ?? 0)}
              helper={`${stats.counts?.fideles_total ?? 0} enregistrés au total`}
              icon={Users}
              tone="blue"
            />
            <MetricCard
              label="Obligations à suivre"
              value={String(stats.counts?.obligations_a_suivre ?? 0)}
              helper={`${stats.counts?.obligations_partiels ?? 0} paiements partiels`}
              icon={HandCoins}
              tone="purple"
            />
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
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 18, right: 14, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="entriesGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#c58b3a" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#c58b3a" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="exitsGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#c95c55" stopOpacity={0.16} />
                        <stop offset="100%" stopColor="#c95c55" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#ebe5db" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8c8a85', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8c8a85', fontSize: 11 }} tickFormatter={(value) => `${value}M`} />
                    <Tooltip formatter={(value: any) => [`${Number(value).toFixed(1)} M Ar`, '']} contentStyle={{ border: '1px solid #ece7de', borderRadius: 12, boxShadow: '0 12px 30px rgba(24,42,61,.08)' }} />
                    <Area type="monotone" dataKey="entries" stroke="#c58b3a" strokeWidth={2.5} fill="url(#entriesGradient)" />
                    <Area type="monotone" dataKey="exits" stroke="#c95c55" strokeWidth={2} fill="url(#exitsGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="panel chart-panel">
              <div className="panel-header">
                <div>
                  <span className="eyebrow">Répartition</span>
                  <h2>Origine des entrées</h2>
                </div>
                <IconButton label="Options"><MoreHorizontal size={18} /></IconButton>
              </div>
              <div className="donut-wrap">
                <ResponsiveContainer width="52%" height={178}>
                  <PieChart>
                    <Pie data={distribution} innerRadius={54} outerRadius={78} paddingAngle={4} dataKey="value" stroke="none">
                      {distribution.map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center">
                  <strong>{shortMGA(stats.totals?.entries ?? 0).replace(' Ar', '')}</strong>
                  <span>Total</span>
                </div>
                <div className="donut-legend">
                  {distribution.map((item) => (
                    <div key={item.name}>
                      <i style={{ background: item.color }} />
                      <span>{item.name}</span>
                      <strong>{item.pct}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="panel chart-panel">
              <div className="panel-header">
                <div>
                  <span className="eyebrow">Comparatif</span>
                  <h2>Entrées vs sorties</h2>
                </div>
                <span className="panel-period">{new Date().getFullYear()}</span>
              </div>
              <div className="chart-wrap compact-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.slice(0, 8)} barGap={4} margin={{ top: 12, right: 4, left: -22, bottom: 0 }}>
                    <CartesianGrid stroke="#ebe5db" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8c8a85', fontSize: 10 }} />
                    <YAxis hide />
                    <Tooltip formatter={(value: any) => [`${Number(value).toFixed(1)} M Ar`, '']} contentStyle={{ border: '1px solid #ece7de', borderRadius: 12 }} />
                    <Bar dataKey="entries" fill="#c58b3a" radius={[4, 4, 0, 0]} barSize={8} />
                    <Bar dataKey="exits" fill="#d9d1c3" radius={[4, 4, 0, 0]} barSize={8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="panel recent-panel">
              <div className="panel-header">
                <div>
                  <span className="eyebrow">Traçabilité</span>
                  <h2>Activités récentes</h2>
                </div>
                <button className="text-button" onClick={() => onNavigate('logs')}>
                  Voir le journal <ChevronRight size={15} />
                </button>
              </div>
              <div className="activity-list">
                {recentLogs.length === 0 ? (
                  <Activity
                    icon={ClipboardList}
                    tone="blue"
                    title="Aucune activité récente"
                    detail="Les opérations seront journalisées automatiquement"
                    meta="—"
                  />
                ) : (
                  recentLogs.map((log: any) => {
                    const { icon, tone } = activityFor(log);
                    return (
                      <Activity
                        key={log.id}
                        icon={icon}
                        tone={tone}
                        title={String(log.action ?? '').replaceAll('_', ' ')}
                        detail={`${log.entity ?? ''} · ${log.user_name ?? 'Système'}`}
                        meta={String(log.created_at ?? '')}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="dashboard-footer-note">
            <ShieldCheck size={16} />
            <span>Dernière synchronisation : à la consultation · Les opérations sont journalisées automatiquement.</span>
          </div>
        </>
      )}
    </>
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
      <PageHeader
        eyebrow="VIE DE L’ÉGLISE"
        title="Chrétiens"
        description="Une fiche fiable pour chaque membre de la communauté."
        action={
          <button className="button button-primary" onClick={() => { setEditingId(null); setFormData({}); setShowModal(true); }}>
            <Plus size={17} />Nouveau chrétien
          </button>
        }
      />

      <FilterBar search={false}>
        <label className="filter-select">
          <CalendarDays size={15} />
          <select defaultValue="all">
            <option value="all">Toutes les périodes</option>
            <option>Cette année</option>
            <option>Ce trimestre</option>
          </select>
        </label>
        <label className="inline-filter-search">
          <Search size={15} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Matricule, nom, groupe..."
          />
        </label>
      </FilterBar>

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
            <div className="table-actions">
              <button className="button button-secondary button-small" onClick={() => window.print()}>
                <Download size={15} />Imprimer
              </button>
              <button className="button button-secondary button-small" onClick={() => toast.success('Export PDF préparé')}>
                <Download size={15} />PDF
              </button>
            </div>
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
                      <StatusBadge status={row.status === 'active' ? 'Actif' : 'Inactif'} />
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
          {data?.pagination && (
            <ModulePagination page={page} pages={data.pagination.pages} total={data.pagination.total} label="lignes" onPage={setPage} />
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
        <button className="text-button" onClick={() => toast.info('Paramètre réservé aux administrateurs.')}>
          Modifier <ChevronRight size={15} />
        </button>
      </div>

      <FilterBar search={false}>
        <label className="filter-select">
          <CalendarDays size={15} />
          <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">Tous les statuts</option>
            <option value="paid">Payé</option>
            <option value="partial">Partiel</option>
            <option value="unpaid">Impayé</option>
          </select>
        </label>
        <label className="inline-filter-search">
          <Search size={15} />
          <input
            placeholder="Matricule, nom..."
            defaultValue={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </label>
      </FilterBar>

      {data?.data && data.data.length > 0 && (() => {
        const due = data.data.reduce((s: number, r: any) => s + Number(r.amount_due || 0), 0);
        const paid = data.data.reduce((s: number, r: any) => s + Number(r.amount_paid || 0), 0);
        const rest = Math.max(0, due - paid);
        const taux = due > 0 ? Math.round((paid / due) * 1000) / 10 : 0;
        return (
          <div className="obligation-stats">
            <div><span>Montant dû</span><strong>{formatMGA(due)}</strong></div>
            <div><span>Montant payé</span><strong className="green-text">{formatMGA(paid)}</strong></div>
            <div><span>Reste à suivre</span><strong className="coral-text">{formatMGA(rest)}</strong></div>
            <div><span>Taux de collecte</span><strong>{String(taux).replace('.', ',')} %</strong></div>
          </div>
        );
      })()}

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
                    <td className="amount">{formatMGA(row.amount_due)}</td>
                    <td className="amount green-text">{formatMGA(row.amount_paid)}</td>
                    <td className={`amount ${((row.rest_amount ?? (row.amount_due - row.amount_paid)) > 0) ? 'coral-text' : 'muted'}`}>
                      {formatMGA(row.rest_amount || (row.amount_due - row.amount_paid))}
                    </td>
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
          {data?.pagination && (
            <ModulePagination page={page} pages={data.pagination.pages} total={data.pagination.total} label="lignes" onPage={setPage} />
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
          <h2>{formatMGA(data?.data?.reduce((sum: number, row: any) => sum + Number(row.amount || 0), 0) || 0)}</h2>
          <p>{data?.pagination?.total || 0} paiements</p>
        </div>
        <div className="communion-progress">
          <div>
            <span>Objectif annuel</span>
            <strong>{formatMGA(COMMUNION_ANNUAL_GOAL)}</strong>
          </div>
          <div className="progress-track">
            <span style={{ width: `${Math.min(100, Math.round(((data?.data?.reduce((sum: number, row: any) => sum + Number(row.amount || 0), 0) || 0) / COMMUNION_ANNUAL_GOAL) * 100))}%` }} />
          </div>
          <small>{Math.min(100, Math.round(((data?.data?.reduce((sum: number, row: any) => sum + Number(row.amount || 0), 0) || 0) / COMMUNION_ANNUAL_GOAL) * 100))} % collecté</small>
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
          {data?.pagination && (
            <ModulePagination page={page} pages={data.pagination.pages} total={data.pagination.total} label="lignes" onPage={setPage} />
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
          <div className="progress-track">
            <span style={{ width: `${Math.min(100, Math.round(((data?.data?.reduce((sum: number, p: any) => sum + p.collected_amount, 0) || 0) / Math.max(1, data?.data?.reduce((sum: number, p: any) => sum + p.budget, 0) || 1)) * 100))}%` }} />
          </div>
          <small>{Math.round(((data?.data?.reduce((sum: number, p: any) => sum + p.collected_amount, 0) || 0) / Math.max(1, data?.data?.reduce((sum: number, p: any) => sum + p.budget, 0) || 1)) * 1000) / 10} % du budget</small>
        </div>
        <div>
          <span>Reste à collecter</span>
          <strong className="coral-text">
            {formatMGA(data?.data?.reduce((sum: number, p: any) => sum + (p.budget - p.collected_amount), 0) || 0)}
          </strong>
          <span className="muted">sur les projets actifs</span>
        </div>
      </div>

      <FilterBar search={false}>
        <label className="filter-select">
          <FolderKanban size={15} />
          <select defaultValue="active">
            <option value="active">Projets actifs</option>
            <option>Tous les projets</option>
            <option>Terminés</option>
          </select>
        </label>
      </FilterBar>

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
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const formatMGA = (value: number) => `${new Intl.NumberFormat('fr-FR').format(value)} Ar`;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await api.reports(startDate, endDate, reportType);
      if (result?.success) setData(result);
      else toast.error(result?.message || 'Rapport indisponible');
    } catch {
      toast.error('Erreur lors du chargement du rapport');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGenerate();
  }, []);

  const exportParams = (format: string) =>
    new URLSearchParams({ from: startDate, to: endDate, type: reportType, format }).toString();

  const handleExportCsv = () =>
    downloadFromApi(`/reports/export?${exportParams('csv')}`, `rapport-${reportType}.csv`);

  const handleExportPdf = () =>
    downloadFromApi(`/reports/export?${exportParams('pdf')}`, `rapport-${reportType}.pdf`);

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">PILOTAGE</span>
          <h1>Rapports</h1>
          <p className="page-description">Préparez des vues fiables pour vos réunions et vos décisions.</p>
        </div>
        <div className="page-header-actions">
          <button className="button button-secondary" onClick={handleExportCsv}>
            <Download size={16} />Exporter CSV
          </button>
          <button className="button button-secondary" onClick={handleExportPdf}>
            <FileText size={16} />Exporter PDF
          </button>
          <button className="button button-primary" onClick={() => window.print()}>
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
        <button className="button button-primary" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Chargement…' : 'Filtrer'}
        </button>
      </div>

      <div className="report-summary">
        <div className="report-summary-card green">
          <ArrowDownLeft size={19} />
          <span>Entrées</span>
          <strong>{formatMGA(Number(data?.totals?.entries ?? 0))}</strong>
        </div>
        <div className="report-summary-card coral">
          <ArrowUpRight size={19} />
          <span>Sorties</span>
          <strong>{formatMGA(Number(data?.totals?.exits ?? 0))}</strong>
        </div>
        <div className="report-summary-card gold">
          <CircleDollarSign size={19} />
          <span>Solde</span>
          <strong>{formatMGA(Number(data?.totals?.balance ?? 0))}</strong>
        </div>
      </div>

      <div className="panel table-panel">
        <div className="table-header">
          <div>
            <span className="eyebrow">Rapport {reportType}</span>
            <h2>Opérations du {startDate} au {endDate}</h2>
          </div>
          <span className="report-tag">
            <FileCheck2 size={14} />
            Données vérifiées
          </span>
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
              {(data?.rows ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#8f938f' }}>
                    {loading ? 'Chargement du rapport…' : 'Aucune opération sur cette période et ce filtre.'}
                  </td>
                </tr>
              ) : (
                (data.rows as any[]).map((row: any, index: number) => (
                  <tr key={index}>
                    <td>{row.date}</td>
                    <td>{row.type}</td>
                    <td>{row.label}</td>
                    <td>{row.category}</td>
                    <td className="align-right">{formatMGA(Number(row.amount ?? 0))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Importation Page (admin) : dépôt de fichier + import réel via l'API.
function ImportPage() {
  const [tables, setTables] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState('fideles');
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.importTables().then(res => {
      if (res?.success) setTables(res.data ?? {});
    }).catch(() => toast.error('Tables importables indisponibles'));
  }, []);

  const pickFile = (f: File | undefined | null) => {
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { toast.error('Taille maximale : 2 Mo'); return; }
    setFile(f);
  };

  const handleImport = async () => {
    if (!file) { toast.info('Sélectionnez un fichier CSV ou Excel.'); return; }
    setImporting(true);
    try {
      const res = await api.importUpload(selected, file);
      if (res?.success) { toast.success(res.message); setFile(null); inputRef.current && (inputRef.current.value = ''); }
      else toast.error(res?.message || 'Import refusé');
    } catch {
      toast.error('Erreur lors de l’import');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="ADMINISTRATION"
        title="Importation"
        description="Importez des données existantes avec un contrôle des colonnes et des formats."
        action={
          <button className="button button-primary" onClick={handleImport} disabled={importing}>
            <Upload size={17} />{importing ? 'Import en cours…' : 'Importer un fichier'}
          </button>
        }
      />
      <div className="report-filter panel" style={{ marginBottom: 16 }}>
        <div>
          <span className="eyebrow">Cible</span>
          <h2>Table à alimenter</h2>
        </div>
        <label>
          <span>Table</span>
          <select value={selected} onChange={(e) => setSelected(e.target.value)}>
            {Object.keys(tables).length === 0 ? (
              <option value="fideles">Fidèles</option>
            ) : (
              Object.entries(tables).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))
            )}
          </select>
        </label>
      </div>
      <div
        className={`import-dropzone${dragActive ? ' import-drop-active' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); pickFile(e.dataTransfer.files?.[0]); }}
      >
        <div className="import-drop-icon"><Upload size={24} /></div>
        <h2>{file ? file.name : 'Déposez votre fichier ici'}</h2>
        <p>Formats acceptés : CSV, XLSX · Taille maximale : 2 Mo</p>
        <button className="button button-secondary" onClick={() => inputRef.current?.click()}>Choisir un fichier</button>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          style={{ display: 'none' }}
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
      </div>
      <div className="import-table panel">
        <div className="table-header">
          <div>
            <span className="eyebrow">Modèles disponibles</span>
            <h2>Tables importables</h2>
          </div>
        </div>
        {Object.entries(tables).map(([key, label]) => (
          <div className="import-row" key={key}>
            <div className="import-row-icon"><FileText size={17} /></div>
            <div>
              <strong>{label}</strong>
              <span>CSV / Excel</span>
            </div>
            {key === 'fideles' ? (
              <button
                className="text-button"
                onClick={() => downloadFromApi('/imports/template?format=xlsx', 'modele_import_fideles.xlsx')}
              >
                Télécharger le modèle <Download size={14} />
              </button>
            ) : (
              <button
                className="text-button"
                onClick={() => setSelected(key)}
              >
                Importer dans cette table <ChevronRight size={14} />
              </button>
            )}
          </div>
        ))}
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
        <PageHeader
          eyebrow="ADMINISTRATION"
          title="Utilisateurs"
          description="Gérez les accès, les rôles et la sécurité du registre."
          action={
            <button
              className="button button-primary"
              onClick={() => toast.info('Le formulaire de création sera ouvert ici.')}
            >
              <Plus size={17} />Nouvel utilisateur
            </button>
          }
        />

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
                    <th />
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
                        <StatusBadge status={user.role} />
                      </td>
                      <td>{user.last_login_at || '-'}</td>
                      <td>
                        <StatusBadge status={user.status === 'active' ? 'Actif' : 'Inactif'} />
                      </td>
                      <td>
                        <IconButton label="Options">
                          <MoreHorizontal size={17} />
                        </IconButton>
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
        <PageHeader
          eyebrow="ADMINISTRATION"
          title="Journal d’activité"
          description="Chaque opération sensible est conservée pour garantir la transparence."
          action={
            <button className="button button-secondary" onClick={() => toast.success('Journal exporté')}>
              <Download size={16} />Exporter le journal
            </button>
          }
        />

        <FilterBar search={false}>
          <button className="date-button">30 derniers jours</button>
          <button className="date-button">
            Toutes les actions <ChevronDown size={15} />
          </button>
          <button className="date-button">
            Toutes les entités <ChevronDown size={15} />
          </button>
          <label className="inline-filter-search">
            <Search size={15} />
            <input
              placeholder="Rechercher dans les logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </FilterBar>

        {loading ? (
          <div className="panel">Chargement...</div>
        ) : (
          <>
            <div className="panel table-panel">
              <div className="table-header">
                <div>
                  <span className="eyebrow">Traçabilité</span>
                  <h2>Actions récentes</h2>
                </div>
                <span className="table-total">30 / page</span>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Utilisateur</th>
                      <th>Action</th>
                      <th>Entité</th>
                      <th>ID</th>
                      <th>Détails</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.data?.map((log: any) => (
                      <tr key={log.id}>
                        <td className="mono">{log.created_at}</td>
                        <td><strong>{log.user_name || 'Système'}</strong></td>
                        <td><span className="action-chip">{log.action}</span></td>
                        <td className="mono">{log.entity}</td>
                        <td className="mono">#{log.entity_id || '-'}</td>
                        <td>{typeof log.payload === 'string' ? log.payload.slice(0, 60) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {data?.pagination && (
              <ModulePagination page={page} pages={data.pagination.pages} total={data.pagination.total} label="journalisations" onPage={setPage} />
            )}
          </>
        )}
      </div>
    );
  }

  // module === 'imports'
  return <ImportPage />;
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
      <PageHeader
        eyebrow="GESTION FINANCIÈRE"
        title={isEntry ? 'Entrées' : 'Sorties'}
        description={
          isEntry
            ? 'Centralisez les contributions et recettes de la paroisse.'
            : 'Suivez les dépenses avec un contrôle permanent du solde.'
        }
        action={
          <button className="button button-primary" onClick={() => setShowModal(true)}>
            <Plus size={17} />{isEntry ? 'Nouvelle entrée' : 'Nouvelle sortie'}
          </button>
        }
      />

      <FilterBar search={false}>
        <label className="filter-select">
          <CalendarDays size={15} />
          <select defaultValue="annee">
            <option value="annee">Cette année</option>
            <option value="trimestre">Ce trimestre</option>
            <option value="mois">Ce mois</option>
          </select>
        </label>
        <label className="inline-filter-search">
          <Search size={15} />
          <input
            placeholder="Rechercher..."
            defaultValue={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </label>
      </FilterBar>

      {data?.data && data.data.length > 0 && (
        <div className="summary-strip">
          <div>
            <span>{isEntry ? 'Total des entrées' : 'Total des sorties'}</span>
            <strong>{formatMGA(data.data.reduce((s: number, r: any) => s + Number(r.amount || 0), 0))}</strong>
          </div>
          <div>
            <span>Opérations</span>
            <strong>{data.pagination?.total ?? data.data.length}</strong>
          </div>
          <div>
            <span>Dernière référence</span>
            <strong className="mono">{data.data[0]?.reference ?? '-'}</strong>
          </div>
          <div>
            <span>Évolution</span>
            <strong className="summary-positive">
              +8,5 % <TrendingUp size={14} />
            </strong>
          </div>
        </div>
      )}

      {loading ? (
        <div className="panel">Chargement...</div>
      ) : (
        <div className="panel table-panel">
          <div className="table-header">
            <div>
              <span className="eyebrow">Registre des opérations</span>
              <h2>{isEntry ? 'Dernières entrées' : 'Dernières sorties'}</h2>
            </div>
            <button className="button button-secondary button-small" onClick={() => toast.success('Export CSV téléchargé')}>
              <Download size={15} />Exporter CSV
            </button>
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
                    <td><StatusBadge status={row.category} /></td>
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
          {data?.pagination && (
            <ModulePagination page={page} pages={data.pagination.pages} total={data.pagination.total} label="lignes" onPage={setPage} />
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

// Pages légales (design mockup : /confidentialite, /mentions-legales, /cookies)
function LegalPage({ kind }: { kind: 'privacy' | 'legal' | 'cookies' }) {
  const content =
    kind === 'privacy'
      ? {
          eyebrow: 'CONFIDENTIALITÉ',
          title: 'Politique de confidentialité',
          intro: 'Cette politique explique comment FJKM Malaza Gileada protège les données utilisées dans FJKM Gestionnaire.',
          sections: [
            ['Responsable du traitement', 'Le responsable du traitement est FJKM Malaza Gileada. Les informations de contact et l’adresse administrative doivent être complétées par l’organisation avant mise en production.'],
            ['Données collectées et finalités', 'L’application peut traiter l’identité des membres, leurs coordonnées, dates de baptême et de communion, informations de groupe, opérations financières et données de connexion. Ces données servent exclusivement à la gestion administrative, au suivi des obligations, à la tenue des rapports et à la traçabilité des actions.'],
            ['Base légale et conservation', 'Le traitement repose sur la gestion de la vie associative et religieuse, l’exécution des obligations administratives et l’intérêt légitime de sécurité. Les données sont conservées pendant la durée nécessaire à ces finalités, puis archivées ou supprimées selon la politique interne de FJKM.'],
            ['Droits des personnes', 'Toute personne peut demander l’accès, la rectification, l’effacement, la limitation ou l’opposition au traitement de ses données, sous réserve des obligations légales de conservation. La demande doit être adressée au responsable du traitement avec un justificatif raisonnable d’identité.'],
            ['Sécurité et destinataires', 'Les données sont accessibles uniquement aux utilisateurs autorisés selon leur rôle. Les mots de passe sont protégés par hachage, les actions sont journalisées et les échanges doivent être chiffrés en production. Les données ne sont pas vendues ni utilisées à des fins publicitaires.'],
          ] as [string, string][],
        }
      : kind === 'legal'
        ? {
            eyebrow: 'INFORMATIONS',
            title: 'Mentions légales',
            intro: 'Les informations légales de l’application FJKM Gestionnaire sont présentées ci-dessous.',
            sections: [
              ['Éditeur', 'FJKM Malaza Gileada. Adresse administrative, téléphone et email officiel : à compléter par l’organisation avant publication.'],
              ['Responsable de publication', 'Le responsable de publication est désigné par FJKM Malaza Gileada.'],
              ['Hébergement', 'Les coordonnées de l’hébergeur doivent être confirmées lors de la mise en production.'],
              ['Propriété et attribution', 'Le nom, les contenus et les données de FJKM Malaza Gileada restent la propriété de l’organisation. Développement : Narindra Ranjalahy.'],
            ] as [string, string][],
          }
        : {
            eyebrow: 'CONFIDENTIALITÉ',
            title: 'Politique cookies',
            intro: 'FJKM Gestionnaire utilise uniquement les mécanismes nécessaires à la connexion et au fonctionnement sécurisé du service.',
            sections: [
              ['Cookies nécessaires', 'Un cookie de session peut être utilisé pour maintenir la connexion et appliquer les permissions. Il est strictement nécessaire au service et n’est pas utilisé pour faire de la publicité.'],
              ['Préférences', 'Les préférences d’interface peuvent être conservées localement sur l’appareil. Elles peuvent être supprimées depuis les réglages du navigateur.'],
              ['Contact', 'Pour toute question relative aux cookies ou à la confidentialité, contactez l’administration de FJKM Malaza Gileada avec les coordonnées qui seront publiées dans les mentions légales.'],
            ] as [string, string][],
          };
  return (
    <div className="legal-shell">
      <div className="legal-topbar">
        <a href="/" className="back-brand">
          <Logo compact />
          <span>Retour au registre</span>
        </a>
        <span>FJKM Gestionnaire</span>
      </div>
      <main className="legal-content">
        <span className="eyebrow">{content.eyebrow}</span>
        <h1>{content.title}</h1>
        <p className="legal-intro">{content.intro}</p>
        {content.sections.map(([title, body]) => (
          <section key={title}>
            <h2>{title}</h2>
            <p>{body}</p>
          </section>
        ))}
        <div className="legal-attribution">
          <Sparkles size={18} />
          <span>
            Développement de l’application : <strong>Narindra Ranjalahy</strong>
          </span>
        </div>
        <footer>
          <a href="/mentions-legales">Mentions légales</a>
          <a href="/confidentialite">Confidentialité</a>
          <a href="/cookies">Cookies</a>
        </footer>
      </main>
    </div>
  );
}

// Routage par chemin d'URL : chaque module possède une adresse directe ;
// les chemins inconnus affichent la page d'erreur 404 du SPA.
const PATH_TO_MODULE: Record<string, ModuleKey> = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/entrees': 'entrees',
  '/sorties': 'sorties',
  '/obligations': 'obligations',
  '/communion': 'communion',
  '/projects': 'projects',
  '/fideles': 'fideles',
  '/reports': 'reports',
  '/users': 'users',
  '/imports': 'imports',
  '/logs': 'logs',
};
const MODULE_TO_PATH: Record<ModuleKey, string> = {
  dashboard: '/', entrees: '/entrees', sorties: '/sorties', obligations: '/obligations',
  communion: '/communion', projects: '/projects', fideles: '/fideles', reports: '/reports',
  users: '/users', imports: '/imports', logs: '/logs',
};

function NotFoundPage() {
  return (
    <div className="notfound-page">
      <div className="notfound-card panel">
        <span className="eyebrow">ERREUR 404</span>
        <h1>Page introuvable</h1>
        <p>La page demandée n&apos;existe pas ou a été déplacée.</p>
        <a className="button button-primary" href="/">Retour au tableau de bord</a>
      </div>
    </div>
  );
}

// Main App
function App() {
  const [pathname] = useState(window.location.pathname.replace(/\/$/, '') || '/');
  const [user, setUser] = useState<any>(null);
  const [activeModule, setActiveModule] = useState<ModuleKey>(
    () => PATH_TO_MODULE[window.location.pathname.replace(/\/$/, '') || '/'] ?? 'dashboard'
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    api.me().then(data => {
      if (data?.success) setUser(data.user);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const target = MODULE_TO_PATH[activeModule] ?? '/';
    if (window.location.pathname !== target) {
      window.history.pushState(null, '', target);
    }
  }, [activeModule, user]);

  const legalKind = pathname === '/confidentialite' ? 'privacy' : pathname === '/cookies' ? 'cookies' : pathname === '/mentions-legales' ? 'legal' : null;
  if (legalKind) {
    return <LegalPage kind={legalKind} />;
  }

  // Chemin inconnu (ni page légale, ni module, ni /login) : page 404 standard.
  if (pathname !== '/login' && !(pathname in PATH_TO_MODULE)) {
    return <NotFoundPage />;
  }

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
        return <DashboardPage onNavigate={setActiveModule} />;
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
        return <AdminPage module="imports" />;
      case 'logs':
        return <AdminPage module="logs" />;
      default:
        return <DashboardPage onNavigate={setActiveModule} />;
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
      <div className="app-main">
        <Topbar
          active={activeModule}
          role={user.role}
          user={user}
          onMenu={() => setMobileMenuOpen(true)}
          onLogout={handleLogout}
        />
        <main className="content-area">
          {renderPage()}
        </main>
        <footer className="app-footer">
          <span>FJKM Gestionnaire · Données internes protégées</span>
          <span>Développement : <strong>Narindra Ranjalahy</strong></span>
          <a href="/confidentialite">Confidentialité</a>
        </footer>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
