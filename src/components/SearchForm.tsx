"use client";

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader } from 'lucide-react';
import { CitySuggestion } from '@/lib/types';
import { debounce } from '@/lib/utils';

interface SearchFormProps {
  onSearch: (city: string) => void;
}

const SearchForm = ({ onSearch }: SearchFormProps) => {
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isSuggestionsLoading, setSuggestionsLoading] = useState(false);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    setSuggestionsLoading(true);
    try {
      const response = await fetch(`/api/cities?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setSuggestions(data);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Failed to fetch city suggestions:', error);
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 300), [fetchSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCity(value);
    debouncedFetchSuggestions(value);
  };

  const handleSuggestionClick = (suggestion: CitySuggestion) => {
    setCity(suggestion.name);
    setSuggestions([]);
    onSearch(suggestion.name);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(city);
    setSuggestions([]);
    setCity('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-20 bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 mb-8"
    >
      <h1 className="text-4xl font-bold text-center mb-4">Weatheria</h1>
      <form onSubmit={handleFormSubmit} className="relative w-full max-w-md mx-auto">
        <input
          type="text"
          value={city}
          onChange={handleInputChange}
          placeholder="Search for a city..."
          className="w-full p-3 pl-10 rounded-full bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/80 transition-all"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70" />
        <AnimatePresence>
          {(suggestions.length > 0 || isSuggestionsLoading) && (
            <motion.ul
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 w-full bg-gray-800/90 backdrop-blur-md text-white rounded-lg shadow-lg mt-2 overflow-hidden"
            >
              {isSuggestionsLoading ? (
                <li className="px-4 py-3 text-center flex items-center justify-center"><Loader className="animate-spin mr-2"/> Loading...</li>
              ) : (
                suggestions.map((suggestion) => (
                  <motion.li
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="px-4 py-3 hover:bg-white/20 cursor-pointer"
                    onMouseDown={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.name}, {suggestion.country}
                  </motion.li>
                ))
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};

export default SearchForm;
