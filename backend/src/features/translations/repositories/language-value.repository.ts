import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LanguageValue } from "../entities/language-value.entity";

@Injectable()
export class LanguageValueRepository {
  constructor(
    @InjectRepository(LanguageValue)
    private readonly repository: Repository<LanguageValue>
  ) {}

  async findByLanguageAndKey(
    languageCode: string,
    keyHash: string
  ): Promise<LanguageValue | null> {
    return this.repository.findOne({
      where: { languageCode: languageCode.toLowerCase(), keyHash },
    });
  }

  async findByLanguageAndOriginalKey(
    languageCode: string,
    originalKey: string
  ): Promise<LanguageValue | null> {
    return this.repository.findOne({
      where: {
        languageCode: languageCode.toLowerCase(),
        originalKey: originalKey.trim(),
      },
    });
  }

  async findAllByLanguage(languageCode: string): Promise<LanguageValue[]> {
    return this.repository.find({
      where: { languageCode: languageCode.toLowerCase() },
      order: { originalKey: "ASC" },
    });
  }

  async create(
    languageValueData: Partial<LanguageValue>
  ): Promise<LanguageValue> {
    const languageValue = this.repository.create(languageValueData);
    return this.repository.save(languageValue);
  }

  async update(
    id: number,
    languageValueData: Partial<LanguageValue>
  ): Promise<LanguageValue> {
    await this.repository.update(id, languageValueData);
    return this.repository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByLanguageAndKey(
    languageCode: string,
    keyHash: string
  ): Promise<void> {
    await this.repository.delete({
      languageCode: languageCode.toLowerCase(),
      keyHash,
    });
  }

  async findMissingTranslations(
    languageCode: string
  ): Promise<LanguageValue[]> {
    // Find translations that exist in other languages but not in the specified language
    const query = this.repository
      .createQueryBuilder("lv1")
      .where("lv1.languageCode != :languageCode", {
        languageCode: languageCode.toLowerCase(),
      })
      .andWhere(
        "NOT EXISTS (SELECT 1 FROM language_values lv2 WHERE lv2.languageCode = :languageCode AND lv2.keyHash = lv1.keyHash)"
      )
      .groupBy("lv1.keyHash, lv1.originalKey")
      .select(["lv1.keyHash", "lv1.originalKey"]);

    return query.getRawMany();
  }
}
