export class TranslationNamespace {
  id!: number;
  name!: string; // e.g., 'auth', 'products', 'common'
  description?: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  keys?: any[]; // TranslationKey[]
}
