-- Populate basic translations for navigation
-- This script creates languages and basic navigation translations

-- Insert languages
INSERT IGNORE INTO languages (code, name, native_name, is_default, is_active, created_at, updated_at) VALUES
('en', 'English', 'English', 1, 1, NOW(), NOW()),
('es', 'Spanish', 'Español', 0, 1, NOW(), NOW()),
('fr', 'French', 'Français', 0, 1, NOW(), NOW());

-- Insert English translations
INSERT IGNORE INTO language_values (key_hash, language_code, original_key, destination_value, created_at, updated_at) VALUES
(MD5('nav.dashboard'), 'en', 'nav.dashboard', 'Dashboard', NOW(), NOW()),
(MD5('nav.users'), 'en', 'nav.users', 'Users', NOW(), NOW()),
(MD5('nav.roles'), 'en', 'nav.roles', 'Roles', NOW(), NOW()),
(MD5('nav.categories'), 'en', 'nav.categories', 'Categories', NOW(), NOW()),
(MD5('nav.products'), 'en', 'nav.products', 'Products', NOW(), NOW()),
(MD5('nav.attributes'), 'en', 'nav.attributes', 'Attributes', NOW(), NOW()),
(MD5('nav.attribute_values'), 'en', 'nav.attribute_values', 'Attribute Values', NOW(), NOW()),
(MD5('nav.attribute_sets'), 'en', 'nav.attribute_sets', 'Attribute Sets', NOW(), NOW()),
(MD5('nav.stores'), 'en', 'nav.stores', 'Stores', NOW(), NOW()),
(MD5('nav.orders'), 'en', 'nav.orders', 'Orders', NOW(), NOW()),
(MD5('nav.translations'), 'en', 'nav.translations', 'Translations', NOW(), NOW()),
(MD5('nav.admin_panel'), 'en', 'nav.admin_panel', 'Admin Panel', NOW(), NOW()),
(MD5('nav.admin_panel_version'), 'en', 'nav.admin_panel_version', 'Admin Panel v1.0', NOW(), NOW()),
(MD5('header.welcome'), 'en', 'header.welcome', 'Welcome', NOW(), NOW()),
(MD5('header.logout'), 'en', 'header.logout', 'Logout', NOW(), NOW()),
(MD5('header.profile'), 'en', 'header.profile', 'Profile', NOW(), NOW()),
(MD5('header.settings'), 'en', 'header.settings', 'Settings', NOW(), NOW());

-- Insert Spanish translations
INSERT IGNORE INTO language_values (key_hash, language_code, original_key, destination_value, created_at, updated_at) VALUES
(MD5('nav.dashboard'), 'es', 'nav.dashboard', 'Panel de Control', NOW(), NOW()),
(MD5('nav.users'), 'es', 'nav.users', 'Usuarios', NOW(), NOW()),
(MD5('nav.roles'), 'es', 'nav.roles', 'Roles', NOW(), NOW()),
(MD5('nav.categories'), 'es', 'nav.categories', 'Categorías', NOW(), NOW()),
(MD5('nav.products'), 'es', 'nav.products', 'Productos', NOW(), NOW()),
(MD5('nav.attributes'), 'es', 'nav.attributes', 'Atributos', NOW(), NOW()),
(MD5('nav.attribute_values'), 'es', 'nav.attribute_values', 'Valores de Atributos', NOW(), NOW()),
(MD5('nav.attribute_sets'), 'es', 'nav.attribute_sets', 'Conjuntos de Atributos', NOW(), NOW()),
(MD5('nav.stores'), 'es', 'nav.stores', 'Tiendas', NOW(), NOW()),
(MD5('nav.orders'), 'es', 'nav.orders', 'Pedidos', NOW(), NOW()),
(MD5('nav.translations'), 'es', 'nav.translations', 'Traducciones', NOW(), NOW()),
(MD5('nav.admin_panel'), 'es', 'nav.admin_panel', 'Panel de Administración', NOW(), NOW()),
(MD5('nav.admin_panel_version'), 'es', 'nav.admin_panel_version', 'Panel de Administración v1.0', NOW(), NOW()),
(MD5('header.welcome'), 'es', 'header.welcome', 'Bienvenido', NOW(), NOW()),
(MD5('header.logout'), 'es', 'header.logout', 'Cerrar Sesión', NOW(), NOW()),
(MD5('header.profile'), 'es', 'header.profile', 'Perfil', NOW(), NOW()),
(MD5('header.settings'), 'es', 'header.settings', 'Configuración', NOW(), NOW());

-- Insert French translations
INSERT IGNORE INTO language_values (key_hash, language_code, original_key, destination_value, created_at, updated_at) VALUES
(MD5('nav.dashboard'), 'fr', 'nav.dashboard', 'Tableau de Bord', NOW(), NOW()),
(MD5('nav.users'), 'fr', 'nav.users', 'Utilisateurs', NOW(), NOW()),
(MD5('nav.roles'), 'fr', 'nav.roles', 'Rôles', NOW(), NOW()),
(MD5('nav.categories'), 'fr', 'nav.categories', 'Catégories', NOW(), NOW()),
(MD5('nav.products'), 'fr', 'nav.products', 'Produits', NOW(), NOW()),
(MD5('nav.attributes'), 'fr', 'nav.attributes', 'Attributs', NOW(), NOW()),
(MD5('nav.attribute_values'), 'fr', 'nav.attribute_values', 'Valeurs d\'Attributs', NOW(), NOW()),
(MD5('nav.attribute_sets'), 'fr', 'nav.attribute_sets', 'Ensembles d\'Attributs', NOW(), NOW()),
(MD5('nav.stores'), 'fr', 'nav.stores', 'Magasins', NOW(), NOW()),
(MD5('nav.orders'), 'fr', 'nav.orders', 'Commandes', NOW(), NOW()),
(MD5('nav.translations'), 'fr', 'nav.translations', 'Traductions', NOW(), NOW()),
(MD5('nav.admin_panel'), 'fr', 'nav.admin_panel', 'Panneau d\'Administration', NOW(), NOW()),
(MD5('nav.admin_panel_version'), 'fr', 'nav.admin_panel_version', 'Panneau d\'Administration v1.0', NOW(), NOW()),
(MD5('header.welcome'), 'fr', 'header.welcome', 'Bienvenue', NOW(), NOW()),
(MD5('header.logout'), 'fr', 'header.logout', 'Déconnexion', NOW(), NOW()),
(MD5('header.profile'), 'fr', 'header.profile', 'Profil', NOW(), NOW()),
(MD5('header.settings'), 'fr', 'header.settings', 'Paramètres', NOW(), NOW());
