import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = process.argv[2] || "/tmp/baiboly-json";
const outputPath = path.join(projectRoot, "client/src/data/versets.json");

// Références sélectionnées pour un usage pastoral quotidien. Le texte est toujours lu
// dans les JSON du dépôt : ce script ne contient et n'invente aucun texte biblique.
const sources = [
  ["salamo", "Salamo", "16:8", "foi"], ["salamo", "Salamo", "23:1", "provision"],
  ["salamo", "Salamo", "23:4", "paix"], ["salamo", "Salamo", "27:1", "foi"],
  ["salamo", "Salamo", "34:8", "foi"], ["salamo", "Salamo", "37:3", "esperance"],
  ["salamo", "Salamo", "37:5", "foi"], ["salamo", "Salamo", "46:1", "paix"],
  ["salamo", "Salamo", "46:10", "paix"], ["salamo", "Salamo", "55:22", "paix"],
  ["salamo", "Salamo", "62:8", "foi"], ["salamo", "Salamo", "73:26", "esperance"],
  ["salamo", "Salamo", "84:11", "foi"], ["salamo", "Salamo", "91:1", "foi"],
  ["salamo", "Salamo", "91:2", "foi"], ["salamo", "Salamo", "100:2", "service"],
  ["salamo", "Salamo", "103:2", "provision"], ["salamo", "Salamo", "103:8", "amour"],
  ["salamo", "Salamo", "118:24", "esperance"], ["salamo", "Salamo", "119:105", "sagesse"],
  ["salamo", "Salamo", "121:1", "esperance"], ["salamo", "Salamo", "121:2", "foi"],
  ["salamo", "Salamo", "121:7", "provision"], ["salamo", "Salamo", "126:5", "esperance"],
  ["salamo", "Salamo", "133:1", "amour"], ["salamo", "Salamo", "139:14", "foi"],
  ["salamo", "Salamo", "143:8", "foi"], ["salamo", "Salamo", "145:9", "amour"],
  ["salamo", "Salamo", "145:18", "foi"],
  ["ohabolana", "Ohabolana", "3:5", "sagesse"], ["ohabolana", "Ohabolana", "3:6", "sagesse"],
  ["ohabolana", "Ohabolana", "3:13", "sagesse"], ["ohabolana", "Ohabolana", "3:17", "sagesse"],
  ["ohabolana", "Ohabolana", "10:12", "amour"], ["ohabolana", "Ohabolana", "11:25", "provision"],
  ["ohabolana", "Ohabolana", "12:25", "paix"], ["ohabolana", "Ohabolana", "16:3", "foi"],
  ["ohabolana", "Ohabolana", "16:9", "sagesse"], ["ohabolana", "Ohabolana", "16:24", "amour"],
  ["ohabolana", "Ohabolana", "17:17", "amour"], ["ohabolana", "Ohabolana", "18:10", "foi"],
  ["ohabolana", "Ohabolana", "19:17", "service"], ["ohabolana", "Ohabolana", "22:9", "service"],
  ["ohabolana", "Ohabolana", "24:3", "sagesse"], ["ohabolana", "Ohabolana", "24:14", "sagesse"],
  ["ohabolana", "Ohabolana", "27:17", "sagesse"], ["ohabolana", "Ohabolana", "31:26", "sagesse"],
  ["isaia", "Isaia", "26:3", "paix"], ["isaia", "Isaia", "40:31", "esperance"],
  ["isaia", "Isaia", "41:10", "foi"], ["isaia", "Isaia", "43:2", "foi"],
  ["isaia", "Isaia", "54:10", "paix"], ["isaia", "Isaia", "55:12", "esperance"],
  ["isaia", "Isaia", "58:11", "provision"],
  ["jeremia", "Jeremia", "17:7", "foi"], ["jeremia", "Jeremia", "29:11", "esperance"],
  ["jeremia", "Jeremia", "31:3", "amour"],
  ["matio", "Matio", "5:9", "paix"], ["matio", "Matio", "5:14", "service"],
  ["matio", "Matio", "5:16", "service"], ["matio", "Matio", "6:25", "paix"],
  ["matio", "Matio", "6:26", "provision"], ["matio", "Matio", "6:33", "provision"],
  ["matio", "Matio", "7:7", "foi"], ["matio", "Matio", "7:12", "amour"],
  ["matio", "Matio", "11:28", "paix"], ["matio", "Matio", "18:20", "foi"],
  ["matio", "Matio", "22:37", "amour"], ["matio", "Matio", "22:39", "amour"],
  ["matio", "Matio", "28:20", "foi"],
  ["lioka", "Luka", "6:31", "amour"], ["lioka", "Luka", "6:36", "amour"],
  ["lioka", "Luka", "10:27", "amour"], ["lioka", "Luka", "12:32", "foi"],
  ["lioka", "Luka", "12:34", "sagesse"], ["lioka", "Luka", "6:38", "service"],
  ["jaona", "Jaona", "3:16", "foi"], ["jaona", "Jaona", "13:34", "amour"],
  ["jaona", "Jaona", "14:1", "paix"], ["jaona", "Jaona", "14:6", "foi"],
  ["jaona", "Jaona", "14:27", "paix"], ["jaona", "Jaona", "15:5", "foi"],
  ["jaona", "Jaona", "15:9", "amour"], ["jaona", "Jaona", "15:12", "amour"],
  ["jaona", "Jaona", "15:13", "amour"], ["jaona", "Jaona", "16:33", "paix"],
  ["romanina", "Romana", "8:28", "esperance"], ["romanina", "Romana", "8:31", "foi"],
  ["romanina", "Romana", "8:38", "foi"], ["romanina", "Romana", "12:10", "amour"],
  ["romanina", "Romana", "12:12", "esperance"], ["romanina", "Romana", "12:13", "service"],
  ["romanina", "Romana", "12:15", "amour"], ["romanina", "Romana", "12:18", "paix"],
  ["romanina", "Romana", "15:13", "esperance"],
  ["1-korintianina", "1 Korintiana", "13:4", "amour"], ["1-korintianina", "1 Korintiana", "13:7", "amour"],
  ["1-korintianina", "1 Korintiana", "16:14", "amour"], ["1-korintianina", "1 Korintiana", "14:40", "ordre"],
  ["2-korintianina", "2 Korintiana", "9:7", "service"], ["2-korintianina", "2 Korintiana", "9:8", "provision"],
  ["2-korintianina", "2 Korintiana", "12:9", "foi"],
  ["galatianina", "Galatiana", "5:13", "service"], ["galatianina", "Galatiana", "5:22", "amour"],
  ["galatianina", "Galatiana", "6:2", "service"], ["galatianina", "Galatiana", "6:9", "esperance"],
  ["galatianina", "Galatiana", "6:10", "service"],
  ["efesianina", "Efesianina", "2:10", "service"], ["efesianina", "Efesianina", "4:2", "amour"],
  ["efesianina", "Efesianina", "4:3", "ordre"], ["efesianina", "Efesianina", "4:32", "amour"],
  ["efesianina", "Efesianina", "5:2", "amour"], ["efesianina", "Efesianina", "6:7", "service"],
  ["efesianina", "Efesianina", "6:10", "foi"],
  ["filipianina", "Filipiana", "1:3", "amour"], ["filipianina", "Filipiana", "2:3", "ordre"],
  ["filipianina", "Filipiana", "2:4", "service"], ["filipianina", "Filipiana", "4:4", "esperance"],
  ["filipianina", "Filipiana", "4:6", "paix"], ["filipianina", "Filipiana", "4:7", "paix"],
  ["filipianina", "Filipiana", "4:13", "foi"],
  ["kolosianina", "Kolosiana", "3:12", "amour"], ["kolosianina", "Kolosiana", "3:13", "amour"],
  ["kolosianina", "Kolosiana", "3:14", "amour"], ["kolosianina", "Kolosiana", "3:23", "service"],
  ["1-tesalonianina", "1 Tesalonianina", "5:11", "service"], ["1-tesalonianina", "1 Tesalonianina", "5:16", "esperance"],
  ["1-tesalonianina", "1 Tesalonianina", "5:17", "foi"], ["1-tesalonianina", "1 Tesalonianina", "5:18", "foi"],
  ["1-tesalonianina", "1 Tesalonianina", "5:23", "paix"],
  ["2-tesalonianina", "2 Tesalonianina", "3:3", "foi"], ["2-tesalonianina", "2 Tesalonianina", "3:13", "service"],
  ["1-timoty", "1 Timoty", "4:12", "service"], ["1-timoty", "1 Timoty", "6:18", "service"],
  ["2-timoty", "2 Timoty", "1:7", "foi"],
  ["hebreo", "Hebreo", "10:24", "service"], ["hebreo", "Hebreo", "12:1", "esperance"],
  ["hebreo", "Hebreo", "13:5", "foi"], ["hebreo", "Hebreo", "13:8", "foi"],
  ["hebreo", "Hebreo", "13:16", "service"],
  ["1-petera", "1 Petera", "4:8", "amour"], ["1-petera", "1 Petera", "4:10", "service"],
  ["1-petera", "1 Petera", "5:7", "paix"], ["1-petera", "1 Petera", "5:10", "esperance"],
  ["1-jaona", "1 Jaona", "3:18", "amour"], ["1-jaona", "1 Jaona", "4:7", "amour"],
  ["1-jaona", "1 Jaona", "4:11", "amour"], ["1-jaona", "1 Jaona", "4:19", "amour"],
  ["1-jaona", "1 Jaona", "4:21", "amour"],
];

function findBookFile(stem) {
  for (const testament of ["Testameta taloha", "Testameta vaovao"]) {
    const file = path.join(sourceRoot, testament, `${stem}.json`);
    if (fs.existsSync(file)) return file;
  }
  return null;
}

const verses = [];
const missing = [];
for (const [stem, book, reference, theme] of sources) {
  const [chapterText, verseText] = reference.split(":");
  const file = findBookFile(stem);
  if (!file) {
    missing.push(`${book} ${reference}: fichier manquant`);
    continue;
  }
  const chapters = JSON.parse(fs.readFileSync(file, "utf8"));
  const text = chapters[chapterText]?.[verseText]?.trim();
  if (!text) {
    missing.push(`${book} ${reference}: verset manquant`);
    continue;
  }
  const wordCount = text.split(/\s+/u).length;
  if (wordCount < 10 || wordCount > 45) continue;
  verses.push({
    id: verses.length + 1,
    ref: `${book} ${reference}`,
    book,
    chapter: Number(chapterText),
    verse: Number(verseText),
    text,
    theme,
  });
}

if (verses.length < 90) {
  throw new Error(`Corpus produit trop petit (${verses.length}); minimum demandé : 90 passages.`);
}
if (new Set(verses.map(({ ref }) => ref)).size !== verses.length) {
  throw new Error("Références dupliquées dans le sous-corpus.");
}

const output = {
  version: "1.0",
  translation: "Baiboly Malagasy (édition non précisée dans le dépôt)",
  source: "https://github.com/RaveloMevaSoavina/baiboly-json.git",
  sourceCommit: "4e64660b8eeb31cd9a967be8e1292a87b8c9ea77",
  license: "Aucune licence de reproduction n'est indiquée dans le dépôt au moment de l'extraction ; droits à confirmer avant toute publication.",
  verses,
};
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Corpus généré : ${verses.length} passages exacts depuis le dépôt source.`);
if (missing.length) console.warn(`Références indisponibles (${missing.length}) : ${missing.join("; ")}`);
