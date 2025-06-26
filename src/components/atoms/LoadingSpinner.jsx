import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'medium', className = '' }) => {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizes[size]} ${className}`}
    >
      <div className="w-full h-full border-2 border-gray-300 border-t-primary rounded-full"></div>
    </motion.div>
  );
};

export default LoadingSpinner;