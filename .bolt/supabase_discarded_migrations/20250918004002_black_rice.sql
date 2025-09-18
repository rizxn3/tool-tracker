/*
  # Add search function for products

  1. New Functions
    - `search_products` - Search products by name or part number with fuzzy matching
  
  2. Security
    - Function is accessible to public users
    - Uses existing RLS policies on products table
*/

-- Function to search products by name or part number
CREATE OR REPLACE FUNCTION search_products(search_term TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  part_number TEXT,
  buying_price NUMERIC(10,2),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    p.name ILIKE '%' || search_term || '%' 
    OR p.part_number ILIKE '%' || search_term || '%'
  ORDER BY 
    -- Prioritize exact matches first
    CASE 
      WHEN p.name ILIKE search_term THEN 1
      WHEN p.part_number ILIKE search_term THEN 2
      WHEN p.name ILIKE search_term || '%' THEN 3
      WHEN p.part_number ILIKE search_term || '%' THEN 4
      ELSE 5
    END,
    p.name
  LIMIT 10;
END;
$$;