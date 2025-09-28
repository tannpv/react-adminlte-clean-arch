"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileDirectory = void 0;
class FileDirectory {
    constructor(id, ownerId, name, parentId, createdAt, updatedAt) {
        this.id = id;
        this.ownerId = ownerId;
        this.name = name;
        this.parentId = parentId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    clone() {
        return new FileDirectory(this.id, this.ownerId, this.name, this.parentId, new Date(this.createdAt), new Date(this.updatedAt));
    }
}
exports.FileDirectory = FileDirectory;
//# sourceMappingURL=file-directory.entity.js.map