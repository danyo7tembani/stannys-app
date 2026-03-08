/**
 * Script de migration des données vers le backend.
 * Copie data/mur-de-style-blocs.json vers backend/data/
 * et public/uploads/mur-de-style/ vers backend/uploads/mur-de-style/
 *
 * Exécution : depuis la racine du repo : node scripts/migrate-to-backend.cjs
 * Ne supprime pas les fichiers originaux (vérification manuelle recommandée après coup).
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DATA_SOURCE = path.join(ROOT, "data", "mur-de-style-blocs.json");
const DATA_DEST_DIR = path.join(ROOT, "backend", "data");
const DATA_DEST = path.join(DATA_DEST_DIR, "mur-de-style-blocs.json");
const UPLOAD_SOURCE = path.join(ROOT, "public", "uploads", "mur-de-style");
const UPLOAD_DEST = path.join(ROOT, "backend", "uploads", "mur-de-style");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log("Créé :", dir);
  }
}

function copyFile(src, dest) {
  if (!fs.existsSync(src)) {
    console.log("Ignoré (source absente) :", src);
    return;
  }
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  console.log("Copié :", src, "->", dest);
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.log("Ignoré (dossier source absent) :", src);
    return;
  }
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log("Copié :", srcPath, "->", destPath);
    }
  }
}

console.log("Migration des données vers backend/...\n");

copyFile(DATA_SOURCE, DATA_DEST);
copyDirRecursive(UPLOAD_SOURCE, UPLOAD_DEST);

console.log("\nTerminé. Les originaux n'ont pas été supprimés.");
