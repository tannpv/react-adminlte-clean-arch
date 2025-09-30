import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Language } from "./language.entity";

@Entity("language_values")
@Index(["languageCode", "keyHash"], { unique: true })
@Index(["originalKey"])
export class LanguageValue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 32 })
  keyHash: string; // MD5 hash of the key

  @Column({ type: "varchar", length: 5 })
  languageCode: string;

  @Column({ type: "text" })
  originalKey: string; // Original untranslated key

  @Column({ type: "text" })
  destinationValue: string; // Translated value

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Language, (language) => language.languageValues)
  @JoinColumn({ name: "languageCode", referencedColumnName: "code" })
  language: Language;
}
