import { useEffect, useRef, useState } from "react";
import { Check, Globe } from "lucide-react";
import { dictFr, dictMg } from "../i18n-dicts";
import { setLang, useLang, type Lang } from "../i18n";

/*
 | Sélecteur de langue discret (Globe + code FR/MG) avec menu déroulant.
 | Utilisé dans l'en-tête de la landing et dans celui de la vue publique ;
 | la langue choisie est persistée par le store i18n (localStorage).
 */
const OPTIONS: { code: Lang; label: string }[] = [
  { code: "fr", label: dictFr.name },
  { code: "mg", label: dictMg.name },
];

type SwitcherProps = {
  /** Variante sombre pour en-têtes clairs (défaut) ; claire pour fonds navy. */
  tone?: "dark" | "light";
};

export default function LanguageSwitcher({ tone = "dark" }: SwitcherProps) {
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`lang-switch${tone === "light" ? " lang-switch-light" : ""}`}>
      <button
        className="lang-trigger"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Changer de langue / Hanova teny"
        onClick={() => setOpen((value) => !value)}
      >
        <Globe size={15} aria-hidden="true" />
        <span className="lang-code">{lang.toUpperCase()}</span>
      </button>
      {open && (
        <div className="lang-menu" role="menu" aria-label="Langues">
          {OPTIONS.map((option) => {
            const active = option.code === lang;
            return (
              <button
                key={option.code}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                className={`lang-option${active ? " is-active" : ""}`}
                onClick={() => {
                  setLang(option.code);
                  setOpen(false);
                }}
              >
                <span className="lang-option-code">{option.code.toUpperCase()}</span>
                <span className="lang-option-label">{option.label}</span>
                {active && <Check size={14} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
