export class LanguageValue {
  id?: number;
  keyHash?: string; // MD5 hash of the key
  languageCode?: string;
  originalKey?: string; // Original untranslated key
  destinationValue?: string; // Translated value
  createdAt?: Date;
  updatedAt?: Date;
}