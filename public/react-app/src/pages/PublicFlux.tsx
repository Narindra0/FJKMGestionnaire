import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronLeft,
  RefreshCw,
  Scale,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import logoUrl from "../assets/logo.png";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { rich, useLang } from "../i18n";
import "./Landing.css";
import "./PublicFlux.css";

// Espace public de consultation : lecture seule, sans session, sans donnée
// nominative. Les montants affichés proviennent de /api/public/flux qui
// n'expose que des agrégats (totaux, mois, catégories, montants).
const API_BASE = import.meta.env.MODE === "development" ? "http://localhost:8000/api" : "/api";

type MonthPoint = { month: number; label: string; entries: number; exits: number; balance: number };
type Movement = { date: string; type: "entree" | "sortie"; category: string; amount: number };
type CategoryRow = { category: string; total: number; operations: number };

type FluxData = {
  success: boolean;
  year: number;
  years: number[];
  totals: { entries: number; exits: number; balance: number };
  months: MonthPoint[];
  categories: { entries: CategoryRow[]; exits: CategoryRow[] };
  movements: Movement[];
};

const formatMGA = (value: number) => `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value)} Ar`;

// Date affichée avec les mots du dictionnaire (locale "mg" indisponible selon
// les navigateurs) : jour + mois court + année.
const makeFormatDate = (months: string[]) => (iso: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return iso;
  const [, y, m, d] = match;
  const monthName = months[Number(m) - 1] ?? m;
  return `${Number(d)} ${monthName} ${y}`;
};

// Échelle compacte pour les axes : 1 200 000 -> 1,2 M
const formatAxis = (value: number) => {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} k`;
  return String(value);
};

function ChartTooltip({ active, payload, label, inLabel, outLabel }: { active?: boolean; payload?: any[]; label?: any; inLabel: string; outLabel: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="flux-tooltip">
      <strong>{label}</strong>
      {payload.map((item) => (
        <span key={item.dataKey} className={item.dataKey === "entries" ? "flux-tooltip-in" : "flux-tooltip-out"}>
          {item.dataKey === "entries" ? inLabel : outLabel} · {formatMGA(item.value)}
        </span>
      ))}
    </div>
  );
}

function CategoryList({ rows, tone, empty, operationsWord }: { rows: CategoryRow[]; tone: "in" | "out"; empty: string; operationsWord: (n: number) => string }) {
  if (!rows.length) return <p className="flux-empty">{empty}</p>;
  const max = Math.max(...rows.map((row) => row.total), 1);
  return (
    <ul className="flux-category-list">
      {rows.map((row) => (
        <li key={row.category}>
          <div className="flux-category-top">
            <span className="flux-category-name">{row.category}</span>
            <span className="flux-category-amount mono">{formatMGA(row.total)}</span>
          </div>
          <div className="flux-category-track" aria-hidden="true">
            <span className={`flux-category-fill flux-category-fill-${tone}`} style={{ width: `${Math.max(3, (row.total / max) * 100)}%` }} />
          </div>
          <small>{row.operations} {operationsWord(row.operations)}</small>
        </li>
      ))}
    </ul>
  );
}

export default function PublicFluxPage() {
  const { t } = useLang();
  const F = t.flux;
  const [data, setData] = useState<FluxData | null>(null);
  // null = année par défaut du serveur (année courante) ; définie quand
  // l'utilisateur choisit une année dans le sélecteur.
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    const url = `${API_BASE}/public/flux${selectedYear ? `?year=${selectedYear}` : ""}`;
    fetch(url, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(F.errors.unavailable);
        const payload = await response.json();
        if (!payload?.success) throw new Error(F.errors.unexpected);
        setData(payload);
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") setError(err.message || F.errors.load);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [selectedYear, reloadKey, F]);

  useEffect(() => {
    document.title = F.docTitle;
    return () => {
      document.title = "FJKM Gestionnaire";
    };
  }, [F]);

  const formatDate = makeFormatDate(F.months);
  const operationsWord = (count: number) => {
    const [single, plural] = F.categories.operations.split("|");
    return count > 1 ? plural : single;
  };

  const totals = data?.totals ?? { entries: 0, exits: 0, balance: 0 };
  const activeYear = data?.year ?? null;
  const chartData = (data?.months ?? []).map((point) => ({ ...point, label: F.months[point.month - 1] ?? point.label }));
  const hasData = !!data && (totals.entries > 0 || totals.exits > 0 || (data.movements?.length ?? 0) > 0);
  const balanceNegative = totals.balance < 0;

  return (
    <div className="landing-shell flux-page">
      <header className="site-header is-scrolled">
        <div className="site-container header-inner">
          <a className="brand" href="/" aria-label={t.landing.brandAria}>
            <span className="brand-symbol">
              <img src={logoUrl} alt="" />
            </span>
          </a>
          <span className="flux-header-title">
            {F.headerTitle}
            <small>{F.headerSub}</small>
          </span>
          <div className="flux-header-actions">
            <LanguageSwitcher />
            <a className="button button-outline" href="/">
              <ChevronLeft size={16} aria-hidden="true" /> {t.common.home}
            </a>
            <a className="button button-primary" href="/login">
              {t.common.login}
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="flux-hero">
          <div className="site-container">
            <span className="hero-eyebrow">
              <span className="eyebrow-line" /> {F.hero.eyebrowPre} <span className="eyebrow-dot">·</span> {F.hero.eyebrowTag}
            </span>
            <h1>{rich(F.hero.title)}</h1>
            <p className="flux-hero-copy">{F.hero.copy}</p>
            <div className="flux-toolbar">
              <div className="flux-years" role="group" aria-label={F.hero.yearsAria}>
                {(data?.years ?? []).map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`flux-year-pill${option === activeYear ? " is-active" : ""}`}
                    onClick={() => setSelectedYear(option)}
                    disabled={loading}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <button className="flux-refresh" type="button" onClick={() => setReloadKey((key) => key + 1)} disabled={loading}>
                <RefreshCw size={14} aria-hidden="true" className={loading ? "is-spinning" : ""} />
                {loading ? F.hero.loading : F.hero.refresh}
              </button>
            </div>
          </div>
        </section>

        <section className="flux-content">
          <div className="site-container">
            {error && (
              <div className="flux-panel flux-error" role="alert">
                <p>{error}</p>
                <button className="button button-primary" type="button" onClick={() => setReloadKey((key) => key + 1)}>
                  {F.errors.retry}
                </button>
              </div>
            )}

            {!error && !data && loading && (
              <div className="flux-loading" aria-live="polite">
                <span className="flux-loading-dot" />
                {F.hero.loading}
              </div>
            )}

            {data && hasData && (
              <>
                <div className="flux-kpi-grid">
                  <article className="flux-kpi flux-kpi-in">
                    <span className="flux-kpi-icon"><ArrowDownToLine size={19} aria-hidden="true" /></span>
                    <span className="flux-kpi-label">{F.kpi.entries.replace("{year}", String(activeYear))}</span>
                    <strong className="flux-kpi-value mono">{formatMGA(totals.entries)}</strong>
                    <small>{F.kpi.entriesNote}</small>
                  </article>
                  <article className="flux-kpi flux-kpi-out">
                    <span className="flux-kpi-icon"><ArrowUpFromLine size={19} aria-hidden="true" /></span>
                    <span className="flux-kpi-label">{F.kpi.exits.replace("{year}", String(activeYear))}</span>
                    <strong className="flux-kpi-value mono">{formatMGA(totals.exits)}</strong>
                    <small>{F.kpi.exitsNote}</small>
                  </article>
                  <article className={`flux-kpi flux-kpi-balance${balanceNegative ? " is-negative" : ""}`}>
                    <span className="flux-kpi-icon"><Scale size={19} aria-hidden="true" /></span>
                    <span className="flux-kpi-label">{F.kpi.balance}</span>
                    <strong className="flux-kpi-value mono">{formatMGA(totals.balance)}</strong>
                    <small>{balanceNegative ? F.kpi.balanceNegative : F.kpi.balancePositive}</small>
                  </article>
                </div>

                <div className="flux-panel">
                  <div className="flux-panel-head">
                    <div>
                      <span className="eyebrow">{F.chart.eyebrow}</span>
                      <h2>{F.chart.title.replace("{year}", String(activeYear))}</h2>
                    </div>
                    <span className="flux-legend">
                      <span><i className="flux-legend-dot flux-legend-in" /> {F.chart.legendIn}</span>
                      <span><i className="flux-legend-dot flux-legend-out" /> {F.chart.legendOut}</span>
                    </span>
                  </div>
                  <div className="flux-chart">
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e8e1d7" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#18324a" }} axisLine={{ stroke: "#e8e1d7" }} tickLine={false} />
                        <YAxis tickFormatter={formatAxis} tick={{ fontSize: 11, fill: "#7a7f80" }} axisLine={false} tickLine={false} width={52} />
                        <Tooltip content={<ChartTooltip inLabel={F.chart.tooltipIn} outLabel={F.chart.tooltipOut} />} cursor={{ fill: "rgba(16, 42, 67, 0.05)" }} />
                        <Bar dataKey="entries" fill="#287d68" radius={[4, 4, 0, 0]} maxBarSize={26} name={F.chart.legendIn} />
                        <Bar dataKey="exits" fill="#c95c55" radius={[4, 4, 0, 0]} maxBarSize={26} name={F.chart.legendOut} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="flux-two-col">
                  <div className="flux-panel">
                    <div className="flux-panel-head flux-panel-head-compact">
                      <span className="eyebrow">{F.categories.eyebrowIn}</span>
                      <h2>{F.categories.titleIn}</h2>
                    </div>
                    <CategoryList rows={data.categories.entries} tone="in" empty={F.categories.emptyIn} operationsWord={operationsWord} />
                  </div>
                  <div className="flux-panel">
                    <div className="flux-panel-head flux-panel-head-compact">
                      <span className="eyebrow">{F.categories.eyebrowOut}</span>
                      <h2>{F.categories.titleOut}</h2>
                    </div>
                    <CategoryList rows={data.categories.exits} tone="out" empty={F.categories.emptyOut} operationsWord={operationsWord} />
                  </div>
                </div>

                <div className="flux-panel">
                  <div className="flux-panel-head">
                    <div>
                      <span className="eyebrow">{F.movements.eyebrow}</span>
                      <h2>{F.movements.title.replace("{year}", String(activeYear))}</h2>
                    </div>
                    <span className="flux-readonly-badge"><WalletCards size={14} aria-hidden="true" /> {F.movements.readonly}</span>
                  </div>
                  <div className="flux-table-wrap">
                    <table className="flux-table">
                      <thead>
                        <tr>
                          {F.movements.columns.map((column) => (
                            <th key={column} scope="col" className={column === F.movements.columns[3] ? "flux-table-amount" : undefined}>
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.movements.map((movement, index) => (
                          <tr key={`${movement.date}-${movement.type}-${movement.category}-${index}`}>
                            <td>{formatDate(movement.date)}</td>
                            <td>
                              <span className={`flux-type-pill${movement.type === "entree" ? " flux-type-in" : " flux-type-out"}`}>
                                {movement.type === "entree" ? F.movements.entree : F.movements.sortie}
                              </span>
                            </td>
                            <td>{movement.category}</td>
                            <td className={`flux-table-amount mono${movement.type === "entree" ? " flux-amount-in" : " flux-amount-out"}`}>
                              {movement.type === "entree" ? "+" : "−"} {formatMGA(movement.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="flux-table-note">{F.movements.note}</p>
                </div>

                <div className="flux-privacy-strip">
                  <ShieldCheck size={17} aria-hidden="true" />
                  <p><strong>{F.privacy.strong}</strong>{F.privacy.copy}</p>
                  <a className="button button-primary" href="/login">{F.privacy.cta}</a>
                </div>
              </>
            )}

            {data && !hasData && !loading && (
              <div className="flux-panel flux-empty-state">
                <span className="eyebrow">{F.empty.eyebrow.replace("{year}", String(activeYear))}</span>
                <h2>{F.empty.title}</h2>
                <p>{F.empty.copy.replace("{year}", String(activeYear))}</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-container footer-bottom">
          <span>© {new Date().getFullYear()} FJKM Malaza Gileada · {F.footerNote}</span>
          <span className="footer-made">
            <a href="/confidentialite">{t.common.privacy}</a>
            <a href="/mentions-legales">{t.common.legal}</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
