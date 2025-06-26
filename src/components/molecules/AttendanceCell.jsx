import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';

const AttendanceCell = ({ 
  present, 
  onToggle, 
  disabled = false,
  showIcon = true,
  className = '' 
}) => {
  const handleClick = () => {
    if (!disabled && onToggle) {
      onToggle(!present);
    }
  };

  const baseClasses = 'w-10 h-10 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all';
  const stateClasses = disabled 
    ? 'cursor-not-allowed opacity-50'
    : 'hover:scale-110';
  
  const statusClasses = present 
    ? 'bg-success/10 border-success text-success'
    : 'bg-gray-50 border-gray-300 text-gray-400 hover:border-gray-400';

  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.1 } : {}}
      whileTap={!disabled ? { scale: 0.9 } : {}}
      onClick={handleClick}
      className={`${baseClasses} ${stateClasses} ${statusClasses} ${className}`}
    >
      {showIcon && (
        <ApperIcon 
          name={present ? "Check" : "Minus"} 
          className="w-5 h-5" 
        />
      )}
    </motion.div>
  );
};

export default AttendanceCell;