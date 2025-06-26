import { useState } from 'react';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Input from '@/components/atoms/Input';

const DatePicker = ({ 
  value, 
  onChange, 
  placeholder = 'Select date',
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    onChange(date);
    setIsOpen(false);
  };

  const formattedValue = value ? format(value, 'yyyy-MM-dd') : '';
  const displayValue = value ? format(value, 'MMM d, yyyy') : '';

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          type="text"
          value={displayValue}
          placeholder={placeholder}
          readOnly
          onClick={() => setIsOpen(!isOpen)}
          className="cursor-pointer pr-10"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ApperIcon name="Calendar" className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-10">
          <input
            type="date"
            value={formattedValue}
            onChange={handleDateChange}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            autoFocus
          />
        </div>
      )}
    </div>
  );
};

export default DatePicker;