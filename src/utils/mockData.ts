export interface SparePart {
  id: string;
  name: string;
  quantity: number;
}

export interface Entry {
  id: string;
  mechanicName: string;
  contactNumber: string;
  vehicleNumber: string;
  spareParts: SparePart[];
  complaintType: string;
  timestamp: Date;
}

// Mock data storage (in a real app, this would be a database)
let mockEntries: Entry[] = [
  {
    id: '1',
    mechanicName: 'Rajesh Kumar',
    contactNumber: '9876543210',
    vehicleNumber: 'KA01AB1234',
    spareParts: [
      { id: '1', name: 'Brake Pad Set', quantity: 2 },
      { id: '2', name: 'Chain Lubricant', quantity: 1 }
    ],
    complaintType: 'Brake Issues',
    timestamp: new Date(2024, 0, 15, 10, 30)
  },
  {
    id: '2',
    mechanicName: 'Suresh Babu',
    contactNumber: '9876543211',
    vehicleNumber: 'TN02CD5678',
    spareParts: [
      { id: '3', name: 'Engine Oil', quantity: 2 },
      { id: '4', name: 'Air Filter', quantity: 1 }
    ],
    complaintType: 'Engine Performance',
    timestamp: new Date(2024, 0, 16, 14, 45)
  },
  {
    id: '3',
    mechanicName: 'Amit Singh',
    contactNumber: '9876543212',
    vehicleNumber: 'MH03EF9012',
    spareParts: [
      { id: '5', name: 'Spark Plug', quantity: 2 },
      { id: '6', name: 'Brake Pad Set', quantity: 1 }
    ],
    complaintType: 'Starting Problem',
    timestamp: new Date(2024, 0, 17, 9, 15)
  },
  {
    id: '4',
    mechanicName: 'Rajesh Kumar',
    contactNumber: '9876543210',
    vehicleNumber: 'KA05GH3456',
    spareParts: [
      { id: '7', name: 'Chain Lubricant', quantity: 1 },
      { id: '8', name: 'Clutch Cable', quantity: 1 }
    ],
    complaintType: 'Clutch Slipping',
    timestamp: new Date(2024, 0, 18, 11, 20)
  },
  {
    id: '5',
    mechanicName: 'Vikram Reddy',
    contactNumber: '9876543213',
    vehicleNumber: 'AP04IJ7890',
    spareParts: [
      { id: '9', name: 'Headlight Bulb', quantity: 2 },
      { id: '10', name: 'Engine Oil', quantity: 1 }
    ],
    complaintType: 'Electrical Issue',
    timestamp: new Date(2024, 0, 19, 16, 0)
  }
];

// Save a new entry
export const saveEntry = async (entryData: Omit<Entry, 'id'>): Promise<Entry> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newEntry: Entry = {
    ...entryData,
    id: Date.now().toString()
  };
  
  mockEntries.push(newEntry);
  return newEntry;
};

// Search by vehicle number plate
export const searchByPlateNumber = (plateNumber: string): Entry[] => {
  return mockEntries.filter(entry =>
    entry.vehicleNumber.toLowerCase().includes(plateNumber.toLowerCase())
  ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Search by spare part name
export const searchByPartName = (partName: string): Entry[] => {
  return mockEntries.filter(entry =>
    entry.spareParts.some(part =>
      part.name.toLowerCase().includes(partName.toLowerCase())
    )
  ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Search by mechanic name
export const searchByMechanicName = (mechanicName: string): Entry[] => {
  return mockEntries.filter(entry =>
    entry.mechanicName.toLowerCase().includes(mechanicName.toLowerCase())
  ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Get all entries (for admin purposes)
export const getAllEntries = (): Entry[] => {
  return [...mockEntries].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Get statistics
export const getStatistics = () => {
  const totalEntries = mockEntries.length;
  const uniqueMechanics = new Set(mockEntries.map(entry => entry.mechanicName)).size;
  const totalParts = mockEntries.reduce((sum, entry) => 
    sum + entry.spareParts.reduce((partSum, part) => partSum + part.quantity, 0), 0
  );
  
  return {
    totalEntries,
    uniqueMechanics,
    totalParts
  };
};