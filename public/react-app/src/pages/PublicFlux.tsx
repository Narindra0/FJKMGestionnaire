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

const MONTHS_FR = ["Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc."];

const formatMGA = (value: number) => `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value)} Ar`;

const formatDate = (iso: string) => {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
};

// Échelle compacte pour les axes : 1 200 000 -> 1,2 M
const formatAxis = (value: number) => {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} k`;
  return String(value);
};

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: any }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="flux-tooltip">
      <strong>{label}</strong>
      {payload.map((item) => (
        <span key={item.dataKey} className={item.dataKey === "entries" ? "flux-tooltip-in" : "flux-tooltip-out"}>
          {item.dataKey === "entries" ? "Entrées" : "Sorties"} · {formatMGA(item.value)}
        </span>
      ))}
    </div>
  );
}

function CategoryList({ rows, tone, empty }: { rows: CategoryRow[]; tone: "in" | "out"; empty: string }) {
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
          <small>{row.operations} opération{row.operations > 1 ? "s" : ""}</small>
        </li>
      ))}
    </ul>
  );
}

export default function PublicFluxPage() {
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
        if (!response.ok) throw new Error("Service temporairement indisponible.");
        const payload = await response.json();
        if (!payload?.success) throw new Error("Réponse inattendue du service public.");
        setData(payload);
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") setError(err.message || "Erreur de chargement.");
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [selectedYear, reloadKey]);

  useEffect(() => {
    document.title = "Consultation publique des flux · FJKM Gestionnaire";
    return () => {
      document.title = "FJKM Gestionnaire";
    };
  }, []);

  const totals = data?.totals ?? { entries: 0, exits: 0, balance: 0 };
  const activeYear = data?.year ?? null;
  const chartData = (data?.months ?? []).map((point) => ({ ...point, label: MONTHS_FR[point.month - 1] ?? point.label }));
  const hasData = !!data && (totals.entries > 0 || totals.exits > 0 || (data.movements?.length ?? 0) > 0);
  const balanceNegative = totals.balance < 0;

  return (
    <div className="landing-shell flux-page">
      <header className="site-header is-scrolled">
        <div className="site-container header-inner">
          <a className="brand" href="/" aria-label="Retour à l'accueil FJKM Gestionnaire">
            <span className="brand-symbol">
              <img src={logoUrl} alt="" />
            </span>
          </a>
          <span className="flux-header-title">
            Consultation publique
            <small>FJKM Malaza Gileada</small>
          </span>
          <div className="flux-header-actions">
            <a className="button button-outline" href="/">
              <ChevronLeft size={16} aria-hidden="true" /> Accueil
            </a>
            <a className="button button-primary" href="/login">
              Se connecter
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="flux-hero">
          <div className="site-container">
            <span className="hero-eyebrow">
              <span className="eyebrow-line" /> ESPACE PUBLIC <span className="eyebrow-dot">·</span> LECTURE SEULE
            </span>
            <h1>
              Les flux d&apos;argent de la paroisse,<br />
              <em>clairs et vérifiables.</em>
            </h1>
            <p className="flux-hero-copy">
              Consultez les entrées et les sorties sans créer de compte ni saisir de mot de passe.
              Seules des informations agrégées sont publiées : montants, catégories et mois — jamais de noms ni de détails internes.
            </p>
            <div className="flux-toolbar">
              <div className="flux-years" role="group" aria-label="Choisir l'année">
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
                {loading ? "Chargement…" : "Actualiser"}
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
                  Réessayer
                </button>
              </div>
            )}

            {!error && !data && loading && (
              <div className="flux-loading" aria-live="polite">
                <span className="flux-loading-dot" />
                Chargement des données publiques…
              </div>
            )}

            {data && hasData && (
              <>
                <div className="flux-kpi-grid">
                  <article className="flux-kpi flux-kpi-in">
                    <span className="flux-kpi-icon"><ArrowDownToLine size={19} aria-hidden="true" /></span>
                    <span className="flux-kpi-label">Total des entrées {activeYear}</span>
                    <strong className="flux-kpi-value mono">{formatMGA(totals.entries)}</strong>
                    <small>Contributions, communion, obligations et projets réunis.</small>
                  </article>
                  <article className="flux-kpi flux-kpi-out">
                    <span className="flux-kpi-icon"><ArrowUpFromLine size={19} aria-hidden="true" /></span>
                    <span className="flux-kpi-label">Total des sorties {activeYear}</span>
                    <strong className="flux-kpi-value mono">{formatMGA(totals.exits)}</strong>
                    <small>Dépenses de fonctionnement et de la vie communautaire.</small>
                  </article>
                  <article className={`flux-kpi flux-kpi-balance${balanceNegative ? " is-negative" : ""}`}>
                    <span className="flux-kpi-icon"><Scale size={19} aria-hidden="true" /></span>
                    <span className="flux-kpi-label">Solde de l&apos;année</span>
                    <strong className="flux-kpi-value mono">{formatMGA(totals.balance)}</strong>
                    <small>{balanceNegative ? "Les sorties dépassent les entrées sur la période." : "Les entrées couvrent les sorties de la période."}</small>
                  </article>
                </div>

                <div className="flux-panel">
                  <div className="flux-panel-head">
                    <div>
                      <span className="eyebrow">MOIS PAR MOIS</span>
                      <h2>Entrées et sorties d&apos;argent · {activeYear}</h2>
                    </div>
                    <span className="flux-legend">
                      <span><i className="flux-legend-dot flux-legend-in" /> Entrées</span>
                      <span><i className="flux-legend-dot flux-legend-out" /> Sorties</span>
                    </span>
                  </div>
                  <div className="flux-chart">
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e8e1d7" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#18324a" }} axisLine={{ stroke: "#e8e1d7" }} tickLine={false} />
                        <YAxis tickFormatter={formatAxis} tick={{ fontSize: 11, fill: "#7a7f80" }} axisLine={false} tickLine={false} width={52} />
                        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(16, 42, 67, 0.05)" }} />
                        <Bar dataKey="entries" fill="#287d68" radius={[4, 4, 0, 0]} maxBarSize={26} name="Entrées" />
                        <Bar dataKey="exits" fill="#c95c55" radius={[4, 4, 0, 0]} maxBarSize={26} name="Sorties" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="flux-two-col">
                  <div className="flux-panel">
                    <div className="flux-panel-head flux-panel-head-compact">
                      <span className="eyebrow">DÉTAIL DES RECETTES</span>
                      <h2>Catégories d&apos;entrées</h2>
                    </div>
                    <CategoryList rows={data.categories.entries} tone="in" empty="Aucune entrée de caisse catégorisée cette année." />
                  </div>
                  <div className="flux-panel">
                    <div className="flux-panel-head flux-panel-head-compact">
                      <span className="eyebrow">DÉTAIL DES DÉPENSES</span>
                      <h2>Catégories de sorties</h2>
                    </div>
                    <CategoryList rows={data.categories.exits} tone="out" empty="Aucune sortie de caisse catégorisée cette année." />
                  </div>
                </div>

                <div className="flux-panel">
                  <div className="flux-panel-head">
                    <div>
                      <span className="eyebrow">DERNIERS MOUVEMENTS</span>
                      <h2>Les 12 derniers enregistrements · {activeYear}</h2>
                    </div>
                    <span className="flux-readonly-badge"><WalletCards size={14} aria-hidden="true" /> Lecture seule</span>
                  </div>
                  <div className="flux-table-wrap">
                    <table className="flux-table">
                      <thead>
                        <tr>
                          <th scope="col">Date</th>
                          <th scope="col">Type</th>
                          <th scope="col">Catégorie</th>
                          <th scope="col" className="flux-table-amount">Montant</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.movements.map((movement, index) => (
                          <tr key={`${movement.date}-${movement.type}-${movement.category}-${index}`}>
                            <td>{formatDate(movement.date)}</td>
                            <td>
                              <span className={`flux-type-pill${movement.type === "entree" ? " flux-type-in" : " flux-type-out"}`}>
                                {movement.type === "entree" ? "Entrée" : "Sortie"}
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
                  <p className="flux-table-note">
                    Pour protéger la vie privée des fidèles, ni les noms, ni les libellés internes, ni les références ne sont publiés.
                  </p>
                </div>

                <div className="flux-privacy-strip">
                  <ShieldCheck size={17} aria-hidden="true" />
                  <p>
                    <strong>Un espace de consultation, pas de gestion.</strong>{" "}
                    Les données affichées sont en lecture seule et ne peuvent être modifiées ici.
                    Pour saisir ou corriger un mouvement, passez par l&apos;espace des membres habilités.
                  </p>
                  <a className="button button-primary" href="/login">Accéder à mon espace</a>
                </div>
              </>
            )}

            {data && !hasData && !loading && (
              <div className="flux-panel flux-empty-state">
                <span className="eyebrow">ANNÉE {activeYear}</span>
                <h2>Aucun flux publié pour l&apos;instant</h2>
                <p>Les enregistrements de {activeYear} apparaîtront ici dès la première saisie validée par les responsables.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-container footer-bottom">
          <span>© {new Date().getFullYear()} FJKM Malaza Gileada · Consultation publique en lecture seule</span>
          <span className="footer-made">
            <a href="/confidentialite">Confidentialité</a>
            <a href="/mentions-legales">Mentions légales</a>
          </span>
        </div>
      </footer>
    </div>
  );
}
