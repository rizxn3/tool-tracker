/*
  # Add search function for spare parts

  1. Functions
    - `search_entries_by_part_name` - Function to search entries by part name using JSONB operations

  This function provides flexible searching within the spare_parts JSONB array.
*/

-- Create function to search entries by part name
CREATE OR REPLACE FUNCTION search_entries_by_part_name(search_term text)
RETURNS TABLE (
  id uuid,
  mechanic_name text,
  contact_number text,
  vehicle_number text,
  complaint_type text,
  spare_parts jsonb,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.mechanic_name,
    e.contact_number,
    e.vehicle_number,
    e.complaint_type,
    e.spare_parts,
    e.created_at,
    e.updated_at
  FROM entries e
  WHERE EXISTS (
    SELECT 1
    FROM jsonb_array_elements(e.spare_parts) AS part
    WHERE part->>'name' ILIKE '%' || search_term || '%'
  )
  ORDER BY e.created_at DESC;
END;
$$ LANGUAGE plpgsql;