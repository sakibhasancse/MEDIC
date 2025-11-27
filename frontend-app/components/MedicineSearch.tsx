'use client';

import { useState, useEffect, useRef } from 'react';
import { medicineAPI } from '@/lib/api';
import { db } from '@/lib/db';
import Fuse from 'fuse.js';

interface MedicineSearchProps {
  onSelect: (medicine: any) => void;
}

export default function MedicineSearch({ onSelect }: MedicineSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    // Debounce search
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        // Try online search first
        const response = await medicineAPI.search(query, 10);
        setResults(response.data);
        setShowResults(true);
      } catch (error) {
        // Fallback to offline search
        const localMedicines = await db.medicines.toArray();
        const fuse = new Fuse(localMedicines, {
          keys: ['name', 'genericName'],
          threshold: 0.3,
        });
        const fuzzyResults = fuse.search(query || '').map((r) => r.item);
        setResults(fuzzyResults);
        setShowResults(true);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const handleSelect = (medicine: any) => {
    onSelect(medicine);
    setQuery('');
    setResults([]);
    setShowResults(false);
    setSelectedIndex(0);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          className="w-full px-5 py-3.5 bg-gray-50 border-none rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-sm hover:bg-gray-100"
          placeholder="🔍 Search medicines (e.g. Napa, Seclo...)"
        />
        {loading && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          {results.map((medicine, index) => (
            <button
              key={medicine._id || index}
              type="button"
              onClick={() => handleSelect(medicine)}
              className={`w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition ${
                index === selectedIndex ? 'bg-blue-50' : ''
              }`}
            >
              <div className="font-medium text-gray-900">{medicine.name}</div>
              {medicine.genericName && (
                <div className="text-sm text-gray-600">{medicine.genericName}</div>
              )}
              {medicine.strength && (
                <div className="text-xs text-gray-500">{medicine.strength} - {medicine.form}</div>
              )}
            </button>
          ))}
        </div>
      )}

      {showResults && query.length >= 2 && results.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4">
          <p className="text-center text-gray-500 mb-3">
            No medicines found for "{query}"
          </p>
          <button
            type="button"
            onClick={() => {
              const newMedicine = {
                name: query,
                genericName: '',
                strength: '',
                form: 'tablet',
                commonDoses: ['1+1+1', '1+0+1', 'SOS'],
              };
              handleSelect(newMedicine);
              // Optionally save to backend
              medicineAPI.create(newMedicine).catch(err => console.error('Error saving medicine:', err));
            }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Create "{query}" as new medicine
          </button>
        </div>
      )}
    </div>
  );
}
