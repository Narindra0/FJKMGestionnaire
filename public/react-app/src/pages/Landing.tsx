import { useEffect, useState, type CSSProperties } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  FileBarChart,
  FolderKanban,
  Globe,
  HandCoins,
  HeartHandshake,
  LayoutDashboard,
  Mail,
  Menu,
  MessageCircle,
  ShieldCheck,
  TrendingUp,
  Users,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
import VersetDuJour from "../components/VersetDuJour";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { rich, useLang } from "../i18n";
import logoUrl from "../assets/logo.png";
import "./Landing.css";

// La landing est désormais intégrée à l'application : toutes les destinations
// sont des chemins internes du même domaine (plus d'URL absolue ni d'APP_URL).
// Tous les textes visibles viennent des dictionnaires FR/MG (i18n-dicts.ts) ;
// la langue choisie est persistée dans localStorage par le store i18n.
type LandingProps = {
  /** Session déjà ouverte : les CTA basculent de "Se connecter" vers l'app. */
  authed?: boolean;
};

const moduleTones: { icon: LucideIcon; tone: string }[] = [
  { icon: HandCoins, tone: "gold" },
  { icon: ArrowDownToLine, tone: "blue" },
  { icon: Users, tone: "green" },
  { icon: HeartHandshake, tone: "coral" },
  { icon: FolderKanban, tone: "purple" },
  { icon: FileBarChart, tone: "navy" },
];

// « Consultation » n'est pas un lien de navigation : l'accès public se fait
// par le CTA du hero et le lien de la section de fermeture.
const navHrefs = ["#fonctionnalites", "#securite", "#verset", "#equipe", "#faq"];

function Brand({ light = false, ariaLabel }: { light?: boolean; ariaLabel: string }) {
  // Choix produit : sur le site public, seul le logo est affiché ;
  // l'accessibilité (nom du lien) conserve l'intitulé complet.
  return (
    <a className={`brand${light ? " brand-light" : ""}`} href="#accueil" aria-label={ariaLabel}>
      <span className="brand-symbol">
        <img src={logoUrl} alt="" />
      </span>
    </a>
  );
}

function DashboardPreview({ t }: { t: ReturnType<typeof useLang>["t"] }) {
  const p = t.landing.preview;
  return (
    <div className="dashboard-wrap reveal" role="img" aria-label={p.aria}>
      <div className="dashboard-orbit dashboard-orbit-one" aria-hidden="true" />
      <div className="dashboard-orbit dashboard-orbit-two" aria-hidden="true" />
      <div className="dashboard-card">
        <div className="dashboard-topbar">
          <div className="dashboard-brand-mini">
            <span className="dashboard-seal"><BookOpen size={14} aria-hidden="true" /></span>
            <span>{p.space}</span>
          </div>
          <span className="dashboard-live"><i aria-hidden="true" /> {p.live}</span>
        </div>
        <div className="dashboard-main">
          <div className="dashboard-greeting">
            <span className="dashboard-overline">{p.overline}</span>
            <h2>{rich(p.title)}</h2>
            <p>{p.copy}</p>
          </div>
          <div className="dashboard-module-list" aria-label={p.rowsAria}>
            {p.rows.map((row, index) => (
              <div className="dashboard-module-row" key={row.name}>
                <span
                  className={`module-mini-icon ${
                    index === 0 ? "module-mini-gold" : index === 1 ? "module-mini-blue" : "module-mini-green"
                  }`}
                >
                  {index === 0 ? <WalletCards size={17} aria-hidden="true" />
                    : index === 1 ? <ArrowDownToLine size={17} aria-hidden="true" />
                    : <FolderKanban size={17} aria-hidden="true" />}
                </span>
                <span className="dashboard-row-copy">
                  <strong>{row.name}</strong>
                  <small>{row.sub}</small>
                </span>
                <span className={`dashboard-status${index === 1 ? " dashboard-status-muted" : index === 2 ? " dashboard-status-blue" : ""}`}>
                  {index !== 1 && <i aria-hidden="true" />} {row.status}
                </span>
              </div>
            ))}
          </div>
          <div className="dashboard-footnote"><ShieldCheck size={14} aria-hidden="true" /> {p.footnote}</div>
        </div>
      </div>
      <div className="dashboard-float dashboard-float-top" aria-hidden="true">
        <span className="float-check"><Check size={14} /></span>
        <span><strong>{p.floatTop[0]}</strong><small>{p.floatTop[1]}</small></span>
      </div>
      <div className="dashboard-float dashboard-float-bottom" aria-hidden="true">
        <span className="float-open"><BookOpen size={17} /></span>
        <span><strong>{p.floatBottom[0]}</strong><small>{p.floatBottom[1]}</small></span>
      </div>
    </div>
  );
}

export default function Landing({ authed = false }: LandingProps) {
  const { t } = useLang();
  const L = t.landing;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);

  // CTA adaptatifs : connexion pour un visiteur, accès direct à l'app sinon.
  const ctaLabel = authed ? t.common.openDashboard : t.common.login;
  const ctaHref = authed ? "/dashboard" : "/login";
  const ctaIcon: LucideIcon = authed ? LayoutDashboard : ArrowRight;
  const CtaArrow = ctaIcon;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
      return;
    }
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          element.classList.add("is-visible");
          // Les styles en ligne survivent aux re-rendus React : sans eux,
          // un clic en FAQ (changement de className) ferait disparaître
          // les items déjà révélés, l'observateur ne les surveille plus.
          element.style.opacity = "1";
          element.style.transform = "translateY(0)";
          observer.unobserve(element);
        }
      }
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMobileOpen(false);

  return (
    <div className="landing-shell" id="accueil">
      <a className="skip-link" href="#contenu">{L.skipLink}</a>
      <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
        <div className="site-container header-inner">
          <Brand ariaLabel={L.brandAria} />
          <nav className={`main-nav${mobileOpen ? " is-open" : ""}`} id="navigation-principale" aria-label={L.mainNavAria}>
            {navHrefs.map((href, index) => (
              <a href={href} key={href} onClick={closeMenu}>{L.nav[index]}</a>
            ))}
            <a className="nav-login-mobile" href={ctaHref} onClick={closeMenu}>{ctaLabel} <CtaArrow size={16} aria-hidden="true" /></a>
          </nav>
          <div className="header-actions">
            <LanguageSwitcher />
            <a className="button button-primary header-login" href={ctaHref}>
              {ctaLabel} <CtaArrow size={16} aria-hidden="true" />
            </a>
          </div>
          <button
            className="mobile-menu-toggle"
            type="button"
            aria-label={mobileOpen ? L.menuClose : L.menuOpen}
            aria-expanded={mobileOpen}
            aria-controls="navigation-principale"
            onClick={() => setMobileOpen((value) => !value)}
          >
            {mobileOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
          </button>
        </div>
      </header>

      <main id="contenu">
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-background-orbit hero-orbit-one" aria-hidden="true" />
          <div className="hero-background-orbit hero-orbit-two" aria-hidden="true" />
          <div className="site-container hero-grid">
            <div className="hero-copy reveal">
              <span className="hero-eyebrow">
                <span className="eyebrow-line" /> {L.hero.eyebrowPre} <span className="eyebrow-dot">·</span> {L.hero.eyebrowOrg}
              </span>
              <h1 id="hero-title">{rich(L.hero.title)}</h1>
              <p className="hero-description">{L.hero.description}</p>
              <div className="hero-actions">
                <a className="button button-light" href={ctaHref}>{ctaLabel} <CtaArrow size={17} aria-hidden="true" /></a>
                <a className="button button-outline" href="/consultation">{L.hero.ctaConsult} <TrendingUp size={16} aria-hidden="true" /></a>
                <a className="button button-ghost" href="#fonctionnalites">{L.hero.ctaFeatures} <ArrowDownToLine size={16} aria-hidden="true" /></a>
              </div>
              <p className="hero-note"><ShieldCheck size={15} aria-hidden="true" /> {L.hero.note}</p>
            </div>
            <DashboardPreview t={t} />
          </div>
          <div className="hero-bottom-rule" aria-hidden="true"><span /></div>
        </section>

        <VersetDuJour />

        <section className="features-section section-space" id="fonctionnalites" aria-labelledby="features-title">
          <div className="site-container">
            <div className="section-heading section-heading-split reveal">
              <div>
                <span className="eyebrow">{L.features.eyebrow}</span>
                <h2 id="features-title">{rich(L.features.title)}</h2>
              </div>
              <p>{L.features.lead}</p>
            </div>
            <div className="feature-grid">
              {L.features.modules.map((module, index) => {
                const { icon: Icon, tone } = moduleTones[index % moduleTones.length];
                return (
                  <article className={`feature-card feature-card-${tone} reveal`} key={module.title} style={{ "--reveal-delay": `${index * 70}ms` } as CSSProperties}>
                    <div className={`feature-icon feature-icon-${tone}`}><Icon size={22} strokeWidth={1.7} aria-hidden="true" /></div>
                    <h3>{module.title}</h3>
                    <p>{module.copy}</p>
                    <span className="feature-card-index mono">0{index + 1}</span>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="security-section section-space" id="securite" aria-labelledby="security-title">
          <div className="site-container security-grid">
            <div className="security-copy reveal">
              <span className="eyebrow eyebrow-light">{L.security.eyebrow}</span>
              <h2 id="security-title">{rich(L.security.title)}</h2>
              <p>{L.security.copy}</p>
              <a className="text-link text-link-light" href="/confidentialite">
                {L.security.privacyLink} <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
            <div className="security-list reveal" aria-label={L.security.aria}>
              {L.security.safeguards.map((item, index) => (
                <div className="security-item" key={item}>
                  <span className="security-check"><Check size={17} aria-hidden="true" /></span>
                  <span>{item}</span>
                  <span className="security-index mono">0{index + 1}</span>
                </div>
              ))}
              <div className="security-seal" aria-hidden="true"><ShieldCheck size={24} /><span>{rich(L.security.seal)}</span></div>
            </div>
          </div>
          <div className="security-watermark" aria-hidden="true">MALAZA GILEADA</div>
        </section>

        <section className="process-section section-space" aria-labelledby="process-title">
          <div className="site-container">
            <div className="section-heading section-heading-centered reveal">
              <span className="eyebrow">{L.process.eyebrow}</span>
              <h2 id="process-title">{rich(L.process.title)}</h2>
              <p>{L.process.lead}</p>
            </div>
            <div className="step-grid">
              {L.process.steps.map((step, index) => (
                <article className="step-card reveal" key={index} style={{ "--reveal-delay": `${index * 100}ms` } as CSSProperties}>
                  <div className="step-number mono">{String(index + 1).padStart(2, "0")}</div>
                  <div className="step-marker" aria-hidden="true"><span /></div>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="faq-section section-space" id="faq" aria-labelledby="faq-title">
          <div className="site-container faq-grid">
            <div className="faq-intro reveal">
              <span className="eyebrow">{L.faq.eyebrow}</span>
              <h2 id="faq-title">{rich(L.faq.title)}</h2>
              <p>{L.faq.lead}</p>
              <a className="faq-contact-link" href={authed ? "/dashboard" : "/login"}>{authed ? L.faq.ctaAuthed : L.faq.ctaGuest} <ArrowRight size={16} aria-hidden="true" /></a>
            </div>
            <div className="faq-list">
              {L.faq.questions.map((item, index) => {
                const open = activeQuestion === index;
                const answerId = `faq-answer-${index + 1}`;
                return (
                  <article className={`faq-item${open ? " is-open" : ""} reveal`} key={index}>
                    <h3>
                      <button
                        className="faq-question"
                        id={`faq-question-${index + 1}`}
                        type="button"
                        aria-expanded={open}
                        aria-controls={answerId}
                        onClick={() => setActiveQuestion(open ? null : index)}
                      >
                        <span><span className="faq-number mono">0{index + 1}</span>{item.question}</span>
                        <ChevronDown className="faq-chevron" size={18} aria-hidden="true" />
                      </button>
                    </h3>
                    <div className="faq-answer" id={answerId} role="region" aria-labelledby={`faq-question-${index + 1}`} hidden={!open}>
                      <p>{item.answer}{index === 2 && <> <a href="/confidentialite">{L.faq.privacyInline}</a></>}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="dev-section section-space" id="equipe" aria-labelledby="dev-title">
          <div className="site-container">
            <div className="dev-card reveal">
              <span className="dev-seal" aria-hidden="true">{L.dev.initials}</span>
              <span className="eyebrow">{L.dev.eyebrow}</span>
              <h2 id="dev-title">{L.dev.name}</h2>
              <p className="dev-role">{L.dev.role}</p>
              <p className="dev-copy">{L.dev.copy}</p>
              <div className="dev-contacts">
                <a className="dev-contact" href="mailto:Ranjalahy.narindraa@gmail.com">
                  <Mail size={20} aria-hidden="true" />
                  <small>{L.dev.contacts.email}</small>
                  <strong>Ranjalahy.narindraa@gmail.com</strong>
                </a>
                <a className="dev-contact" href="https://wa.me/261328814081" target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={20} aria-hidden="true" />
                  <small>{L.dev.contacts.whatsapp}</small>
                  <strong>032 88 140 81</strong>
                </a>
                <a className="dev-contact" href="https://narindraportfolio.netlify.app" target="_blank" rel="noopener noreferrer">
                  <Globe size={20} aria-hidden="true" />
                  <small>{L.dev.contacts.portfolio}</small>
                  <strong>narindraportfolio.netlify.app</strong>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="closing-section" aria-labelledby="closing-title">
          <div className="closing-ornament" aria-hidden="true" />
          <div className="site-container closing-inner reveal">
            <span className="eyebrow eyebrow-light">{L.closing.eyebrow}</span>
            <h2 id="closing-title">{rich(L.closing.title)}</h2>
            <p>{L.closing.copy}</p>
            <a className="button button-light" href={ctaHref}>{ctaLabel} <CtaArrow size={17} aria-hidden="true" /></a>
            <p className="closing-alt">
              {L.closing.altPre}<a href="/consultation">{L.closing.altLink} <TrendingUp size={15} aria-hidden="true" /></a>
            </p>
          </div>
          <div className="closing-scripture-mark" aria-hidden="true"><BookOpen size={26} strokeWidth={1.3} /></div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-container footer-main">
          <div className="footer-brand-block">
            <Brand light ariaLabel={L.brandAria} />
            <p className="footer-location">{rich(L.footer.parish)}</p>
          </div>
          <div className="footer-legal-block">
            <span className="footer-label">{L.footer.information}</span>
            <a href="/confidentialite">{t.common.privacy}</a>
            <a href="/mentions-legales">{t.common.legal}</a>
          </div>
          <div className="footer-values-block">
            <span className="footer-label">{L.footer.valuesLabel}</span>
            <p>{L.footer.valuesCopy}</p>
            <span className="footer-credit">{L.footer.creditPre}<a href="#equipe">{L.footer.creditName}</a>{L.footer.creditRole}</span>
          </div>
        </div>
        <div className="site-container footer-bottom">
          <span>{L.footer.rights.replace("{year}", String(new Date().getFullYear()))}</span>
          <span className="corpus-credit">{L.footer.corpus}</span>
          <span className="footer-made"><span aria-hidden="true">✦</span> {L.footer.motto}</span>
        </div>
      </footer>
    </div>
  );
}
