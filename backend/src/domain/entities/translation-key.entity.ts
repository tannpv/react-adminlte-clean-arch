export class TranslationKey {
  id!: number;
  keyPath!: string; // e.g., 'login.title', 'products.list.empty'
  description?: string;
  isActive!: boolean;
  namespaceId!: number;
  namespace?: any; // TranslationNamespace
  createdAt!: Date;
  updatedAt!: Date;
  translations?: any[]; // Translation[]
}
