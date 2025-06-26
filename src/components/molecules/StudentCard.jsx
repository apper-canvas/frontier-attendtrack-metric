import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Badge from '@/components/atoms/Badge';

const StudentCard = ({ 
  student, 
  attendanceRecord, 
  onAttendanceChange,
  className = '' 
}) => {
  const getPresentCount = () => {
    if (!attendanceRecord) return 0;
    return [
      attendanceRecord.lecture8am,
      attendanceRecord.lecture10am,
      attendanceRecord.lecture1pm
    ].filter(Boolean).length;
  };

  const getAttendanceStatus = () => {
    const count = getPresentCount();
    if (count === 3) return 'present';
    if (count === 0) return 'absent';
    return 'partial';
  };

  const handleAttendanceToggle = (lectureSlot, currentValue) => {
    if (onAttendanceChange) {
      onAttendanceChange(student.Id, lectureSlot, !currentValue);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg border border-surface-200 p-4 hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </span>
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{student.name}</h3>
            <p className="text-sm text-gray-500">{student.rollNumber}</p>
          </div>
        </div>
        <Badge variant={getAttendanceStatus()}>
          {getPresentCount()}/3
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { key: 'lecture8am', label: '8 AM', time: '08:00' },
          { key: 'lecture10am', label: '10 AM', time: '10:00' },
          { key: 'lecture1pm', label: '1 PM', time: '13:00' }
        ].map(({ key, label, time }) => (
          <div key={key} className="text-center">
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleAttendanceToggle(key, attendanceRecord?.[key])}
              className={`w-full h-8 rounded-md border-2 flex items-center justify-center transition-colors ${
                attendanceRecord?.[key]
                  ? 'bg-success/10 border-success text-success'
                  : 'bg-gray-50 border-gray-300 text-gray-400 hover:border-gray-400'
              }`}
            >
              <ApperIcon 
                name={attendanceRecord?.[key] ? "Check" : "Minus"} 
                className="w-4 h-4" 
              />
            </motion.button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default StudentCard;