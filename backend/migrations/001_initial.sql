-- Migration initiale : tables pour le projet Stanny's
-- Compatible PostgreSQL 18

-- Utilisateurs (un enregistrement par rôle)
CREATE TABLE IF NOT EXISTS users (
  role TEXT PRIMARY KEY CHECK (role IN ('admin', 'editeur', 'lecteur', 'atelier')),
  password_hash TEXT NOT NULL
);

-- Dossiers client (historique)
-- Supprime une éventuelle ancienne table (ex. créée à la main) pour repartir avec la bonne structure
DROP TABLE IF EXISTS dossiers CASCADE;
CREATE TABLE dossiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  contact TEXT,
  contact1 TEXT,
  contact2 TEXT,
  contact1_prefix TEXT DEFAULT '+242',
  contact2_prefix TEXT DEFAULT '+242',
  mail TEXT,
  date_depot TIMESTAMPTZ,
  date_livraison TEXT,
  adresse TEXT,
  photo_faciale TEXT,
  photo_corps TEXT,
  vetement_base_id TEXT,
  vetement_comparaison_ids TEXT[],
  image_base_or JSONB,
  images_comparaison_bleu JSONB,
  mesures JSONB,
  images_chaussures JSONB,
  images_accessoires JSONB,
  annotations JSONB,
  status TEXT NOT NULL DEFAULT 'brouillon' CHECK (status IN ('brouillon', 'definitif')),
  atelier_statut TEXT CHECK (atelier_statut IN ('en_cours', 'termine'))
);

CREATE INDEX IF NOT EXISTS idx_dossiers_created_at ON dossiers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dossiers_status ON dossiers(status);
CREATE INDEX IF NOT EXISTS idx_dossiers_atelier_statut ON dossiers(atelier_statut);

-- Blocs catalogue (vestes, chaussures, accessoires)
CREATE TABLE IF NOT EXISTS catalogue_blocs (
  id TEXT PRIMARY KEY,
  section TEXT NOT NULL CHECK (section IN ('vestes', 'chaussures', 'accessoires')),
  titre TEXT NOT NULL DEFAULT '',
  sous_titre TEXT NOT NULL DEFAULT '',
  images_slider JSONB NOT NULL DEFAULT '[]',
  image_gauche_url TEXT NOT NULL DEFAULT '',
  texte_long TEXT NOT NULL DEFAULT '',
  texte_court TEXT NOT NULL DEFAULT '',
  slug TEXT NOT NULL DEFAULT '',
  ordre INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_catalogue_blocs_section ON catalogue_blocs(section);
CREATE UNIQUE INDEX IF NOT EXISTS idx_catalogue_blocs_section_slug ON catalogue_blocs(section, slug) WHERE slug <> '';

-- Config sous-titre par section du catalogue
CREATE TABLE IF NOT EXISTS catalogue_section_config (
  section TEXT PRIMARY KEY CHECK (section IN ('vestes', 'chaussures', 'accessoires')),
  subtitle TEXT
);

-- Données initiales : rôles utilisateur (mots de passe à changer via l'app ; hasher en prod)
INSERT INTO users (role, password_hash) VALUES
  ('admin', 'admin'),
  ('editeur', 'admin'),
  ('lecteur', 'admin'),
  ('atelier', 'admin')
ON CONFLICT (role) DO NOTHING;

-- Config sections (vide au départ)
INSERT INTO catalogue_section_config (section, subtitle) VALUES
  ('vestes', NULL),
  ('chaussures', NULL),
  ('accessoires', NULL)
ON CONFLICT (section) DO NOTHING;
