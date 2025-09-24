export class Language {
  id!: number;
  code!: string; // e.g., 'en', 'es', 'fr'
  name!: string; // e.g., 'English', 'Spanish', 'French'
  nativeName!: string; // e.g., 'English', 'Español', 'Français'
  isDefault!: boolean;
  isActive!: boolean;
  flagIcon?: string; // e.g., '🇺🇸', '🇪🇸', '🇫🇷'
  createdAt!: Date;
  updatedAt!: Date;
  translations?: any[]; // Translation[]
}
