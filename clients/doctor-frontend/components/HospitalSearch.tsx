import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface GlobalHospital {
  _id: string;
  id: number;
  name: string;
  nameBangla: string;
  division: string;
  district: string;
  upazila: string;
  address?: string; // Constructed
}

interface HospitalSearchProps {
  onSelect: (hospital: GlobalHospital) => void;
}

export default function HospitalSearch({ onSelect }: HospitalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalHospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchHospitals = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/global-hospitals?query=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (error) {
        console.error('Error searching hospitals:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchHospitals, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (hospital: GlobalHospital) => {
    // Construct address from location fields
    const addressParts = [
      hospital.upazila,
      hospital.district,
      hospital.division
    ].filter(Boolean);
    
    const hospitalWithAddress = {
      ...hospital,
      address: addressParts.join(', ')
    };

    onSelect(hospitalWithAddress);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div className="relative mb-6" ref={searchRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Search & Auto-fill from Database
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search hospital by name (English or Bangla)..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {results.map((hospital) => (
            <div
              key={hospital._id}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50"
              onClick={() => handleSelect(hospital)}
            >
              <div className="flex flex-col">
                <span className="font-medium text-gray-900">{hospital.name}</span>
                <span className="text-gray-500 text-xs">{hospital.nameBangla}</span>
                <span className="text-gray-400 text-xs">
                  {[hospital.upazila, hospital.district].filter(Boolean).join(', ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
