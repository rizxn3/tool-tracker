/*
  # Create products table for bike spare parts inventory

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `part_number` (text, required)
      - `buying_price` (numeric, required)
      - `created_at` (timestamp with timezone, default now)
      - `updated_at` (timestamp with timezone, default now)

  2. Security
    - Enable RLS on `products` table
    - Add policy for public access (since no authentication is implemented)

  3. Indexes
    - Add indexes for common search fields (name, part_number)
*/

-- Create the products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  part_number text NOT NULL,
  buying_price numeric(10, 2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since no authentication is implemented)
-- In a production app, you would want proper authentication and user-specific policies
CREATE POLICY "Allow public access to products"
  ON products
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products (name);
CREATE INDEX IF NOT EXISTS idx_products_part_number ON products (part_number);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at DESC);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function for searching products by name or part number
CREATE OR REPLACE FUNCTION search_products(search_term text)
RETURNS TABLE (
  id uuid,
  name text,
  part_number text,
  buying_price numeric,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.part_number,
    p.buying_price,
    p.created_at,
    p.updated_at
  FROM products p
  WHERE 
    p.name ILIKE '%' || search_term || '%' OR
    p.part_number ILIKE '%' || search_term || '%'
  ORDER BY 
    CASE 
      WHEN p.name ILIKE search_term || '%' THEN 0
      WHEN p.part_number ILIKE search_term || '%' THEN 0
      WHEN p.name ILIKE '%' || search_term || '%' THEN 1
      WHEN p.part_number ILIKE '%' || search_term || '%' THEN 1
      ELSE 2
    END,
    p.name ASC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;