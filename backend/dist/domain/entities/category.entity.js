"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
class Category {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
    clone() {
        return new Category(this.id, this.name);
    }
}
exports.Category = Category;
//# sourceMappingURL=category.entity.js.map