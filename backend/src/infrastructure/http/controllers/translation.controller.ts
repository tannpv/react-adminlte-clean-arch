import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { CreateLanguageDto } from "../../../application/dto/create-language.dto";
import { UpdateLanguageDto } from "../../../application/dto/update-language.dto";
import { TranslationService } from "../../../application/services/translation.service";
import { RequireAnyPermission } from "../decorators/permissions.decorator";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { PermissionsGuard } from "../guards/permissions.guard";

@Controller("translations")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TranslationController {
  constructor(private readonly translationService: TranslationService) {}

  // Language management endpoints
  @Post("languages")
  @RequireAnyPermission("translations:create", "admin:all")
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createLanguage(@Body() createLanguageDto: CreateLanguageDto) {
    return this.translationService.createLanguage(createLanguageDto);
  }

  @Get("languages")
  @RequireAnyPermission("translations:read", "admin:all")
  async findAllLanguages() {
    return this.translationService.findAllLanguages();
  }

  @Get("languages/active")
  @RequireAnyPermission("translations:read", "admin:all")
  async findActiveLanguages() {
    return this.translationService.findActiveLanguages();
  }

  @Get("languages/:code")
  @RequireAnyPermission("translations:read", "admin:all")
  async findLanguageByCode(@Param("code") code: string) {
    return this.translationService.findLanguageByCode(code);
  }

  @Put("languages/:id")
  @RequireAnyPermission("translations:update", "admin:all")
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateLanguage(
    @Param("id") id: number,
    @Body() updateLanguageDto: UpdateLanguageDto
  ) {
    return this.translationService.updateLanguage(id, updateLanguageDto);
  }

  @Delete("languages/:id")
  @RequireAnyPermission("translations:delete", "admin:all")
  async deleteLanguage(@Param("id") id: number) {
    await this.translationService.deleteLanguage(id);
    return { message: "Language deleted successfully" };
  }

  // Translation endpoints
  @Get("languages/:languageCode/namespaces/:namespace")
  @RequireAnyPermission("translations:read", "admin:all")
  async getTranslationsByNamespace(
    @Param("languageCode") languageCode: string,
    @Param("namespace") namespace: string
  ) {
    return this.translationService.getTranslationsByNamespace(
      languageCode,
      namespace
    );
  }

  @Get("languages/:languageCode/translations")
  @RequireAnyPermission("translations:read", "admin:all")
  async getAllTranslationsForLanguage(
    @Param("languageCode") languageCode: string
  ) {
    return this.translationService.getAllTranslationsForLanguage(languageCode);
  }

  @Get("translate/:languageCode/:keyPath")
  @RequireAnyPermission("translations:read", "admin:all")
  async getTranslation(
    @Param("languageCode") languageCode: string,
    @Param("keyPath") keyPath: string
  ) {
    const translation = await this.translationService.getTranslation(
      languageCode,
      keyPath
    );
    return { keyPath, translation };
  }

  // Cache management endpoints
  @Post("cache/clear")
  @RequireAnyPermission("translations:manage", "admin:all")
  async clearCache(
    @Query("languageCode") languageCode?: string,
    @Query("namespace") namespace?: string
  ) {
    await this.translationService.clearTranslationCache(
      languageCode,
      namespace
    );
    return { message: "Cache cleared successfully" };
  }

  @Get("cache/stats")
  @RequireAnyPermission("translations:read", "admin:all")
  async getCacheStats() {
    return this.translationService.getCacheStats();
  }

  @Post("cache/warmup")
  @RequireAnyPermission("translations:manage", "admin:all")
  async warmUpCache(
    @Body() body: { languageCode: string; namespaces: string[] }
  ) {
    await this.translationService.warmUpCache(
      body.languageCode,
      body.namespaces
    );
    return { message: "Cache warmed up successfully" };
  }

  // Translation management endpoints
  @Post("translations")
  @RequireAnyPermission("translations:create", "admin:all")
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async createTranslation(
    @Body()
    body: {
      languageCode: string;
      keyPath: string;
      value: string;
      notes?: string;
    }
  ) {
    return this.translationService.createTranslation(
      body.languageCode,
      body.keyPath,
      body.value,
      body.notes
    );
  }

  @Get("all")
  @RequireAnyPermission("translations:read", "admin:all")
  async getAllTranslations(
    @Query("languageCode") languageCode?: string,
    @Query("namespace") namespace?: string
  ) {
    return this.translationService.getAllTranslations(languageCode, namespace);
  }

  @Put("translations/:id")
  @RequireAnyPermission("translations:update", "admin:all")
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  async updateTranslation(
    @Param("id") id: number,
    @Body() body: { value: string; notes?: string }
  ) {
    return this.translationService.updateTranslation(
      id,
      body.value,
      body.notes
    );
  }

  @Delete("translations/:id")
  @RequireAnyPermission("translations:delete", "admin:all")
  async deleteTranslation(@Param("id") id: number) {
    await this.translationService.deleteTranslation(id);
    return { message: "Translation deleted successfully" };
  }
}
