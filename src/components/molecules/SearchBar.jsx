import { useState } from 'react';
import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Input from '@/components/atoms/Input';

const SearchBar = ({ 
  placeholder = 'Search...', 
  onSearch, 
  className = '',
  debounceMs = 300 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (value) => {
    setIsSearching(true);
    
    // Debounce the search
    setTimeout(() => {
      onSearch(value);
      setIsSearching(false);
    }, debounceMs);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isSearching ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <ApperIcon name="Loader2" className="w-4 h-4 text-gray-400" />
            </motion.div>
          ) : (
            <ApperIcon name="Search" className="w-4 h-4 text-gray-400" />
          )}
        </div>
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <ApperIcon name="X" className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;