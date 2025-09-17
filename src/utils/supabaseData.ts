import { supabase, type Entry, type SparePart } from '../lib/supabase';

// Convert database row to Entry interface
const convertDbRowToEntry = (row: any): Entry => ({
  id: row.id,
  mechanicName: row.mechanic_name,
  contactNumber: row.contact_number,
  vehicleNumber: row.vehicle_number,
  complaintType: row.complaint_type,
  spareParts: row.spare_parts || [],
  timestamp: new Date(row.created_at)
});

// Convert Entry interface to database row
const convertEntryToDbRow = (entry: Omit<Entry, 'id' | 'timestamp'>) => ({
  mechanic_name: entry.mechanicName,
  contact_number: entry.contactNumber,
  vehicle_number: entry.vehicleNumber,
  complaint_type: entry.complaintType,
  spare_parts: entry.spareParts
});

// Save a new entry
export const saveEntry = async (entryData: Omit<Entry, 'id' | 'timestamp'>): Promise<Entry> => {
  try {
    const dbRow = convertEntryToDbRow(entryData);
    
    const { data, error } = await supabase
      .from('entries')
      .insert([dbRow])
      .select()
      .single();

    if (error) {
      console.error('Error saving entry:', error);
      throw new Error(`Failed to save entry: ${error.message}`);
    }

    return convertDbRowToEntry(data);
  } catch (error) {
    console.error('Error in saveEntry:', error);
    throw error;
  }
};

// Search by vehicle number plate
export const searchByPlateNumber = async (plateNumber: string): Promise<Entry[]> => {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .ilike('vehicle_number', `%${plateNumber}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching by plate number:', error);
      throw new Error(`Failed to search by plate number: ${error.message}`);
    }

    return (data || []).map(convertDbRowToEntry);
  } catch (error) {
    console.error('Error in searchByPlateNumber:', error);
    throw error;
  }
};

// Search by spare part name
export const searchByPartName = async (partName: string): Promise<Entry[]> => {
  try {
    // Use PostgreSQL's JSONB operators to search within the spare_parts array
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .contains('spare_parts', [{ name: partName }])
      .order('created_at', { ascending: false });

    if (error) {
      // If the exact match fails, try a more flexible search
      const { data: fallbackData, error: fallbackError } = await supabase
        .rpc('search_entries_by_part_name', { search_term: partName });

      if (fallbackError) {
        console.error('Error searching by part name:', fallbackError);
        throw new Error(`Failed to search by part name: ${fallbackError.message}`);
      }

      return (fallbackData || []).map(convertDbRowToEntry);
    }

    return (data || []).map(convertDbRowToEntry);
  } catch (error) {
    console.error('Error in searchByPartName:', error);
    throw error;
  }
};

// Search by mechanic name
export const searchByMechanicName = async (mechanicName: string): Promise<Entry[]> => {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .ilike('mechanic_name', `%${mechanicName}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching by mechanic name:', error);
      throw new Error(`Failed to search by mechanic name: ${error.message}`);
    }

    return (data || []).map(convertDbRowToEntry);
  } catch (error) {
    console.error('Error in searchByMechanicName:', error);
    throw error;
  }
};

// Get all entries (for admin purposes)
export const getAllEntries = async (): Promise<Entry[]> => {
  try {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting all entries:', error);
      throw new Error(`Failed to get all entries: ${error.message}`);
    }

    return (data || []).map(convertDbRowToEntry);
  } catch (error) {
    console.error('Error in getAllEntries:', error);
    throw error;
  }
};

// Get statistics
export const getStatistics = async () => {
  try {
    // Get total entries count
    const { count: totalEntries, error: countError } = await supabase
      .from('entries')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    // Get unique mechanics count
    const { data: mechanicsData, error: mechanicsError } = await supabase
      .from('entries')
      .select('mechanic_name')
      .order('mechanic_name');

    if (mechanicsError) {
      throw mechanicsError;
    }

    const uniqueMechanics = new Set(mechanicsData?.map(entry => entry.mechanic_name)).size;

    // Get total parts count (this would require a more complex query)
    const { data: partsData, error: partsError } = await supabase
      .from('entries')
      .select('spare_parts');

    if (partsError) {
      throw partsError;
    }

    const totalParts = (partsData || []).reduce((sum, entry) => {
      const parts = entry.spare_parts as SparePart[];
      return sum + parts.reduce((partSum, part) => partSum + part.quantity, 0);
    }, 0);

    return {
      totalEntries: totalEntries || 0,
      uniqueMechanics,
      totalParts
    };
  } catch (error) {
    console.error('Error getting statistics:', error);
    throw error;
  }
};