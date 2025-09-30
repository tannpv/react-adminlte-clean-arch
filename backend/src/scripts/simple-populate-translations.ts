import * as crypto from 'crypto';
import { MysqlDatabaseService } from '../infrastructure/persistence/mysql/mysql-database.service';

async function populateBasicTranslations() {
  const databaseService = new MysqlDatabaseService();
  
  try {
    console.log('🌍 Starting basic translation population...');

    // Create languages
    const languages = [
      { code: 'en', name: 'English', nativeName: 'English', isDefault: true, isActive: true },
      { code: 'es', name: 'Spanish', nativeName: 'Español', isDefault: false, isActive: true },
      { code: 'fr', name: 'French', nativeName: 'Français', isDefault: false, isActive: true },
    ];

    for (const langData of languages) {
      // Check if language exists
      const [existing] = await databaseService.execute(
        'SELECT id FROM languages WHERE code = ?',
        [langData.code]
      );

      if (!existing || existing.length === 0) {
        await databaseService.execute(
          'INSERT INTO languages (code, name, native_name, is_default, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
          [langData.code, langData.name, langData.nativeName, langData.isDefault ? 1 : 0, langData.isActive ? 1 : 0]
        );
        console.log(`✅ Created language: ${langData.name} (${langData.code})`);
      } else {
        console.log(`ℹ️  Language already exists: ${langData.name} (${langData.code})`);
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
        const keyHash = crypto.createHash('md5').update(key).digest('hex');
        
        // Check if translation already exists
        const [existing] = await databaseService.execute(
          'SELECT id FROM language_values WHERE language_code = ? AND key_hash = ?',
          [langCode, keyHash]
        );

        if (!existing || existing.length === 0) {
          await databaseService.execute(
            'INSERT INTO language_values (key_hash, language_code, original_key, destination_value, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [keyHash, langCode, key, value]
          );
          console.log(`  ✅ ${key} = ${value}`);
        } else {
          console.log(`  ℹ️  ${key} already exists`);
        }
      }
    }

    console.log('🎉 Translation population completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during translation population:', error);
  } finally {
    await databaseService.close();
  }
}

populateBasicTranslations().catch(console.error);
