import { useSyncExternalStore } from "react";
import { dictFr, dictMg, type Dict } from "./i18n-dicts";

/*
 |--------------------------------------------------------------------------
 | i18n minimal FR / Malagasy (site public : landing + consultation)
 |--------------------------------------------------------------------------
 | Choix produit : pas de dépendance externe. La langue est stockée dans
 | localStorage (clé « fjkm-lang ») et appliquée à <html lang> : elle survit
 | donc aux changements de page (navigation par rechargement complet) et aux
 | rechargements. Sans enregistrement, la langue du navigateur est utilisée
 | (le malgache est sélectionné si le poste est réglé sur mg-*), sinon français.
 */

export type Lang = "fr" | "mg";

const STORAGE_KEY = "fjkm-lang";

function detectInitial(): Lang {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "fr" || saved === "mg") return saved;
  } catch {
    // stockage indisponible (navigation privée) : détection simple
  }
  const browser = (navigator.languages?.[0] ?? navigator.language ?? "fr").toLowerCase();
  return browser.startsWith("mg") ? "mg" : "fr";
}

let current: Lang = detectInitial();
const listeners = new Set<() => void>();

function applyHtmlLang(lang: Lang) {
  document.documentElement.lang = lang;
}
applyHtmlLang(current);

function emit() {
  for (const listener of listeners) listener();
}

export function getLang(): Lang {
  return current;
}

export function setLang(lang: Lang) {
  if (lang === current) return;
  current = lang;
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // stockage indisponible (navigation privée) : la session courante garde la langue choisie
  }
  applyHtmlLang(lang);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useLang(): { lang: Lang; setLang: (lang: Lang) => void; t: Dict } {
  const lang = useSyncExternalStore(subscribe, getLang, getLang);
  return { lang, setLang, t: lang === "mg" ? dictMg : dictFr };
}

/*
 | Rendu de textes riches du dictionnaire : *emphase* -> <em>, \n -> <br />.
 | Permet de conserver les titres à deux registres de la landing sans multiplier
 | les clés dans chaque langue.
 */
export function rich(text: string): (string | JSX.Element)[] {
  return text.split("\n").flatMap((line, lineIndex) => {
    const nodes = line.split(/(\*[^*]+\*)/g).map((part, partIndex) => {
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        return <em key={`${lineIndex}-${partIndex}`}>{part.slice(1, -1)}</em>;
      }
      return part;
    });
    if (lineIndex === 0) return nodes;
    return [<br key={`br-${lineIndex}`} />, ...nodes];
  });
}
