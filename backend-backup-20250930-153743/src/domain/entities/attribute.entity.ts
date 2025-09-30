export class Attribute {
  constructor(
    public readonly id: number,
    public readonly code: string,
    public readonly name: string,
    public readonly inputType:
      | "select"
      | "multiselect"
      | "text"
      | "number"
      | "boolean",
    public readonly dataType: "string" | "number" | "boolean",
    public readonly unit: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(
    code: string,
    name: string,
    inputType: "select" | "multiselect" | "text" | "number" | "boolean",
    dataType: "string" | "number" | "boolean",
    unit?: string | null
  ): Attribute {
    const now = new Date();
    return new Attribute(
      0, // Will be set by database
      code,
      name,
      inputType,
      dataType,
      unit || null,
      now,
      now
    );
  }

  update(
    code?: string,
    name?: string,
    inputType?: "select" | "multiselect" | "text" | "number" | "boolean",
    dataType?: "string" | "number" | "boolean",
    unit?: string | null
  ): Attribute {
    return new Attribute(
      this.id,
      code ?? this.code,
      name ?? this.name,
      inputType ?? this.inputType,
      dataType ?? this.dataType,
      unit !== undefined ? unit : this.unit,
      this.createdAt,
      new Date()
    );
  }

  isSelectType(): boolean {
    return this.inputType === "select" || this.inputType === "multiselect";
  }

  isTextType(): boolean {
    return this.inputType === "text";
  }

  isNumberType(): boolean {
    return this.inputType === "number";
  }

  isBooleanType(): boolean {
    return this.inputType === "boolean";
  }
}
