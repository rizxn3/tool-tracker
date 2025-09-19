/*
  # Add bought_from column to products table

  1. Changes
    - Add 'bought_from' TEXT column to products table
*/

-- Add bought_from column to products table
ALTER TABLE products
ADD COLUMN bought_from TEXT;