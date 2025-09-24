export class TranslationResponseDto {
  id!: number;
  value!: string;
  notes?: string;
  isActive!: boolean;
  languageId!: number;
  keyId!: number;
  keyPath!: string;
  namespace!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export class TranslationNamespaceResponseDto {
  id!: number;
  name!: string;
  description?: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

export class TranslationKeyResponseDto {
  id!: number;
  keyPath!: string;
  description?: string;
  isActive!: boolean;
  namespaceId!: number;
  namespace!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export class TranslationsByNamespaceResponseDto {
  namespace!: string;
  translations!: Record<string, string>;
}


