/*
  # Create entries table for bike spare parts management

  1. New Tables
    - `entries`
      - `id` (uuid, primary key)
      - `mechanic_name` (text, required)
      - `contact_number` (text, required)
      - `vehicle_number` (text, required)
      - `complaint_type` (text, required)
      - `spare_parts` (jsonb, array of parts with name and quantity)
      - `created_at` (timestamp with timezone, default now)
      - `updated_at` (timestamp with timezone, default now)

  2. Security
    - Enable RLS on `entries` table
    - Add policy for public access (since no authentication is implemented)

  3. Indexes
    - Add indexes for common search fields (vehicle_number, mechanic_name)
*/

-- Create the entries table
CREATE TABLE IF NOT EXISTS entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mechanic_name text NOT NULL,
  contact_number text NOT NULL,
  vehicle_number text NOT NULL,
  complaint_type text NOT NULL,
  spare_parts jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since no authentication is implemented)
-- In a production app, you would want proper authentication and user-specific policies
CREATE POLICY "Allow public access to entries"
  ON entries
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_entries_vehicle_number ON entries (vehicle_number);
CREATE INDEX IF NOT EXISTS idx_entries_mechanic_name ON entries (mechanic_name);
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON entries (created_at DESC);

-- Create index for searching spare parts (GIN index for JSONB)
CREATE INDEX IF NOT EXISTS idx_entries_spare_parts ON entries USING GIN (spare_parts);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_entries_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();