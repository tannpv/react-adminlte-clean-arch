"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
class Category {
    constructor(id, name, parentId = null) {
        this.id = id;
        this.name = name;
        this.parentId = parentId;
    }
    clone() {
        return new Category(this.id, this.name, this.parentId);
    }
}
exports.Category = Category;
//# sourceMappingURL=category.entity.js.map