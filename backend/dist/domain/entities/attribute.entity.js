"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attribute = void 0;
class Attribute {
    constructor(id, code, name, inputType, dataType, unit, createdAt, updatedAt) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.inputType = inputType;
        this.dataType = dataType;
        this.unit = unit;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(code, name, inputType, dataType, unit) {
        const now = new Date();
        return new Attribute(0, code, name, inputType, dataType, unit || null, now, now);
    }
    update(code, name, inputType, dataType, unit) {
        return new Attribute(this.id, code ?? this.code, name ?? this.name, inputType ?? this.inputType, dataType ?? this.dataType, unit !== undefined ? unit : this.unit, this.createdAt, new Date());
    }
    isSelectType() {
        return this.inputType === "select" || this.inputType === "multiselect";
    }
    isTextType() {
        return this.inputType === "text";
    }
    isNumberType() {
        return this.inputType === "number";
    }
    isBooleanType() {
        return this.inputType === "boolean";
    }
}
exports.Attribute = Attribute;
//# sourceMappingURL=attribute.entity.js.map