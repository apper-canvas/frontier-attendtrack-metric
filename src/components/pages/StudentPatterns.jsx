import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { startOfWeek, endOfWeek, subWeeks, addWeeks } from 'date-fns';
import PatternAnalysis from '@/components/organisms/PatternAnalysis';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const StudentPatterns = () => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  const navigateWeek = (direction) => {
    if (direction === 'prev') {
      setSelectedWeek(prev => subWeeks(prev, 1));
    } else {
      setSelectedWeek(prev => addWeeks(prev, 1));
    }
  };

  const goToCurrentWeek = () => {
    setSelectedWeek(new Date());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-gray-900">
            Student Patterns
          </h1>
          <p className="mt-2 text-gray-600">
            Analyze attendance patterns and identify trends
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={goToCurrentWeek}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Calendar" className="w-4 h-4" />
            <span>Current Week</span>
          </Button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="bg-white rounded-lg border border-surface-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigateWeek('prev')}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="ChevronLeft" className="w-4 h-4" />
            <span>Previous Week</span>
          </Button>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Pattern Analysis
            </h2>
            <p className="text-sm text-gray-600">Identify attendance behaviors and trends</p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => navigateWeek('next')}
            className="flex items-center space-x-2"
          >
            <span>Next Week</span>
            <ApperIcon name="ChevronRight" className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Pattern Analysis Component */}
      <motion.div
        key={selectedWeek.toISOString()}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PatternAnalysis selectedWeek={selectedWeek} />
      </motion.div>
    </div>
  );
};

export default StudentPatterns;