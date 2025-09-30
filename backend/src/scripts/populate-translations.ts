import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LanguageRepository } from '../features/translations/repositories/language.repository';
import { LanguageValueRepository } from '../features/translations/repositories/language-value.repository';
import { Language } from '../features/translations/entities/language.entity';
import { LanguageValue } from '../features/translations/entities/language-value.entity';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

async function populateTranslations() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const languageRepository = app.get(LanguageRepository);
  const languageValueRepository = app.get(LanguageValueRepository);

  try {
    console.log('🌍 Starting translation population...');

    // Create languages
    const languages = [
      { code: 'en', name: 'English', nativeName: 'English', isDefault: true, isActive: true },
      { code: 'es', name: 'Spanish', nativeName: 'Español', isDefault: false, isActive: true },
      { code: 'fr', name: 'French', nativeName: 'Français', isDefault: false, isActive: true },
    ];

    for (const langData of languages) {
      let language = await languageRepository.findByCode(langData.code);
      if (!language) {
        language = languageRepository.create(langData);
        await languageRepository.save(language);
        console.log(`✅ Created language: ${langData.name} (${langData.code})`);
      } else {
        console.log(`ℹ️  Language already exists: ${langData.name} (${langData.code})`);
      }
    }

    // Load translation files
    const translationFiles = ['en.json', 'es.json', 'fr.json'];
    
    for (const fileName of translationFiles) {
      const langCode = fileName.replace('.json', '');
      const filePath = path.join(__dirname, '../../../../admin/src/shared/translations', fileName);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Translation file not found: ${fileName}`);
        continue;
      }

      const translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`📝 Processing translations for ${langCode}...`);

      // Flatten nested objects and create translation entries
      const flattenedTranslations = flattenObject(translations, '');
      
      for (const [key, value] of Object.entries(flattenedTranslations)) {
        const keyHash = crypto.createHash('md5').update(key).digest('hex');
        
        // Check if translation already exists
        const existingTranslation = await languageValueRepository.findByLanguageAndKey(langCode, keyHash);
        
        if (!existingTranslation) {
          const languageValue = languageValueRepository.create({
            keyHash,
            languageCode: langCode,
            originalKey: key,
            destinationValue: value as string,
          });
          
          await languageValueRepository.save(languageValue);
          console.log(`  ✅ Added: ${key} = ${value}`);
        } else {
          console.log(`  ℹ️  Already exists: ${key}`);
        }
      }
    }

    console.log('🎉 Translation population completed successfully!');
    
  } catch (error) {
    console.error('❌ Error populating translations:', error);
  } finally {
    await app.close();
  }
}

function flattenObject(obj: any, prefix: string = ''): Record<string, string> {
  const flattened: Record<string, string> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenObject(obj[key], newKey));
      } else {
        flattened[newKey] = String(obj[key]);
      }
    }
  }
  
  return flattened;
}

// Run the script
populateTranslations().catch(console.error);
