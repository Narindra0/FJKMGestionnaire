import { useEffect, useState, type CSSProperties } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
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
  Users,
  WalletCards,
  X,
  type LucideIcon,
} from "lucide-react";
import VersetDuJour from "../components/VersetDuJour";
import logoUrl from "../assets/logo.png";
import "./Landing.css";

// La landing est désormais intégrée à l'application : toutes les destinations
// sont des chemins internes du même domaine (plus d'URL absolue ni d'APP_URL).
type LandingProps = {
  /** Session déjà ouverte : les CTA basculent de "Se connecter" vers l'app. */
  authed?: boolean;
};

const modules: { icon: LucideIcon; title: string; copy: string; tone: string }[] = [
  {
    icon: HandCoins,
    title: "Obligations · adidy",
    copy: "Suivez les adidy mois par mois, avec relances et soldes calculés automatiquement.",
    tone: "gold",
  },
  {
    icon: ArrowDownToLine,
    title: "Entrées & sorties",
    copy: "Enregistrez chaque mouvement de caisse et visualisez la trésorerie en temps réel.",
    tone: "blue",
  },
  {
    icon: Users,
    title: "Fidèles",
    copy: "Un annuaire complet : matricule, groupe, baptême, communion et coordonnées.",
    tone: "green",
  },
  {
    icon: HeartHandshake,
    title: "Communion",
    copy: "Paiements de communion par période, avec tableaux de bord dédiés.",
    tone: "coral",
  },
  {
    icon: FolderKanban,
    title: "Projets",
    copy: "Créez les projets de l’église et suivez budgets, dépenses et avancement.",
    tone: "purple",
  },
  {
    icon: FileBarChart,
    title: "Rapports & exports",
    copy: "Rapports filtrables et exports PDF et Excel pour les responsables.",
    tone: "navy",
  },
];

const safeguards = [
  "Mots de passe hachés et sessions sécurisées",
  "Rôles distincts : ADMIN, USER, VISITEUR",
  "Journalisation des actions pour un suivi clair",
  "Protection CSRF, XSS et injection SQL",
];

const steps = [
  { number: "01", title: "Connexion", copy: "Chaque membre reçoit ses accès depuis l’administration." },
  { number: "02", title: "Saisie", copy: "Enregistrez obligations, entrées, sorties et communion au fil de l’eau." },
  { number: "03", title: "Suivi", copy: "Consultez tableaux de bord, rapports et exports quand vous en avez besoin." },
];

const questions = [
  {
    question: "Qui peut accéder à l’application ?",
    answer: "L’accès est réservé aux membres habilités de FJKM Malaza Gileada. Les rôles ADMIN, USER et VISITEUR définissent les accès selon les responsabilités confiées.",
  },
  {
    question: "Que se passe-t-il si j’oublie mon mot de passe ?",
    answer: "Contactez un administrateur : la réinitialisation est gérée uniquement par l’ADMIN.",
  },
  {
    question: "Les données sont-elles sécurisées ?",
    answer: "L’application applique des protections des comptes, des accès et des opérations décrites dans la section Sécurité. Consultez également la politique de confidentialité.",
  },
  {
    question: "Puis-je exporter les rapports ?",
    answer: "Oui. Les rapports peuvent être imprimés ou exportés aux formats PDF, Excel et CSV pour faciliter le suivi des responsables.",
  },
  {
    question: "L’application fonctionne-t-elle sur mobile ?",
    answer: "Oui. L’interface est responsive et s’adapte aux écrans mobiles. L’application est également conçue pour un usage de type PWA.",
  },
];

const navItems = [
  ["Fonctionnalités", "#fonctionnalites"],
  ["Sécurité", "#securite"],
  ["Verset du jour", "#verset"],
  ["Équipe", "#equipe"],
  ["FAQ", "#faq"],
];

function Brand({ light = false }: { light?: boolean }) {
  // Choix produit : sur le site public, seul le logo est affiché ;
  // l'accessibilité (nom du lien) conserve l'intitulé complet.
  return (
    <a className={`brand${light ? " brand-light" : ""}`} href="#accueil" aria-label="FJKM Gestionnaire — accueil">
      <span className="brand-symbol">
        <img src={logoUrl} alt="" />
      </span>
    </a>
  );
}

function DashboardPreview() {
  return (
    <div className="dashboard-wrap reveal" role="img" aria-label="Aperçu illustratif de l’application, avec des libellés génériques">
      <div className="dashboard-orbit dashboard-orbit-one" aria-hidden="true" />
      <div className="dashboard-orbit dashboard-orbit-two" aria-hidden="true" />
      <div className="dashboard-card">
        <div className="dashboard-topbar">
          <div className="dashboard-brand-mini">
            <span className="dashboard-seal"><BookOpen size={14} aria-hidden="true" /></span>
            <span>ESPACE PAROISSIAL</span>
          </div>
          <span className="dashboard-live"><i aria-hidden="true" /> Espace de gestion</span>
        </div>
        <div className="dashboard-main">
          <div className="dashboard-greeting">
            <span className="dashboard-overline">VOTRE PAROISSE · EN UN SEUL ESPACE</span>
            <h2>Le registre, avec<br />plus de sérénité.</h2>
            <p>Des outils pour servir la communauté au quotidien.</p>
          </div>
          <div className="dashboard-module-list" aria-label="Exemples de modules">
            <div className="dashboard-module-row">
              <span className="module-mini-icon module-mini-gold"><WalletCards size={17} aria-hidden="true" /></span>
              <span className="dashboard-row-copy"><strong>Adidy</strong><small>Suivi des obligations</small></span>
              <span className="dashboard-status"><i aria-hidden="true" /> À jour</span>
            </div>
            <div className="dashboard-module-row">
              <span className="module-mini-icon module-mini-blue"><ArrowUpFromLine size={17} aria-hidden="true" /></span>
              <span className="dashboard-row-copy"><strong>Mouvements</strong><small>Entrées & sorties</small></span>
              <span className="dashboard-status dashboard-status-muted">Registre</span>
            </div>
            <div className="dashboard-module-row">
              <span className="module-mini-icon module-mini-green"><FolderKanban size={17} aria-hidden="true" /></span>
              <span className="dashboard-row-copy"><strong>Projets</strong><small>Avancement partagé</small></span>
              <span className="dashboard-status dashboard-status-blue">En cours</span>
            </div>
          </div>
          <div className="dashboard-footnote"><ShieldCheck size={14} aria-hidden="true" /> Des informations accessibles aux personnes habilitées</div>
        </div>
      </div>
      <div className="dashboard-float dashboard-float-top" aria-hidden="true">
        <span className="float-check"><Check size={14} /></span>
        <span><strong>Un seul espace</strong><small>Pour votre communauté</small></span>
      </div>
      <div className="dashboard-float dashboard-float-bottom" aria-hidden="true">
        <span className="float-open"><BookOpen size={17} /></span>
        <span><strong>Foi & gestion</strong><small>Au service de l’église</small></span>
      </div>
    </div>
  );
}

export default function Landing({ authed = false }: LandingProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);

  // CTA adaptatifs : connexion pour un visiteur, accès direct à l'app sinon.
  const ctaLabel = authed ? "Ouvrir le tableau de bord" : "Se connecter";
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
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMobileOpen(false);

  return (
    <div className="landing-shell" id="accueil">
      <a className="skip-link" href="#contenu">Aller au contenu</a>
      <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
        <div className="site-container header-inner">
          <Brand />
          <nav className={`main-nav${mobileOpen ? " is-open" : ""}`} id="navigation-principale" aria-label="Navigation principale">
            {navItems.map(([label, href]) => (
              <a href={href} key={href} onClick={closeMenu}>{label}</a>
            ))}
            <a className="nav-login-mobile" href={ctaHref} onClick={closeMenu}>{ctaLabel} <CtaArrow size={16} aria-hidden="true" /></a>
          </nav>
          <a className="button button-primary header-login" href={ctaHref}>
            {ctaLabel} <CtaArrow size={16} aria-hidden="true" />
          </a>
          <button
            className="mobile-menu-toggle"
            type="button"
            aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
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
              <span className="hero-eyebrow"><span className="eyebrow-line" /> REGISTRE COMMUNAUTAIRE <span className="eyebrow-dot">·</span> FJKM MALAZA GILEADA</span>
              <h1 id="hero-title">Une gestion claire<br />pour une <em>communauté engagée.</em></h1>
              <p className="hero-description">Suivez les obligations, les contributions, les fidèles et les projets de votre paroisse dans un même espace de confiance.</p>
              <div className="hero-actions">
                <a className="button button-light" href={ctaHref}>{ctaLabel} <CtaArrow size={17} aria-hidden="true" /></a>
                <a className="button button-outline" href="#fonctionnalites">Découvrir les fonctionnalités <ArrowDownToLine size={16} aria-hidden="true" /></a>
              </div>
              <p className="hero-note"><ShieldCheck size={15} aria-hidden="true" /> Accès réservé aux membres habilités</p>
            </div>
            <DashboardPreview />
          </div>
          <div className="hero-bottom-rule" aria-hidden="true"><span /></div>
        </section>

        <VersetDuJour />

        <section className="features-section section-space" id="fonctionnalites" aria-labelledby="features-title">
          <div className="site-container">
            <div className="section-heading section-heading-split reveal">
              <div>
                <span className="eyebrow">LES OUTILS DU QUOTIDIEN</span>
                <h2 id="features-title">Tout le registre de la paroisse,<br /><em>un seul outil.</em></h2>
              </div>
              <p>Du suivi des obligations aux projets de l’église, chaque module aide les responsables à travailler avec clarté et à mieux servir la communauté.</p>
            </div>
            <div className="feature-grid">
              {modules.map((module, index) => {
                const Icon = module.icon;
                return (
                  <article className={`feature-card feature-card-${module.tone} reveal`} key={module.title} style={{ "--reveal-delay": `${index * 70}ms` } as CSSProperties}>
                    <div className={`feature-icon feature-icon-${module.tone}`}><Icon size={22} strokeWidth={1.7} aria-hidden="true" /></div>
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
              <span className="eyebrow eyebrow-light">CONFIANCE & RESPONSABILITÉ</span>
              <h2 id="security-title">Des données réservées<br />aux utilisateurs <em>autorisés.</em></h2>
              <p>La rigueur dans la gestion va de pair avec le respect de la confiance confiée à chaque responsable.</p>
              <a className="text-link text-link-light" href="/confidentialite">
                Lire la politique de confidentialité <ArrowRight size={16} aria-hidden="true" />
              </a>
            </div>
            <div className="security-list reveal" aria-label="Mesures de sécurité">
              {safeguards.map((item, index) => (
                <div className="security-item" key={item}>
                  <span className="security-check"><Check size={17} aria-hidden="true" /></span>
                  <span>{item}</span>
                  <span className="security-index mono">0{index + 1}</span>
                </div>
              ))}
              <div className="security-seal" aria-hidden="true"><ShieldCheck size={24} /><span>PROTÉGER<br />& SERVIR</span></div>
            </div>
          </div>
          <div className="security-watermark" aria-hidden="true">MALAZA GILEADA</div>
        </section>

        <section className="process-section section-space" aria-labelledby="process-title">
          <div className="site-container">
            <div className="section-heading section-heading-centered reveal">
              <span className="eyebrow">SIMPLE ET BIEN ORDONNÉ</span>
              <h2 id="process-title">Prêt en <em>trois étapes.</em></h2>
              <p>Un parcours clair, au service de la gestion de votre paroisse.</p>
            </div>
            <div className="step-grid">
              {steps.map((step, index) => (
                <article className="step-card reveal" key={step.number} style={{ "--reveal-delay": `${index * 100}ms` } as CSSProperties}>
                  <div className="step-number mono">{step.number}</div>
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
              <span className="eyebrow">VOUS ACCOMPAGNER</span>
              <h2 id="faq-title">Questions<br /><em>fréquentes.</em></h2>
              <p>Quelques repères pour accéder à votre espace et l’utiliser au quotidien.</p>
              <a className="faq-contact-link" href={authed ? "/dashboard" : "/login"}>{authed ? "Ouvrir mon espace" : "Accéder à mon espace"} <ArrowRight size={16} aria-hidden="true" /></a>
            </div>
            <div className="faq-list">
              {questions.map((item, index) => {
                const open = activeQuestion === index;
                const answerId = `faq-answer-${index + 1}`;
                return (
                  <article className={`faq-item${open ? " is-open" : ""} reveal`} key={item.question}>
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
                      <p>{item.answer}{index === 2 && <> <a href="/confidentialite">Consulter la politique de confidentialité.</a></>}</p>
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
              <span className="dev-seal" aria-hidden="true">NR</span>
              <span className="eyebrow">LE PROJET ET SON ARTISAN</span>
              <h2 id="dev-title">Narindra Ranjalahy</h2>
              <p className="dev-role">Lead Développeur — FJKM Gestionnaire</p>
              <p className="dev-copy">
                À la conception et au développement de cet outil de gestion, du premier écran jusqu’à la mise
                en ligne. Une question sur le fonctionnement ou une envie de faire évoluer l’application ?
                Il est à l’écoute de la communauté.
              </p>
              <div className="dev-contacts">
                <a className="dev-contact" href="mailto:Ranjalahy.narindraa@gmail.com">
                  <Mail size={20} aria-hidden="true" />
                  <small>E-mail</small>
                  <strong>Ranjalahy.narindraa@gmail.com</strong>
                </a>
                <a className="dev-contact" href="https://wa.me/261328814081" target="_blank" rel="noopener noreferrer">
                  <MessageCircle size={20} aria-hidden="true" />
                  <small>WhatsApp</small>
                  <strong>032 88 140 81</strong>
                </a>
                <a className="dev-contact" href="https://narindraportfolio.netlify.app" target="_blank" rel="noopener noreferrer">
                  <Globe size={20} aria-hidden="true" />
                  <small>Portfolio</small>
                  <strong>narindraportfolio.netlify.app</strong>
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="closing-section" aria-labelledby="closing-title">
          <div className="closing-ornament" aria-hidden="true" />
          <div className="site-container closing-inner reveal">
            <span className="eyebrow eyebrow-light">AU SERVICE DE LA COMMUNAUTÉ</span>
            <h2 id="closing-title">Rejoignez l’espace de gestion<br /><em>de votre communauté.</em></h2>
            <p>Accès réservé aux membres habilités de FJKM Malaza Gileada.</p>
            <a className="button button-light" href={ctaHref}>{ctaLabel} <CtaArrow size={17} aria-hidden="true" /></a>
          </div>
          <div className="closing-scripture-mark" aria-hidden="true"><BookOpen size={26} strokeWidth={1.3} /></div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-container footer-main">
          <div className="footer-brand-block">
            <Brand light />
            <p className="footer-location">FJKM Malaza Gileada<br />Antananarivo · Madagascar</p>
          </div>
          <div className="footer-legal-block">
            <span className="footer-label">INFORMATIONS</span>
            <a href="/confidentialite">Confidentialité</a>
            <a href="/mentions-legales">Mentions légales</a>
          </div>
          <div className="footer-values-block">
            <span className="footer-label">UNE GESTION AU SERVICE DE L’ÉGLISE</span>
            <p>Un outil de confiance pour une communauté engagée.</p>
            <span className="footer-credit">Développement : <a href="#equipe">Narindra Ranjalahy</a>, Lead Développeur</span>
          </div>
        </div>
        <div className="site-container footer-bottom">
          <span>© {new Date().getFullYear()} FJKM Malaza Gileada</span>
          <span className="corpus-credit">Corpus biblique : dépôt baiboly-json de RaveloMevaSoavina · édition et droits de reproduction à confirmer avant diffusion.</span>
          <span className="footer-made"><span aria-hidden="true">✦</span> Foi · Ordre · Communauté</span>
        </div>
      </footer>
    </div>
  );
}
