import { forwardRef } from 'react';

const Input = forwardRef(({ 
  type = 'text',
  placeholder = '',
  disabled = false,
  error = false,
  className = '',
  ...props 
}, ref) => {
  const baseClasses = 'block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors';
  
  const stateClasses = error 
    ? 'border-error focus:ring-error focus:border-error' 
    : 'border-gray-300 focus:ring-primary focus:border-primary';
    
  const disabledClasses = disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white';

  return (
    <input
      ref={ref}
      type={type}
      placeholder={placeholder}
      disabled={disabled}
      className={`${baseClasses} ${stateClasses} ${disabledClasses} ${className}`}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;