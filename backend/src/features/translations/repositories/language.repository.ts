import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Language } from "../entities/language.entity";

@Injectable()
export class LanguageRepository {
  constructor(
    @InjectRepository(Language)
    private readonly repository: Repository<Language>
  ) {}

  async findAll(): Promise<Language[]> {
    return this.repository.find({
      where: { isActive: true },
      order: { isDefault: "DESC", name: "ASC" },
    });
  }

  async findByCode(code: string): Promise<Language | null> {
    return this.repository.findOne({
      where: { code: code.toLowerCase() },
    });
  }

  async findDefault(): Promise<Language | null> {
    return this.repository.findOne({
      where: { isDefault: true, isActive: true },
    });
  }

  async create(languageData: Partial<Language>): Promise<Language> {
    const language = this.repository.create(languageData);
    return this.repository.save(language);
  }

  async update(id: number, languageData: Partial<Language>): Promise<Language> {
    await this.repository.update(id, languageData);
    return this.repository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async setDefault(code: string): Promise<void> {
    // Remove default from all languages
    await this.repository.update({}, { isDefault: false });

    // Set new default
    await this.repository.update(
      { code: code.toLowerCase() },
      { isDefault: true }
    );
  }
}
