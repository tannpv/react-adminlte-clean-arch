"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileEntity = void 0;
class FileEntity {
    constructor(id, ownerId, directoryId, originalName, displayName, storageKey, mimeType, sizeBytes, visibility, createdAt, updatedAt, url = null) {
        this.id = id;
        this.ownerId = ownerId;
        this.directoryId = directoryId;
        this.originalName = originalName;
        this.displayName = displayName;
        this.storageKey = storageKey;
        this.mimeType = mimeType;
        this.sizeBytes = sizeBytes;
        this.visibility = visibility;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.url = url;
    }
    clone() {
        return new FileEntity(this.id, this.ownerId, this.directoryId, this.originalName, this.displayName, this.storageKey, this.mimeType, this.sizeBytes, this.visibility, new Date(this.createdAt), new Date(this.updatedAt), this.url);
    }
}
exports.FileEntity = FileEntity;
//# sourceMappingURL=file.entity.js.map