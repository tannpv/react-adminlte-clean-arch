import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { LanguageValue } from "./language-value.entity";

@Entity("languages")
export class Language {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 5, unique: true })
  code: string;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  nativeName: string;

  @Column({ type: "boolean", default: false })
  isDefault: boolean;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => LanguageValue, (languageValue) => languageValue.language)
  languageValues: LanguageValue[];
}
