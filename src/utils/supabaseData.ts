import { supabase, type Entry, type SparePart, type Product } from '../lib/supabase';

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

// Convert database row to Product interface
const convertDbRowToProduct = (row: any): Product => ({
  id: row.id,
  name: row.name,
  partNumber: row.part_number,
  buyingPrice: row.buying_price,
  timestamp: new Date(row.created_at)
});

// Convert Product interface to database row
const convertProductToDbRow = (product: Omit<Product, 'id' | 'timestamp'>) => ({
  name: product.name,
  part_number: product.partNumber,
  buying_price: product.buyingPrice
});

// Save a new product
export const saveProduct = async (productData: Omit<Product, 'id' | 'timestamp'>): Promise<Product> => {
  try {
    const dbRow = convertProductToDbRow(productData);
    
    const { data, error } = await supabase
      .from('products')
      .insert([dbRow])
      .select()
      .single();

    if (error) {
      console.error('Error saving product:', error);
      throw new Error(`Failed to save product: ${error.message}`);
    }

    return convertDbRowToProduct(data);
  } catch (error) {
    console.error('Error in saveProduct:', error);
    throw error;
  }
};

// Get all products
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error getting all products:', error);
      throw new Error(`Failed to get all products: ${error.message}`);
    }

    return (data || []).map(convertDbRowToProduct);
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    throw error;
  }
};

// Search products by name or part number
export const searchProducts = async (searchTerm: string): Promise<Product[]> => {
  try {
    if (!searchTerm.trim()) {
      return [];
    }
    
    // Use the search_products RPC function
    const { data, error } = await supabase
      .rpc('search_products', { search_term: searchTerm.trim() });

    if (error) {
      // Fallback to direct query if RPC fails
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,part_number.ilike.%${searchTerm}%`)
        .order('name')
        .limit(10);

      if (fallbackError) {
        console.error('Error searching products:', fallbackError);
        throw new Error(`Failed to search products: ${fallbackError.message}`);
      }

      return (fallbackData || []).map(convertDbRowToProduct);
    }

    return (data || []).map(convertDbRowToProduct);
  } catch (error) {
    console.error('Error in searchProducts:', error);
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    throw error;
  }
};

// Update a product
export const updateProduct = async (id: string, productData: Partial<Omit<Product, 'id' | 'timestamp'>>): Promise<Product> => {
  try {
    const updates: any = {};
    
    if (productData.name !== undefined) updates.name = productData.name;
    if (productData.partNumber !== undefined) updates.part_number = productData.partNumber;
    if (productData.buyingPrice !== undefined) updates.buying_price = productData.buyingPrice;
    
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw new Error(`Failed to update product: ${error.message}`);
    }

    return convertDbRowToProduct(data);
  } catch (error) {
    console.error('Error in updateProduct:', error);
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

    // Get total products count
    const { count: totalProducts, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (productsError) {
      throw productsError;
    }

    return {
      totalEntries: totalEntries || 0,
      uniqueMechanics,
      totalParts,
      totalProducts: totalProducts || 0
    };
  } catch (error) {
    console.error('Error getting statistics:', error);
    throw error;
  }
};