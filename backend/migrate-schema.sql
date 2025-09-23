-- Migration script to add normalized schema support
-- Add attribute_value_id column to product_attribute_values table

ALTER TABLE product_attribute_values 
ADD COLUMN attribute_value_id BIGINT UNSIGNED NULL;

-- Add foreign key constraint
ALTER TABLE product_attribute_values 
ADD CONSTRAINT fk_pav_attribute_value 
FOREIGN KEY (attribute_value_id) REFERENCES attribute_values(id) ON DELETE CASCADE;

-- Add performance indexes
ALTER TABLE product_attribute_values 
ADD KEY ix_pav_attribute_value (attribute_value_id),
ADD KEY ix_product_attribute_value (product_id, attribute_id, attribute_value_id),
ADD KEY ix_attribute_value_product (attribute_value_id, product_id);

-- Remove the unique constraint that prevents multiple values per product-attribute
ALTER TABLE product_attribute_values 
DROP INDEX ux_product_attribute;
