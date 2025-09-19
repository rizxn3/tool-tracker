import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Check } from 'lucide-react';
// Make sure these imports are correct
import { searchProducts, saveEntry } from '../utils/supabaseData'; 
import { Product } from '../lib/supabase';

// Interface for the spare parts list in the form's state
interface SparePart {
  id: string;
  name: string;
  quantity: number;
}

const EntryForm: React.FC = () => {
  // Form field states
  const [mechanicName, setMechanicName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [complaintType, setComplaintType] = useState('');
  const [spareParts, setSpareParts] = useState<SparePart[]>([
    { id: Date.now().toString(), name: '', quantity: 0 }
  ]);

  // Enhanced search-related states
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchInputs, setSearchInputs] = useState<Record<string, string>>({});
  const [dropdownStates, setDropdownStates] = useState<Record<string, boolean>>({});
  const [selectedIndex, setSelectedIndex] = useState<Record<string, number>>({});
  
  // Other UI/form handling states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});


  // --- FORM VALIDATION ---
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!mechanicName.trim()) newErrors.mechanicName = 'Mechanic name is required';
    if (!contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
    if (!/^\d{10}$/.test(contactNumber.replace(/\D/g, ''))) newErrors.contactNumber = 'Please enter a valid 10-digit phone number';
    if (!vehicleNumber.trim()) newErrors.vehicleNumber = 'Vehicle number is required';
    if (!complaintType.trim()) newErrors.complaintType = 'Complaint type is required';
    const validParts = spareParts.filter(part => part.name.trim() && part.quantity > 0);
    if (validParts.length === 0) newErrors.spareParts = 'At least one spare part is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- SPARE PARTS MANAGEMENT ---
  const handleAddPart = () => {
    const newPart = { id: Date.now().toString(), name: '', quantity: 0 };
    setSpareParts([...spareParts, newPart]);
    // Initialize search input and dropdown state for the new part
    setSearchInputs(prev => ({ ...prev, [newPart.id]: '' }));
    setDropdownStates(prev => ({ ...prev, [newPart.id]: false }));
    setSelectedIndex(prev => ({ ...prev, [newPart.id]: -1 }));
    setTimeout(() => document.getElementById(`part-name-${newPart.id}`)?.focus(), 10);
  };

  const handleRemovePart = (id: string) => {
    setSpareParts(spareParts.filter(part => part.id !== id));
    // Clean up search state for removed part
    setSearchInputs(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
    setDropdownStates(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const handlePartChange = (id: string, field: 'name' | 'quantity', value: string | number) => {
    setSpareParts(prevParts =>
      prevParts.map(part =>
        part.id === id ? { ...part, [field]: value } : part
      )
    );

    // If the name is changed, update search input and trigger search
    if (field === 'name' && typeof value === 'string') {
      setSearchInputs(prev => ({ ...prev, [id]: value }));
      searchProductsDebounced(id, value);
    }
  };

  // --- SEARCH FUNCTIONALITY ---

  // Initialize search inputs and dropdown states for existing parts
  useEffect(() => {
    const initialSearchInputs: Record<string, string> = {};
    const initialDropdownStates: Record<string, boolean> = {};
    
    spareParts.forEach(part => {
      initialSearchInputs[part.id] = part.name;
      initialDropdownStates[part.id] = false;
    });
    
    setSearchInputs(initialSearchInputs);
    setDropdownStates(initialDropdownStates);
  }, []);

  // Debounced search to prevent API calls on every keystroke
  const searchProductsDebounced = React.useCallback(
    (() => {
      const timeouts: Record<string, NodeJS.Timeout> = {};
      
      return (partId: string, query: string) => {
        // Clear existing timeout for this part
        if (timeouts[partId]) {
          clearTimeout(timeouts[partId]);
        }
        
        timeouts[partId] = setTimeout(async () => {
          if (query.trim().length > 0) {
            try {
              const results = await searchProducts(query);
              setSearchResults(results);
              setDropdownStates(prev => ({ ...prev, [partId]: true }));
              // Initialize selected index to 0 when dropdown opens
              setSelectedIndex(prev => ({ ...prev, [partId]: 0 }));
            } catch (error) {
              console.error('Error searching products:', error);
              setSearchResults([]);
              setDropdownStates(prev => ({ ...prev, [partId]: false }));
            }
          } else {
            setSearchResults([]);
            setDropdownStates(prev => ({ ...prev, [partId]: false }));
          }
        }, 300); // 300ms delay
      };
    })(),
    []
  );

  // Handle selecting a product from the dropdown
  const handleSelectProduct = (partId: string, product: Product) => {
    // Update the name of the selected spare part
    setSpareParts(prevParts =>
      prevParts.map(part =>
        part.id === partId ? { ...part, name: product.name } : part
      )
    );
    
    // Update search input with selected product name
    setSearchInputs(prev => ({ ...prev, [partId]: product.name }));
    
    // Hide dropdown
    setDropdownStates(prev => ({ ...prev, [partId]: false }));
    
    // Focus on the quantity input for better UX
    setTimeout(() => document.getElementById(`quantity-${partId}`)?.focus(), 10);
  };
  
  // Handle input focus to show dropdown
  const handleInputFocus = (partId: string) => {
    const query = searchInputs[partId] || '';
    if (query.trim().length > 0) {
      searchProductsDebounced(partId, query);
      // Also initialize selected index when focusing
      setSelectedIndex(prev => ({ ...prev, [partId]: 0 }));
    }
  };
  
  // Handle keyboard navigation for dropdown
  const handleKeyDown = (e: React.KeyboardEvent, partId: string) => {
    const query = searchInputs[partId] || '';
    
    // For arrow down, show dropdown even if it's not currently visible
    if (e.key === 'ArrowDown' && !dropdownStates[partId] && query.trim().length > 0) {
      e.preventDefault();
      searchProductsDebounced(partId, query);
      setDropdownStates(prev => ({ ...prev, [partId]: true }));
      setSelectedIndex(prev => ({ ...prev, [partId]: 0 }));
      return;
    }
    
    if (!dropdownStates[partId]) return;
    
    const currentIndex = selectedIndex[partId] || -1;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (searchResults.length > 0) {
          // Calculate new index with wrap-around
          const newIndex = currentIndex < searchResults.length - 1 ? currentIndex + 1 : 0;
          setSelectedIndex(prev => ({ ...prev, [partId]: newIndex }));
          
          // Ensure the selected item is visible in the dropdown with smooth scrolling
          ensureElementIsVisible(partId, newIndex, 'down');
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (searchResults.length > 0) {
          // Calculate new index with wrap-around
          const newIndex = currentIndex > 0 ? currentIndex - 1 : searchResults.length - 1;
          setSelectedIndex(prev => ({ ...prev, [partId]: newIndex }));
          
          // Ensure the selected item is visible in the dropdown with smooth scrolling
          ensureElementIsVisible(partId, newIndex, 'up');
        }
        break;
      case 'Tab':
        // Allow natural tab navigation but close dropdown
        setDropdownStates(prev => ({ ...prev, [partId]: false }));
        break;
      case 'Enter':
        e.preventDefault();
        if (currentIndex >= 0 && currentIndex < searchResults.length) {
          handleSelectProduct(partId, searchResults[currentIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setDropdownStates(prev => ({ ...prev, [partId]: false }));
        break;
      case 'Home':
        // Jump to first item
        e.preventDefault();
        if (searchResults.length > 0) {
          setSelectedIndex(prev => ({ ...prev, [partId]: 0 }));
          ensureElementIsVisible(partId, 0, 'up');
        }
        break;
      case 'End':
        // Jump to last item
        e.preventDefault();
        if (searchResults.length > 0) {
          const lastIndex = searchResults.length - 1;
          setSelectedIndex(prev => ({ ...prev, [partId]: lastIndex }));
          ensureElementIsVisible(partId, lastIndex, 'down');
        }
        break;
    }
  };
  
  // Helper function to ensure selected element is visible with improved scrolling
  const ensureElementIsVisible = (partId: string, index: number, direction: 'up' | 'down') => {
    setTimeout(() => {
      const selectedElement = document.querySelector(`[data-part-id="${partId}"][data-index="${index}"]`) as HTMLElement;
      const container = dropdownRefs.current[partId];
      
      if (selectedElement && container) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = selectedElement.getBoundingClientRect();
        
        // Check if element is not fully visible
        const isAbove = elementRect.top < containerRect.top;
        const isBelow = elementRect.bottom > containerRect.bottom;
        
        if (isAbove || isBelow) {
          // Use scrollIntoView with smooth behavior for better UX
          selectedElement.scrollIntoView({
            block: direction === 'up' ? 'start' : 'end',
            behavior: 'smooth'
          });
        }
      }
    }, 0);
  };
  
  // Close dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.entries(dropdownRefs.current).forEach(([partId, ref]) => {
        if (ref && !ref.contains(event.target as Node)) {
          setDropdownStates(prev => ({ ...prev, [partId]: false }));
        }
      });
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- FORM SUBMISSION ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
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
      // Reset form fields
      setMechanicName('');
      setContactNumber('');
      setVehicleNumber('');
      setComplaintType('');
      setSpareParts([{ id: Date.now().toString(), name: '', quantity: 1 }]);
      setErrors({});
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving entry:', error);
      // Here you might want to set an error message to display to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI & RENDER ---

  if (showSuccess) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Entry Saved Successfully!</h3>
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
        {/* Mechanic & Vehicle Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mechanic Name */}
          <div>
            <label htmlFor="mechanicName" className="block text-sm font-medium text-gray-700 mb-2">Mechanic Name *</label>
            <input type="text" id="mechanicName" value={mechanicName} onChange={(e) => setMechanicName(e.target.value)} className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.mechanicName ? 'border-red-300' : 'border-gray-300'}`} placeholder="Enter mechanic name"/>
            {errors.mechanicName && <p className="mt-1 text-sm text-red-600">{errors.mechanicName}</p>}
          </div>
          {/* Contact Number */}
          <div>
            <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
            <input type="tel" id="contactNumber" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.contactNumber ? 'border-red-300' : 'border-gray-300'}`} placeholder="Enter 10-digit number"/>
            {errors.contactNumber && <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>}
          </div>
        </div>
        <div>
            <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700 mb-2">Vehicle Number Plate *</label>
            <input type="text" id="vehicleNumber" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())} className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.vehicleNumber ? 'border-red-300' : 'border-gray-300'}`} placeholder="KA01AB1234"/>
            {errors.vehicleNumber && <p className="mt-1 text-sm text-red-600">{errors.vehicleNumber}</p>}
        </div>
        <div>
            <label htmlFor="complaintType" className="block text-sm font-medium text-gray-700 mb-2">Complaint Type *</label>
            <input type="text" id="complaintType" value={complaintType} onChange={(e) => setComplaintType(e.target.value)} className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.complaintType ? 'border-red-300' : 'border-gray-300'}`} placeholder="e.g., Brake Issues, Engine Oil Change"/>
            {errors.complaintType && <p className="mt-1 text-sm text-red-600">{errors.complaintType}</p>}
        </div>

        {/* Spare Parts Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">Spare Parts *</label>
            {errors.spareParts && <p className="text-sm text-red-600">{errors.spareParts}</p>}
          </div>
          
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 mb-2 px-3 py-2 bg-gray-50 rounded-t-lg">
            <div className="col-span-8 text-sm font-medium text-gray-700">Part Name or Number</div>
            <div className="col-span-3 text-sm font-medium text-gray-700">Quantity</div>
            <div className="col-span-1"></div>
          </div>
          
          {/* Table Body */}
          <div className="border border-gray-200 rounded-b-lg divide-y divide-gray-200">
            {spareParts.map((part, index) => (
              <div key={part.id} className="grid grid-cols-12 gap-4 p-3 items-center">
                {/* Part Name Input with Dropdown */}
                <div className="col-span-8 relative">
                  <input
                    id={`part-name-${part.id}`}
                    type="text"
                    value={part.name}
                    onChange={(e) => handlePartChange(part.id, 'name', e.target.value)}
                    onFocus={() => handleInputFocus(part.id)}
                    onKeyDown={(e) => handleKeyDown(e, part.id)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type to search parts..."
                    aria-autocomplete="list"
                    aria-controls={dropdownStates[part.id] ? `dropdown-${part.id}` : undefined}
                    aria-expanded={dropdownStates[part.id]}
                    aria-activedescendant={dropdownStates[part.id] && selectedIndex[part.id] !== undefined ? `option-${part.id}-${selectedIndex[part.id]}` : undefined}
                    role="combobox"
                  />
                  
                  {/* Search Results Dropdown */}
                  {dropdownStates[part.id] && (
                    <div 
                      ref={(el) => dropdownRefs.current[part.id] = el}
                      className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm"
                      role="listbox"
                      aria-labelledby={`part-name-${part.id}`}
                      id={`dropdown-${part.id}`}
                    >
                      {searchResults.length > 0 ? (
                        searchResults.map((product, index) => (
                          <div
                            key={product.id}
                            id={`option-${part.id}-${index}`}
                            data-part-id={part.id}
                            data-index={index}
                            onClick={() => handleSelectProduct(part.id, product)}
                            className={`cursor-pointer px-4 py-2 transition-colors duration-150 ${
                              index === (selectedIndex[part.id] || -1) 
                                ? 'bg-blue-500 text-white' 
                                : 'hover:bg-gray-100'
                            }`}
                            role="option"
                            aria-selected={index === (selectedIndex[part.id] || -1)}
                            tabIndex={-1}
                          >
                            <p className={`text-sm font-medium ${index === (selectedIndex[part.id] || -1) ? 'text-white' : 'text-gray-900'}`}>
                              {product.name} {product.partNumber && `(${product.partNumber})`}
                            </p>
                            {'description' in product && (
                              <p className={`text-sm ${index === (selectedIndex[part.id] || -1) ? 'text-blue-100' : 'text-gray-500'}`}>
                                {product.description?.toString()}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">
                          No matching products found
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Quantity Input */}
                <div className="col-span-3">
                  <input
                    id={`quantity-${part.id}`}
                    type="number"
                    min="0"
                    value={part.quantity}
                    onChange={(e) => handlePartChange(part.id, 'quantity', e.target.value === '' ? 0 : parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Remove Button */}
                <div className="col-span-1 flex justify-center">
                  {spareParts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePart(part.id)}
                      className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Add Part Button */}
          <button
            type="button"
            onClick={handleAddPart}
            className="mt-4 flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add another part
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={isSubmitting} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EntryForm;