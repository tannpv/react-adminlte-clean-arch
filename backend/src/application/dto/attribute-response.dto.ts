export class AttributeResponseDto {
  id: number;
  code: string;
  name: string;
  inputType: "select" | "multiselect" | "text" | "number" | "boolean";
  dataType: "string" | "number" | "boolean";
  unit: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: number,
    code: string,
    name: string,
    inputType: "select" | "multiselect" | "text" | "number" | "boolean",
    dataType: "string" | "number" | "boolean",
    unit: string | null,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.inputType = inputType;
    this.dataType = dataType;
    this.unit = unit;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
