import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Check, Search } from 'lucide-react';
import { saveEntry, searchProducts } from '../utils/supabaseData';
import { Product } from '../lib/supabase';

interface SparePart {
  id: string;
  name: string;
  quantity: number;
}

const EntryForm: React.FC = () => {
  const [mechanicName, setMechanicName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [complaintType, setComplaintType] = useState('');
  const [spareParts, setSpareParts] = useState<SparePart[]>([
    { id: '1', name: '', quantity: 1 }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [activePartId, setActivePartId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!mechanicName.trim()) {
      newErrors.mechanicName = 'Mechanic name is required';
    }

    if (!contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10}$/.test(contactNumber.replace(/\D/g, ''))) {
      newErrors.contactNumber = 'Please enter a valid 10-digit phone number';
    }

    if (!vehicleNumber.trim()) {
      newErrors.vehicleNumber = 'Vehicle number is required';
    }
    
    if (!complaintType.trim()) {
      newErrors.complaintType = 'Complaint type is required';
    }

    // Check if there's at least one valid spare part with name and quantity
    const validParts = spareParts.filter(part => part.name.trim() && part.quantity > 0);
    if (validParts.length === 0) {
      newErrors.spareParts = 'At least one spare part with name and quantity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPart = () => {
    // Add a new empty part to the list
    const newPart = { id: Date.now().toString(), name: '', quantity: 1 };
    setSpareParts([...spareParts, newPart]);
    
    // Focus on the new part's name input after adding
    setTimeout(() => {
      const newPartInput = document.getElementById(`part-name-${newPart.id}`);
      if (newPartInput) (newPartInput as HTMLElement).focus();
    }, 10);
  };

  const handleRemovePart = (id: string) => {
    setSpareParts(spareParts.filter(part => part.id !== id));
  };

  const handlePartChange = (id: string, field: 'name' | 'quantity', value: string | number) => {
    setSpareParts(spareParts.map(part =>
      part.id === id ? { ...part, [field]: value } : part
    ));
    
    if (field === 'name' && typeof value === 'string') {
      setSearchTerm(value);
      setActivePartId(id);
      if (value.trim().length > 0) {
        searchProductsDebounced(value);
        setShowDropdown(true);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }
  };
  
  // Debounce search to avoid too many requests
  const searchProductsDebounced = async (query: string) => {
    try {
      const results = await searchProducts(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    }
  };
  const searchProductsDebounced = async (query: string) => {
    try {
      const results = await searchProducts(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    }
  };
  
  const handleSelectProduct = (product: Product) => {
    if (activePartId) {
      setSpareParts(spareParts.map(part =>
        part.id === activePartId ? { ...part, name: product.name } : part
      ));
      setShowDropdown(false);
      setSearchResults([]);
      setSearchTerm('');
      
      // Focus on quantity input after selection
      setTimeout(() => {
        const quantityInput = document.getElementById(`quantity-${activePartId}`);
        if (quantityInput) quantityInput.focus();
      }, 10);
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Filter out parts with empty names or invalid quantities
      const validParts = spareParts.filter(part => part.name.trim() && part.quantity > 0);
      
      await saveEntry({
        mechanicName: mechanicName.trim(),
        contactNumber: contactNumber.trim(),
        vehicleNumber: vehicleNumber.toUpperCase().trim(),
        complaintType: complaintType.trim(),
        spareParts: validParts,
        timestamp: new Date()
      });

      setShowSuccess(true);
      
      // Reset form
      setMechanicName('');
      setContactNumber('');
      setVehicleNumber('');
      setComplaintType('');
      setSpareParts([{ id: '1', name: '', quantity: 1 }]);
      setSearchResults([]);
      setShowDropdown(false);
      setSearchTerm('');
      setActivePartId(null);
      setErrors({});

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatContactNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3').replace(/-+$/, '');
    }
    return contactNumber;
  };

  if (showSuccess) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Entry Saved Successfully!</h3>
          <p className="text-gray-600">The spare parts entry has been recorded in the system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">New Parts Entry</h2>
        <p className="text-gray-600 mt-1">Record spare parts taken by mechanics</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Mechanic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="mechanicName" className="block text-sm font-medium text-gray-700 mb-2">
              Mechanic Name *
            </label>
            <input
              type="text"
              id="mechanicName"
              value={mechanicName}
              onChange={(e) => setMechanicName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.mechanicName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter mechanic name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  document.getElementById('contactNumber')?.focus();
                }
              }}
            />
            {errors.mechanicName && (
              <p className="mt-1 text-sm text-red-600">{errors.mechanicName}</p>
            )}
          </div>

          <div>
            <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Contact Number *
            </label>
            <input
              type="tel"
              id="contactNumber"
              value={contactNumber}
              onChange={(e) => setContactNumber(formatContactNumber(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.contactNumber ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="123-456-7890"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  document.getElementById('vehicleNumber')?.focus();
                }
              }}
            />
            {errors.contactNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>
            )}
          </div>
        </div>

        {/* Vehicle Information */}
        <div>
          <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Number Plate *
          </label>
          <input
            type="text"
            id="vehicleNumber"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.vehicleNumber ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="KA01AB1234"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                document.getElementById('complaintType')?.focus();
              }
            }}
          />
          {errors.vehicleNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.vehicleNumber}</p>
          )}
        </div>

        {/* Complaint Type */}
        <div>
          <label htmlFor="complaintType" className="block text-sm font-medium text-gray-700 mb-2">
            Complaint Type *
          </label>
          <input
            type="text"
            id="complaintType"
            value={complaintType}
            onChange={(e) => setComplaintType(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.complaintType ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter complaint type (e.g., Brake Issues, Engine Performance)"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const partNameInput = document.querySelector('input[placeholder="Part name or number"]');
                if (partNameInput) (partNameInput as HTMLElement).focus();
              }
            }}
          />
          {errors.complaintType && (
            <p className="mt-1 text-sm text-red-600">{errors.complaintType}</p>
          )}
        </div>

        {/* Spare Parts Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Spare Parts *
            </label>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 mb-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part Name</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Quantity</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {spareParts.map((part, index) => (
                  <tr key={part.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <div className="relative">
                        <input
                          id={`part-name-${part.id}`}
                          type="text"
                          value={part.name}
                          onChange={(e) => handlePartChange(part.id, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Part name or number"
                          onFocus={() => {
                            setActivePartId(part.id);
                            if (part.name.trim().length > 0) {
                              searchProductsDebounced(part.name);
                              setShowDropdown(true);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (searchResults.length > 0 && showDropdown) {
                                handleSelectProduct(searchResults[0]);
                              } else {
                                const quantityInput = document.getElementById(`quantity-${part.id}`);
                                if (quantityInput) quantityInput.focus();
                              }
                            } else if (e.key === 'ArrowDown' && searchResults.length > 0 && showDropdown) {
                              e.preventDefault();
                              const dropdown = document.getElementById(`dropdown-${part.id}`);
                              const firstItem = dropdown?.querySelector('div');
                              if (firstItem) (firstItem as HTMLElement).focus();
                            }
                          }}
                        />
                        {activePartId === part.id && showDropdown && searchResults.length > 0 && (
                          <div 
                            id={`dropdown-${part.id}`}
                            ref={dropdownRef}
                            className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm"
                          >
                            {searchResults.map((product) => (
                              <div
                                key={product.id}
                                onClick={() => handleSelectProduct(product)}
                                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 focus:bg-gray-100 outline-none"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSelectProduct(product);
                                  }
                                }}
                              >
                                <div className="flex items-center">
                                  <span className="font-medium block truncate">{product.name}</span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Part #: {product.partNumber}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <input
                        id={`quantity-${part.id}`}
                        type="number"
                        min="1"
                        value={part.quantity}
                        onChange={(e) => handlePartChange(part.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (index === spareParts.length - 1) {
                              handleAddPart();
                            } else {
                              const nextPartInput = document.getElementById(`part-name-${spareParts[index + 1]?.id}`);
                              if (nextPartInput) (nextPartInput as HTMLElement).focus();
                            }
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-right">
                      {spareParts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePart(part.id)}
                          className="text-red-500 hover:text-red-700 focus:outline-none"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-start mb-4">
            <button
              type="button"
              onClick={handleAddPart}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Another Part
            </button>
          </div>
          
          {errors.spareParts && (
            <p className="mt-2 text-sm text-red-600">{errors.spareParts}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EntryForm;