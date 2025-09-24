export class Translation {
  id!: number;
  value!: string; // The actual translated text
  notes?: string; // Translation notes for translators
  isActive!: boolean;
  languageId!: number;
  keyId!: number;
  language?: any; // Language
  key?: any; // TranslationKey
  createdAt!: Date;
  updatedAt!: Date;
}
