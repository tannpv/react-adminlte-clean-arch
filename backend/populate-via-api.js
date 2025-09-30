const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function populateTranslations() {
  try {
    console.log('🌍 Starting translation population via API...');

    // Create languages
    const languages = [
      { code: 'en', name: 'English', nativeName: 'English', isDefault: true, isActive: true },
      { code: 'es', name: 'Spanish', nativeName: 'Español', isDefault: false, isActive: true },
      { code: 'fr', name: 'French', nativeName: 'Français', isDefault: false, isActive: true },
    ];

    for (const lang of languages) {
      try {
        await axios.post(`${API_BASE}/translations/languages`, lang);
        console.log(`✅ Created language: ${lang.name} (${lang.code})`);
      } catch (error) {
        if (error.response?.status === 409) {
          console.log(`ℹ️  Language already exists: ${lang.name} (${lang.code})`);
        } else {
          console.error(`❌ Error creating language ${lang.code}:`, error.response?.data || error.message);
        }
      }
    }

    // Basic navigation translations
    const translations = {
      'en': {
        'nav.dashboard': 'Dashboard',
        'nav.users': 'Users',
        'nav.roles': 'Roles',
        'nav.categories': 'Categories',
        'nav.products': 'Products',
        'nav.attributes': 'Attributes',
        'nav.attribute_values': 'Attribute Values',
        'nav.attribute_sets': 'Attribute Sets',
        'nav.stores': 'Stores',
        'nav.orders': 'Orders',
        'nav.translations': 'Translations',
        'nav.admin_panel': 'Admin Panel',
        'nav.admin_panel_version': 'Admin Panel v1.0',
        'header.welcome': 'Welcome',
        'header.logout': 'Logout',
        'header.profile': 'Profile',
        'header.settings': 'Settings'
      },
      'es': {
        'nav.dashboard': 'Panel de Control',
        'nav.users': 'Usuarios',
        'nav.roles': 'Roles',
        'nav.categories': 'Categorías',
        'nav.products': 'Productos',
        'nav.attributes': 'Atributos',
        'nav.attribute_values': 'Valores de Atributos',
        'nav.attribute_sets': 'Conjuntos de Atributos',
        'nav.stores': 'Tiendas',
        'nav.orders': 'Pedidos',
        'nav.translations': 'Traducciones',
        'nav.admin_panel': 'Panel de Administración',
        'nav.admin_panel_version': 'Panel de Administración v1.0',
        'header.welcome': 'Bienvenido',
        'header.logout': 'Cerrar Sesión',
        'header.profile': 'Perfil',
        'header.settings': 'Configuración'
      },
      'fr': {
        'nav.dashboard': 'Tableau de Bord',
        'nav.users': 'Utilisateurs',
        'nav.roles': 'Rôles',
        'nav.categories': 'Catégories',
        'nav.products': 'Produits',
        'nav.attributes': 'Attributs',
        'nav.attribute_values': 'Valeurs d\'Attributs',
        'nav.attribute_sets': 'Ensembles d\'Attributs',
        'nav.stores': 'Magasins',
        'nav.orders': 'Commandes',
        'nav.translations': 'Traductions',
        'nav.admin_panel': 'Panneau d\'Administration',
        'nav.admin_panel_version': 'Panneau d\'Administration v1.0',
        'header.welcome': 'Bienvenue',
        'header.logout': 'Déconnexion',
        'header.profile': 'Profil',
        'header.settings': 'Paramètres'
      }
    };

    // Insert translations
    for (const [langCode, langTranslations] of Object.entries(translations)) {
      console.log(`📝 Populating translations for ${langCode}...`);
      
      for (const [key, value] of Object.entries(langTranslations)) {
        try {
          await axios.post(`${API_BASE}/translations/translations`, {
            languageCode: langCode,
            key: key,
            value: value
          });
          console.log(`  ✅ ${key} = ${value}`);
        } catch (error) {
          if (error.response?.status === 409) {
            console.log(`  ℹ️  ${key} already exists`);
          } else {
            console.error(`  ❌ Error creating translation ${key}:`, error.response?.data || error.message);
          }
        }
      }
    }

    console.log('🎉 Translation population completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during translation population:', error.message);
  }
}

populateTranslations();
