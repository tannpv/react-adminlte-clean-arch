# Translation System Implementation Plan
## Based on Dictionary & TranslateCache Classes

## 📋 **Executive Summary**

This plan implements a translation system based on the provided PHP classes `Dictionary` and `TranslateCache`. The system will provide efficient translation caching, automatic fallback mechanisms, and seamless integration with the existing React/NestJS architecture.

## 🔍 **Analysis of Provided Classes**

### **Dictionary Class Features:**
- **Language normalization** with fallback to "en"
- **Key normalization** and MD5 hashing for lookup
- **Cache integration** with configurable enable/disable
- **Automatic translation insertion** for missing keys
- **Multi-language fallback** system
- **Database persistence** with LanguageValueVo

### **TranslateCache Class Features:**
- **Singleton pattern** for global access
- **Session-based language** management
- **String formatting** with parameter replacement
- **Array translation** support
- **Configurable cache disable** option
- **Default language** resolution

## 🎯 **Implementation Strategy**

### **Phase 1: Backend Foundation (Week 1)**

#### **1.1 Database Schema**
```sql
-- Languages table
CREATE TABLE languages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(5) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100),
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Language values table (equivalent to LanguageValueVo)
CREATE TABLE language_values (
    id INT PRIMARY KEY AUTO_INCREMENT,
    key_hash VARCHAR(32) NOT NULL, -- MD5 hash of the key
    language_code VARCHAR(5) NOT NULL,
    original_key TEXT NOT NULL, -- Original untranslated key
    destination_value TEXT NOT NULL, -- Translated value
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_language_key (language_code, key_hash),
    FOREIGN KEY (language_code) REFERENCES languages(code)
);

-- Indexes for performance
CREATE INDEX idx_language_values_lookup ON language_values(language_code, key_hash);
CREATE INDEX idx_language_values_original ON language_values(original_key);
```

#### **1.2 Backend Services**

**Dictionary Service (TypeScript equivalent)**
```typescript
@Injectable()
export class DictionaryService {
  constructor(
    private readonly languageRepository: LanguageRepository,
    private readonly languageValueRepository: LanguageValueRepository,
    private readonly cacheService: CacheService,
  ) {}

  async get(langCode: string, key: string): Promise<string> {
    const lookupLangCode = this.normalizeLangCode(langCode, 'en');
    const lookupKey = this.normalizeKey(key);
    const encryptLookupKey = this.md5(lookupKey);
    
    // Check cache first
    const cacheEnabled = await this.isCacheEnabled();
    let result: string | null = null;
    
    if (cacheEnabled) {
      result = await this.cacheService.getLanguageValue(encryptLookupKey, lookupLangCode);
    }
    
    if (!result) {
      const languageValue = await this.getLanguageValue(lookupLangCode, lookupKey);
      if (languageValue) {
        result = languageValue.destinationValue;
      }
    }
    
    if (!result) {
      // Try fallback languages
      const languageCodes = await this.getLanguageCodes(lookupLangCode);
      for (const languageCode of languageCodes) {
        const languageValue = await this.getLanguageValue(languageCode, lookupKey);
        if (!languageValue) {
          // Insert new translation
          await this.insert(languageCode, lookupKey, key);
        } else if (languageCode === lookupLangCode) {
          result = languageValue.destinationValue;
        }
      }
      
      if (!result) {
        result = key; // Fallback to original key
      }
    }
    
    return result;
  }

  async refresh(langCode: string, key?: string): Promise<void> {
    if (!key) return;
    
    const lookupLangCode = this.normalizeLangCode(langCode, 'en');
    const lookupKey = this.normalizeKey(key);
    
    const cacheEnabled = await this.isCacheEnabled();
    if (cacheEnabled) {
      const languageValue = await this.languageValueRepository.findByLanguageAndKey(
        lookupLangCode, 
        lookupKey
      );
      
      if (languageValue) {
        await this.cacheService.removeLanguageValueCache(languageValue);
        await this.cacheService.insertLanguageValueCache(languageValue);
      }
    }
  }

  private normalizeLangCode(langCode: string, defaultLang = 'en'): string {
    return !langCode ? defaultLang : langCode.toLowerCase().trim();
  }

  private normalizeKey(key: string, defaultKey = ''): string {
    return !key ? defaultKey : key.trim();
  }

  private md5(str: string): string {
    return crypto.createHash('md5').update(str).digest('hex');
  }

  private async insert(langCode: string, key: string, value: string): Promise<void> {
    try {
      const languageValue = new LanguageValue();
      languageValue.keyHash = this.md5(key);
      languageValue.languageCode = langCode;
      languageValue.originalKey = key;
      languageValue.destinationValue = value;
      
      await this.languageValueRepository.save(languageValue);
    } catch (error) {
      console.error('Error inserting translation:', error);
    }
  }
}
```

**TranslateCache Service (TypeScript equivalent)**
```typescript
@Injectable()
export class TranslateCacheService {
  private static instance: TranslateCacheService;
  private dictionaryService: DictionaryService;

  constructor(dictionaryService: DictionaryService) {
    this.dictionaryService = dictionaryService;
  }

  static getInstance(dictionaryService: DictionaryService): TranslateCacheService {
    if (!TranslateCacheService.instance) {
      TranslateCacheService.instance = new TranslateCacheService(dictionaryService);
    }
    return TranslateCacheService.instance;
  }

  async get(key: string): Promise<string> {
    const translateCacheDisable = await this.getSetting('translate.cache.disable', 'N');
    if (translateCacheDisable === 'Y') {
      return key;
    }
    
    const langCode = await this.getLangCode();
    return this.dictionaryService.get(langCode, key);
  }

  async getWithFormat(text: string, ...params: any[]): Promise<string> {
    const translateCacheDisable = await this.getSetting('translate.cache.disable', 'N');
    
    if (translateCacheDisable !== 'Y') {
      const langCode = await this.getLangCode();
      text = await this.dictionaryService.get(langCode, text);
    }
    
    const formats = this.getFormats(text);
    if (formats.length === 0) {
      return text;
    }
    
    const replaceMap: { [key: string]: string } = {};
    formats.forEach((format) => {
      const i = parseInt(format.substring(1, format.length - 1));
      if (i + 1 < params.length) {
        replaceMap[format] = params[i + 1];
      }
    });
    
    return this.replaceByMap(replaceMap, text);
  }

  async translate2DArray(array: { [key: string]: string }): Promise<{ [key: string]: string }> {
    if (!array || Object.keys(array).length === 0) {
      return array;
    }
    
    const result: { [key: string]: string } = {};
    for (const [key, value] of Object.entries(array)) {
      result[key] = await this.get(value);
    }
    return result;
  }

  private async getLangCode(): Promise<string> {
    // Get from session/context
    let langCode = await this.getSessionLanguage();
    if (langCode) {
      return langCode;
    }
    
    // Get default language from database
    langCode = await this.getDefaultLang();
    if (langCode) {
      await this.setSessionLanguage(langCode);
      return langCode;
    }
    
    // Fallback to config
    langCode = this.getConfigLanguage();
    await this.setSessionLanguage(langCode);
    return langCode;
  }

  private getFormats(str: string): string[] {
    const pattern = /{[0-9]+}/g;
    const matches = str.match(pattern);
    return matches || [];
  }

  private replaceByMap(replaceMap: { [key: string]: string }, text: string): string {
    let result = text;
    for (const [key, value] of Object.entries(replaceMap)) {
      result = result.replace(new RegExp(key, 'g'), value);
    }
    return result;
  }
}
```

#### **1.3 API Endpoints**
```typescript
@Controller('translations')
export class TranslationController {
  constructor(private readonly translateCacheService: TranslateCacheService) {}

  @Get('translate/:key')
  async translate(@Param('key') key: string): Promise<{ translation: string }> {
    const translation = await this.translateCacheService.get(key);
    return { translation };
  }

  @Post('translate/format')
  async translateWithFormat(@Body() body: { text: string; params: any[] }): Promise<{ translation: string }> {
    const translation = await this.translateCacheService.getWithFormat(body.text, ...body.params);
    return { translation };
  }

  @Post('translate/array')
  async translateArray(@Body() body: { [key: string]: string }): Promise<{ [key: string]: string }> {
    const translation = await this.translateCacheService.translate2DArray(body);
    return translation;
  }

  @Post('refresh')
  async refresh(@Body() body: { languageCode?: string; key?: string }): Promise<void> {
    await this.translateCacheService.refresh(body.languageCode, body.key);
  }
}
```

### **Phase 2: Frontend Implementation (Week 2)**

#### **2.1 Translation Hook**
```typescript
// hooks/useTranslation.ts
export const useTranslation = () => {
  const [language, setLanguage] = useState('en');
  
  const t = useCallback(async (key: string): Promise<string> => {
    try {
      const response = await apiClient.get(`/translations/translate/${encodeURIComponent(key)}`);
      return response.data.translation;
    } catch (error) {
      console.warn(`Translation failed for key: ${key}`, error);
      return key; // Fallback to original key
    }
  }, [language]);

  const tWithFormat = useCallback(async (text: string, ...params: any[]): Promise<string> => {
    try {
      const response = await apiClient.post('/translations/translate/format', {
        text,
        params
      });
      return response.data.translation;
    } catch (error) {
      console.warn(`Translation with format failed for text: ${text}`, error);
      return text;
    }
  }, [language]);

  const translateArray = useCallback(async (array: { [key: string]: string }): Promise<{ [key: string]: string }> => {
    try {
      const response = await apiClient.post('/translations/translate/array', array);
      return response.data;
    } catch (error) {
      console.warn('Array translation failed', error);
      return array;
    }
  }, [language]);

  return {
    t,
    tWithFormat,
    translateArray,
    language,
    setLanguage
  };
};
```

#### **2.2 Translation Component**
```typescript
// components/Translation.tsx
interface TranslationProps {
  key: string;
  fallback?: string;
  params?: any[];
}

export const Translation: React.FC<TranslationProps> = ({ key, fallback, params }) => {
  const { t, tWithFormat } = useTranslation();
  const [translation, setTranslation] = useState(fallback || key);

  useEffect(() => {
    const loadTranslation = async () => {
      try {
        if (params && params.length > 0) {
          const result = await tWithFormat(key, ...params);
          setTranslation(result);
        } else {
          const result = await t(key);
          setTranslation(result);
        }
      } catch (error) {
        setTranslation(fallback || key);
      }
    };

    loadTranslation();
  }, [key, params, t, tWithFormat, fallback]);

  return <span>{translation}</span>;
};
```

#### **2.3 Language Switcher**
```typescript
// components/LanguageSwitcher.tsx
export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslation();
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    // Load available languages
    const loadLanguages = async () => {
      try {
        const response = await apiClient.get('/languages');
        setLanguages(response.data);
      } catch (error) {
        console.error('Failed to load languages:', error);
      }
    };

    loadLanguages();
  }, []);

  const handleLanguageChange = async (newLanguage: string) => {
    setLanguage(newLanguage);
    // Refresh translations for new language
    await apiClient.post('/translations/refresh', { languageCode: newLanguage });
  };

  return (
    <select value={language} onChange={(e) => handleLanguageChange(e.target.value)}>
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
};
```

### **Phase 3: Integration & Testing (Week 3)**

#### **3.1 Application Integration**
- Replace all hardcoded strings with `<Translation key="..." />` components
- Implement translation keys for all features
- Add language switching to the main navigation
- Test translation fallbacks and error handling

#### **3.2 Performance Optimization**
- Implement Redis caching for translations
- Add translation preloading for common keys
- Optimize database queries with proper indexing
- Implement translation bundling for production

#### **3.3 Quality Assurance**
- Unit tests for Dictionary and TranslateCache services
- Integration tests for translation API endpoints
- Frontend tests for translation components
- Performance testing with large translation datasets

## 🏗️ **Technical Architecture**

### **Backend Architecture**
```
TranslationModule
├── DictionaryService (Core translation logic)
├── TranslateCacheService (Singleton cache manager)
├── LanguageRepository (Database access)
├── LanguageValueRepository (Translation storage)
├── CacheService (Redis integration)
└── TranslationController (API endpoints)
```

### **Frontend Architecture**
```
Translation System
├── useTranslation Hook (Main translation interface)
├── Translation Component (React component wrapper)
├── LanguageSwitcher (Language selection)
├── TranslationProvider (Context provider)
└── Translation API (API client)
```

### **Database Design**
```
languages (1) ←→ (N) language_values
    ↓
language_code (FK)
```

## 📊 **Implementation Timeline**

| Week | Phase | Tasks | Deliverables |
|------|-------|-------|-------------|
| 1 | Backend Foundation | Database, services, API | Working translation backend |
| 2 | Frontend Core | Hooks, components, API client | Translation system integration |
| 3 | Integration & Testing | App integration, optimization, testing | Production-ready system |

## 🎯 **Success Criteria**

### **Functional Requirements**
- ✅ Exact replication of Dictionary and TranslateCache functionality
- ✅ MD5 key hashing for efficient lookups
- ✅ Automatic translation insertion for missing keys
- ✅ Multi-language fallback system
- ✅ String formatting with parameter replacement
- ✅ Array translation support

### **Performance Requirements**
- ✅ < 50ms translation lookup time
- ✅ Redis caching with 90%+ hit rate
- ✅ Support for 10,000+ translation keys
- ✅ Efficient database queries with proper indexing

### **Integration Requirements**
- ✅ Seamless integration with existing React components
- ✅ Session-based language management
- ✅ Configurable cache enable/disable
- ✅ Graceful fallback to original keys

## 🚀 **Next Steps**

1. **Create Feature Branch**: `feature/translation-system-dictionary-cache`
2. **Begin Phase 1**: Database schema and backend services
3. **Implement Core Classes**: Dictionary and TranslateCache services
4. **Build API Endpoints**: Translation and cache management APIs
5. **Frontend Integration**: Hooks and components
6. **Testing & Optimization**: Performance and quality assurance

---

**Created**: December 2024  
**Status**: Ready for Implementation  
**Priority**: High  
**Estimated Effort**: 3 weeks  
**Based on**: Provided Dictionary & TranslateCache PHP classes
