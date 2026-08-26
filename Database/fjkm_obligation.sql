-- Commentaire technique
-- Ce fichier contient le script SQL de création et d'initialisation de la base de données du projet.
-- Base de données du projet FJKM Malaza Gileada
-- Les commentaires expliquent les tables, les clés et les contraintes principales.
CREATE DATABASE IF NOT EXISTS `fjkm_obligation` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `fjkm_obligation`;

SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS audit_logs, login_attempts, project_payments, obligation_payments, communion_exits, communion_payments, obligations, projects, finance_exits, finance_entries, fideles, periods, settings, users, roles;
SET FOREIGN_KEY_CHECKS=1;

-- Rôles applicatifs : ADMIN fait tout, USER enregistre/modifie sans supprimer, VISITEUR consulte.
CREATE TABLE roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(30) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Utilisateurs avec statut activable/désactivable.
CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id INT UNSIGNED NOT NULL,
  name VARCHAR(120) NOT NULL,
  matricule VARCHAR(60) NULL UNIQUE,
  email VARCHAR(160) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  remember_token VARCHAR(255) NULL,
  last_login_at DATETIME NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE CASCADE,
  INDEX idx_users_role(role_id),
  INDEX idx_users_status(status),
  INDEX idx_users_matricule(matricule)
) ENGINE=InnoDB;

CREATE TABLE settings (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  `value` TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE periods (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('open','closed') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_period_dates(start_date,end_date)
) ENGINE=InnoDB;

CREATE TABLE fideles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  matricule VARCHAR(40) NOT NULL UNIQUE,
  full_name VARCHAR(180) NOT NULL,
  gender ENUM('M','F') NULL,
  birth_date DATE NULL,
  phone VARCHAR(40) NULL,
  group_name VARCHAR(120) NULL,
  address VARCHAR(255) NULL,
  baptized_at DATE NULL,
  communion_at DATE NULL,
  photo VARCHAR(255) NULL,
  status ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_by INT UNSIGNED NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  CONSTRAINT fk_fideles_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_fideles_name(full_name),
  INDEX idx_fideles_group(group_name),
  INDEX idx_fideles_status(status)
) ENGINE=InnoDB;

-- Entrées générales avec référence unique automatique.
CREATE TABLE finance_entries (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(180) NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK(amount >= 0),
  payment_method VARCHAR(60) NOT NULL,
  reference VARCHAR(120) NOT NULL UNIQUE,
  operation_date DATE NOT NULL,
  description TEXT NULL,
  created_by INT UNSIGNED NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  CONSTRAINT fk_entries_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_entries_date(operation_date),
  INDEX idx_entries_category(category)
) ENGINE=InnoDB;

-- Sorties générales avec référence unique automatique.
CREATE TABLE finance_exits (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(180) NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK(amount >= 0),
  beneficiary VARCHAR(180) NULL,
  reference VARCHAR(120) NOT NULL UNIQUE,
  operation_date DATE NOT NULL,
  description TEXT NULL,
  created_by INT UNSIGNED NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  CONSTRAINT fk_exits_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_exits_date(operation_date),
  INDEX idx_exits_category(category)
) ENGINE=InnoDB;

CREATE TABLE obligations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  fidel_id INT UNSIGNED NOT NULL,
  period_id INT UNSIGNED NULL,
  period_month TINYINT UNSIGNED NOT NULL DEFAULT 1,
  period_year INT NOT NULL DEFAULT 2026,
  label VARCHAR(180) NOT NULL,
  amount_due DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK(amount_due >= 0),
  amount_paid DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK(amount_paid >= 0),
  status ENUM('unpaid','partial','paid') NOT NULL DEFAULT 'unpaid',
  due_date DATE NULL,
  created_by INT UNSIGNED NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  CONSTRAINT fk_obligations_fidel FOREIGN KEY (fidel_id) REFERENCES fideles(id) ON DELETE CASCADE,
  CONSTRAINT fk_obligations_period FOREIGN KEY (period_id) REFERENCES periods(id) ON DELETE SET NULL,
  CONSTRAINT fk_obligations_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_obligations_status(status),
  INDEX idx_obligations_fidel(fidel_id),
  INDEX idx_obligations_period(period_id),
  INDEX idx_obligations_period_month_year(period_year, period_month),
  UNIQUE KEY uniq_obligation_fidel_period(fidel_id, period_year, period_month)
) ENGINE=InnoDB;

-- Historique des paiements partiels d'une obligation.
-- Exemple : montant dû 10 000 Ar, premier paiement 5 000 Ar, puis second paiement 5 000 Ar.
CREATE TABLE obligation_payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  obligation_id BIGINT UNSIGNED NOT NULL,
  fidel_id INT UNSIGNED NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK(amount >= 0),
  payment_date DATE NOT NULL,
  note VARCHAR(255) NULL,
  created_by INT UNSIGNED NULL,
  created_at DATETIME NULL,
  CONSTRAINT fk_obligation_payments_obligation FOREIGN KEY (obligation_id) REFERENCES obligations(id) ON DELETE CASCADE,
  CONSTRAINT fk_obligation_payments_fidel FOREIGN KEY (fidel_id) REFERENCES fideles(id) ON DELETE CASCADE,
  CONSTRAINT fk_obligation_payments_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_obligation_payments_obligation(obligation_id),
  INDEX idx_obligation_payments_fidel(fidel_id),
  INDEX idx_obligation_payments_date(payment_date)
) ENGINE=InnoDB;

-- Entrées communion : séparées des entrées générales.
CREATE TABLE communion_payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  fidel_id INT UNSIGNED NOT NULL,
  period_type ENUM('monthly','annual') NOT NULL DEFAULT 'monthly',
  paid_year INT NOT NULL,
  paid_month TINYINT UNSIGNED NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK(amount >= 0),
  payment_date DATE NOT NULL,
  payment_method VARCHAR(60) NOT NULL,
  reference VARCHAR(120) NOT NULL UNIQUE,
  created_by INT UNSIGNED NULL,
  created_at DATETIME NULL,
  CONSTRAINT fk_communion_fidel FOREIGN KEY (fidel_id) REFERENCES fideles(id) ON DELETE CASCADE,
  CONSTRAINT fk_communion_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uniq_communion_fidel_period(fidel_id, paid_year, paid_month),
  INDEX idx_communion_date(payment_date),
  INDEX idx_communion_paid_period(paid_year, paid_month),
  INDEX idx_communion_fidel(fidel_id),
  INDEX idx_communion_period(period_type)
) ENGINE=InnoDB;

-- Sorties communion : dépenses spécifiques à la communion.
CREATE TABLE communion_exits (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  label VARCHAR(180) NOT NULL,
  period_type ENUM('monthly','annual') NOT NULL DEFAULT 'monthly',
  category VARCHAR(100) NOT NULL DEFAULT 'Communion',
  amount DECIMAL(15,2) NOT NULL CHECK(amount >= 0),
  beneficiary VARCHAR(180) NULL,
  reference VARCHAR(120) NOT NULL UNIQUE,
  operation_date DATE NOT NULL,
  description TEXT NULL,
  created_by INT UNSIGNED NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  CONSTRAINT fk_communion_exits_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_communion_exit_date(operation_date),
  INDEX idx_communion_exit_period(period_type)
) ENGINE=InnoDB;

-- Projets suivis par l'église.
CREATE TABLE projects (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  reference VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  description TEXT NULL,
  budget DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK(budget >= 0),
  collected_amount DECIMAL(15,2) NOT NULL DEFAULT 0 CHECK(collected_amount >= 0),
  start_date DATE NULL,
  end_date DATE NULL,
  status ENUM('planned','ongoing','almost_completed','completed','cancelled') NOT NULL DEFAULT 'planned',
  created_by INT UNSIGNED NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  CONSTRAINT fk_projects_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_projects_status(status)
) ENGINE=InnoDB;

-- Paiements progressifs enregistrés sur les projets. Le total reçu du projet est recalculé dans la table projects.
CREATE TABLE project_payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK(amount >= 0),
  payment_date DATE NOT NULL,
  description TEXT NULL,
  created_by INT UNSIGNED NULL,
  created_at DATETIME NULL,
  CONSTRAINT fk_project_payments_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT,
  CONSTRAINT fk_project_payments_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_project_payments_project(project_id),
  INDEX idx_project_payments_date(payment_date)
) ENGINE=InnoDB;

CREATE TABLE login_attempts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(160) NOT NULL,
  ip_address VARCHAR(60) NOT NULL,
  success TINYINT(1) NOT NULL DEFAULT 0,
  attempted_at DATETIME NOT NULL,
  INDEX idx_login_guard(email, ip_address, attempted_at)
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  action VARCHAR(80) NOT NULL,
  entity VARCHAR(80) NOT NULL,
  entity_id BIGINT UNSIGNED NULL,
  ip_address VARCHAR(60) NULL,
  user_agent VARCHAR(250) NULL,
  payload JSON NULL,
  created_at DATETIME NOT NULL,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_action(action),
  INDEX idx_audit_entity(entity, entity_id),
  INDEX idx_audit_date(created_at)
) ENGINE=InnoDB;

INSERT INTO roles(name, description) VALUES
('ADMIN','Accès complet : enregistrement, modification, suppression, import/export et gestion des logins.'),
('USER','Gestionnaire : saisie et modification contrôlée, sans suppression.'),
('VISITEUR','Consultation limitée : dashboard, Chrétien et rapports.');

-- Mots de passe de démonstration : Admin@12345, User@12345, Visiteur@12345
INSERT INTO users(role_id, name, matricule, email, password, status, created_at) VALUES
(1, 'Administrateur FJKM', 'ADMIN', 'admin@fjkm.mg', '$2y$12$O0RkHtC3kBHnIO2LzhbnhumUJ4XQB0aYbHV8LN7gzD5YO9P2RUbDW', 'active', NOW()),
(2, 'Gestionnaire FJKM', 'USER', 'user@fjkm.mg', '$2y$12$jD1z2icbCTChPnYLqhnnaOZU8hIVth6yeBo.qG8KwbzqQ6Ndv99Ti', 'active', NOW()),
(3, 'Visiteur FJKM', 'VISITEUR', 'visiteur@fjkm.mg', '$2y$12$ccg3/wPbJCrOJbTHHYfoNugETTXuZIBq3Uzlvzjkh8SNKVjbl0.pa', 'active', NOW());

INSERT INTO settings(`key`, `value`) VALUES
('church_name', 'FJKM MALAZA GILEADA'),
('theme_primary', '#0d47a1'),
('currency', 'MGA'),
('forgot_password_policy', 'Réinitialisation uniquement par ADMIN'),
('obligation_default_amount', '0');

INSERT INTO periods(name, start_date, end_date, status) VALUES
('Janvier 2026','2026-01-01','2026-01-31','open'),
('Février 2026','2026-02-01','2026-02-28','open'),
('Mars 2026','2026-03-01','2026-03-31','open');

INSERT INTO fideles(matricule, full_name, gender, phone, group_name, address, baptized_at, communion_at, status, created_by, created_at) VALUES
('FJKM-2026-00001','Rakoto Jean','M','034.00.000.01','Groupe A','Antananarivo','2015-06-12','2017-04-20','active',1,NOW()),
('FJKM-2026-00002','Rasoa Marie','F','034.00.000.02','Groupe B','Antananarivo','2014-05-18','2018-03-22','active',1,NOW());

-- Base financière volontairement vide : l'utilisateur commence à zéro et saisit les nouvelles opérations manuellement.
