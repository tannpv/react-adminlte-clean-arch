# Attribute Sets & Configurable Product Enhancements

## Goal
Extend the current product/attribute system so it matches Magento-style attribute sets and configurable product behaviour.

## Concepts
- **Attribute Set**: a named collection of attributes that determine which fields a product shows.
- **Product Attribute**: existing global attributes (size, colour, etc.). Will be assigned to attribute sets.
- **Attribute Group (optional)**: logical sections within a set (e.g. "General", "Dimensions"). Nice-to-have if time.
- **Configurable Options**: attributes marked for variations on a configurable (variable) product.
- **Simple Product**: existing single-SKU item; still attach attributes for descriptive purposes.
- **Configurable Product**: parent product with multiple child variants (already partially supported).

## Backend Requirements
1. **Schema additions**
   - `attribute_sets` table (id, name, description, created/updated).
   - `attribute_set_attributes` table linking sets ↔ attributes, including sort order and optional group.
   - (Optional) `attribute_groups` table for organising attribute set sections.
   - Extend `products` table with `attribute_set_id` (nullable, default to a "Default" set).
2. **Domain Entities/Repositories**
   - Entities for `AttributeSet` and optional `AttributeGroup`.
   - Repository interfaces + MySQL implementations for CRUD + assignment management.
3. **Services & Controllers**
   - Service to manage attribute sets (create/update/delete, assign attributes, reorder, etc.).
   - HTTP endpoints (e.g. `/product-attribute-sets`) with permissions `product-attributesets:*`.
4. **Validation**
   - Ensure unique set names/slugs.
   - Prevent deletion when products still reference a set (or provide re-assignment path).

## Frontend Requirements
1. **Admin UI**
   - New Attribute Sets page mirroring Magento’s UI: list sets, manage assigned attributes, order them.
   - Modal/forms for creating/editing sets and assigning attributes (drag/drop or ordering controls).
   - In Product form:
     * Select attribute set (defaults to "Default").
     * Switching sets loads appropriate attributes; keep warnings when data would be lost.
2. **Variants UI Enhancements**
   - Auto-populate attribute selectors from selected set.
   - Provide clearer warnings/validation when required attributes are missing for configurable products.
3. **Permissions/UX**
   - New permission group `product-attribute-sets:*` surfaced in Role editor.
   - Navigation entry for Attribute Sets (under E-Commerce) that respects permissions.

## Migration Strategy
- Seed a "Default" attribute set containing existing attributes so current products keep working.
- Backfill `products.attribute_set_id` to the Default set.
- Provide migration script or admin tool to move products to new sets later.

## Testing
- Backend: unit tests for attribute set service (CRUD, assignment) and product save logic with sets.
- Frontend: component tests for attribute set management, product form switching sets, variant generation with set-defined attributes.

## Step Breakdown
1. **Step 1 – Planning (this document)**
2. **Step 2 – Backend schema + domain entities for attribute sets**
3. **Step 3 – Attribute set API/service implementation & permissions**
4. **Step 4 – Admin UI for managing attribute sets**
5. **Step 5 – Integrate attribute sets into product form + variant flow**
6. **Step 6 – Testing, migrations, polishing**

