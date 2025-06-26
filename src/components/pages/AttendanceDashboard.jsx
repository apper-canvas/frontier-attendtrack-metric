import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, isToday } from 'date-fns';
import AttendanceGrid from '@/components/organisms/AttendanceGrid';
import AttendanceSummary from '@/components/organisms/AttendanceSummary';
import DatePicker from '@/components/molecules/DatePicker';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';
import AttendanceCharts from '@/components/organisms/AttendanceCharts';
const AttendanceDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentLecture, setCurrentLecture] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    updateCurrentLecture();
    const interval = setInterval(updateCurrentLecture, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const updateCurrentLecture = () => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 8 && hour < 10) {
      setCurrentLecture('8am');
    } else if (hour >= 10 && hour < 13) {
      setCurrentLecture('10am');
    } else if (hour >= 13 && hour < 16) {
      setCurrentLecture('1pm');
    } else {
      setCurrentLecture(null);
    }
  };

  const getCurrentLectureInfo = () => {
    const lectureInfo = {
      '8am': { label: '8:00 AM Lecture', color: 'bg-primary', icon: 'Clock8' },
      '10am': { label: '10:00 AM Lecture', color: 'bg-secondary', icon: 'Clock10' },
      '1pm': { label: '1:00 PM Lecture', color: 'bg-success', icon: 'Clock1' }
    };
    return lectureInfo[currentLecture] || null;
  };

  const handleAttendanceUpdate = () => {
    setRefreshKey(prev => prev + 1);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const lectureInfo = getCurrentLectureInfo();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-gray-900">
            Attendance Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Track and manage student attendance across all lecture slots
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          {/* Current Lecture Indicator */}
          {isToday(selectedDate) && lectureInfo && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-white ${lectureInfo.color}`}
            >
              <ApperIcon name={lectureInfo.icon} className="w-4 h-4" />
              <span className="text-sm font-medium">Current: {lectureInfo.label}</span>
            </motion.div>
          )}
          
          {/* Date Picker */}
          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            className="w-48"
          />
          
          {/* Today Button */}
          {!isToday(selectedDate) && (
            <Button
              variant="outline"
              onClick={goToToday}
              className="flex items-center space-x-2"
            >
              <ApperIcon name="Calendar" className="w-4 h-4" />
              <span>Today</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Grid */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-surface-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Student Attendance - {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h2>
              <Button
                variant="ghost"
                onClick={() => setRefreshKey(prev => prev + 1)}
                className="flex items-center space-x-2"
              >
                <ApperIcon name="RefreshCw" className="w-4 h-4" />
                <span>Refresh</span>
              </Button>
            </div>
            
            <AttendanceGrid
              key={refreshKey}
              selectedDate={selectedDate}
              onAttendanceUpdate={handleAttendanceUpdate}
            />
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-surface-200 p-6">
            <AttendanceSummary
              key={refreshKey}
selectedDate={selectedDate}
            />
          </div>
          
          {/* Charts Section */}
          <div className="bg-white rounded-lg border border-surface-200 p-6">
            <AttendanceCharts key={refreshKey} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard;