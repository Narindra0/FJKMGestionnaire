import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { BookOpen, Check, Copy, RefreshCw } from "lucide-react";
import corpus from "../data/versets.json";
import {
  formatAntananarivoDate,
  getVerseOfTheDay,
  isoAntananarivoDate,
  millisecondsUntilNextAntananarivoMidnight,
  type VerseCorpus,
} from "../lib/verseOfDay";

const corpusData = corpus as VerseCorpus;
const verses = Array.isArray(corpusData.verses) ? corpusData.verses : [];

function validCorpus(): boolean {
  return verses.length > 0 && verses.every((verse) => (
    Number.isInteger(verse.id) &&
    typeof verse.text === "string" && verse.text.trim().length > 0 &&
    typeof verse.ref === "string" && verse.ref.trim().length > 0
  ));
}

export default function VersetDuJour() {
  const [now, setNow] = useState(() => new Date());
  const [previewTomorrow, setPreviewTomorrow] = useState(false);
  const [copied, setCopied] = useState(false);

  const refreshIfNewDay = useCallback(() => {
    const latest = new Date();
    setNow((previous) => {
      const previousVerse = getVerseOfTheDay(verses, previous);
      const currentVerse = getVerseOfTheDay(verses, latest);
      return previousVerse?.dayNumber === currentVerse?.dayNumber ? previous : latest;
    });
  }, []);

  useEffect(() => {
    if (!validCorpus()) {
      console.warn("Corpus Baiboly absent ou invalide : le Message du jour est masqué.");
      return;
    }
    let timer = 0;
    const scheduleNextMidnight = () => {
      timer = window.setTimeout(() => {
        refreshIfNewDay();
        scheduleNextMidnight();
      }, millisecondsUntilNextAntananarivoMidnight() + 40);
    };
    scheduleNextMidnight();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") refreshIfNewDay();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refreshIfNewDay]);

  const verseDate = previewTomorrow
    ? new Date(now.getTime() + millisecondsUntilNextAntananarivoMidnight(now) + 1_000)
    : now;
  const dailyVerse = getVerseOfTheDay(verses, verseDate);

  const copyVerse = async () => {
    if (!dailyVerse) return;
    const text = `${dailyVerse.text} — ${dailyVerse.ref} (Baiboly Malagasy)`;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Presse-papier indisponible");
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Verset copié", { description: "Le texte et sa référence sont dans le presse-papiers." });
      window.setTimeout(() => setCopied(false), 1_800);
    } catch {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      const copiedSuccessfully = document.execCommand("copy");
      field.remove();
      if (copiedSuccessfully) {
        toast.success("Verset copié");
      } else {
        toast.info("Copie indisponible", { description: "Sélectionnez le texte du verset pour le copier." });
      }
    }
  };

  if (!validCorpus() || !dailyVerse) return null;

  return (
    <section className="verse-section" id="verset" aria-labelledby="verse-title">
      <div className="site-container">
        <div className="verse-card reveal">
          <span className="verse-ornament verse-ornament-one" aria-hidden="true" />
          <span className="verse-ornament verse-ornament-two" aria-hidden="true" />
          <div className="verse-topline">
            <div className="verse-label">
              <span className="verse-icon"><BookOpen aria-hidden="true" size={19} /></span>
              <div>
                <span className="eyebrow eyebrow-light">Une pause au cœur du quotidien</span>
                <h2 id="verse-title">Message du jour</h2>
              </div>
            </div>
            <time className="verse-date mono" dateTime={isoAntananarivoDate(verseDate)}>
              {formatAntananarivoDate(verseDate)}
            </time>
          </div>

          <blockquote className="verse-quote" aria-live="polite" key={dailyVerse.id}>
            <p>« {dailyVerse.text} »</p>
            <cite>— {dailyVerse.ref}</cite>
          </blockquote>

          <div className="verse-bottomline">
            <div className="verse-meta">
              <span>Baiboly Malagasy</span>
              <span aria-hidden="true">·</span>
              <span>Jour {dailyVerse.dayOfYear} / 366</span>
            </div>
            <div className="verse-actions">
              {import.meta.env.DEV && (
                <button className="verse-action" type="button" onClick={() => setPreviewTomorrow((value) => !value)}>
                  <RefreshCw size={15} aria-hidden="true" />
                  {previewTomorrow ? "Verset d’aujourd’hui" : "Aperçu du lendemain"}
                </button>
              )}
              <button
                className="verse-action verse-copy"
                type="button"
                onClick={copyVerse}
                aria-label="Copier le verset du jour"
              >
                {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                <span>{copied ? "Copié" : "Copier le verset"}</span>
              </button>
            </div>
          </div>
          <p className="verse-encouragement">Une parole pour accompagner les engagements de la journée.</p>
        </div>
      </div>
    </section>
  );
}
