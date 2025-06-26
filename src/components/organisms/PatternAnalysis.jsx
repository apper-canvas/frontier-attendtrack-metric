import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { startOfWeek, endOfWeek, format, eachDayOfInterval } from 'date-fns';
import { toast } from 'react-toastify';
import { attendanceService } from '@/services/api/attendanceService';
import { studentService } from '@/services/api/studentService';
import Badge from '@/components/atoms/Badge';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import ApperIcon from '@/components/ApperIcon';

const PatternAnalysis = ({ selectedWeek = new Date() }) => {
  const [students, setStudents] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPatternData();
  }, [selectedWeek]);

  const loadPatternData = async () => {
    setLoading(true);
    
    try {
      const [studentsData, weeklyAttendance] = await Promise.all([
        studentService.getAll(),
        attendanceService.getAttendanceStats(
          startOfWeek(selectedWeek),
          endOfWeek(selectedWeek)
        )
      ]);

      setStudents(studentsData);
      
      const patternAnalysis = analyzeWeeklyPatterns(weeklyAttendance, studentsData);
      setPatterns(patternAnalysis);
      
    } catch (err) {
      toast.error('Failed to load pattern analysis');
    } finally {
      setLoading(false);
    }
  };

  const analyzeWeeklyPatterns = (attendanceRecords, students) => {
    const studentPatterns = students.map(student => {
      const studentRecords = attendanceRecords.filter(r => r.studentId === student.Id);
      
      // Count attendance by time slot
      const stats = {
        total8am: 0,
        total10am: 0,
        total1pm: 0,
        totalDays: studentRecords.length
      };

      studentRecords.forEach(record => {
        if (record.lecture8am) stats.total8am++;
        if (record.lecture10am) stats.total10am++;
        if (record.lecture1pm) stats.total1pm++;
      });

      // Identify patterns
      const patterns = [];
      
      // Early bird - always attends 8am
      if (stats.total8am === stats.totalDays && stats.totalDays > 0) {
        patterns.push('early-bird');
      }
      
      // Middle skipper - attends 8am and 1pm but skips 10am
      const middleSkips = studentRecords.filter(r => 
        r.lecture8am && !r.lecture10am && r.lecture1pm
      ).length;
      if (middleSkips >= stats.totalDays * 0.5) {
        patterns.push('middle-skipper');
      }
      
      // Late starter - only attends 1pm
      const lateStarts = studentRecords.filter(r => 
        !r.lecture8am && !r.lecture10am && r.lecture1pm
      ).length;
      if (lateStarts >= stats.totalDays * 0.5) {
        patterns.push('late-starter');
      }
      
      // Irregular - attendance varies significantly
      const attendanceCounts = studentRecords.map(r => 
        [r.lecture8am, r.lecture10am, r.lecture1pm].filter(Boolean).length
      );
      const hasIrregular = attendanceCounts.some(count => count === 1 || count === 2);
      if (hasIrregular && stats.totalDays > 1) {
        patterns.push('irregular');
      }
      
      // Poor attendance - less than 60% overall
      const totalPossible = stats.totalDays * 3;
      const totalAttended = stats.total8am + stats.total10am + stats.total1pm;
      const percentage = totalPossible > 0 ? (totalAttended / totalPossible) * 100 : 0;
      
      if (percentage < 60) {
        patterns.push('poor-attendance');
      }

      return {
        student,
        stats,
        patterns,
        percentage: Math.round(percentage)
      };
    });

    return studentPatterns;
  };

  const getPatternIcon = (pattern) => {
    const icons = {
      'early-bird': 'Sunrise',
      'middle-skipper': 'AlertTriangle',
      'late-starter': 'Sunset',
      'irregular': 'Shuffle',
      'poor-attendance': 'AlertCircle'
    };
    return icons[pattern] || 'User';
  };

  const getPatternColor = (pattern) => {
    const colors = {
      'early-bird': 'success',
      'middle-skipper': 'warning',
      'late-starter': 'secondary',
      'irregular': 'warning',
      'poor-attendance': 'error'
    };
    return colors[pattern] || 'default';
  };

  const getPatternDescription = (pattern) => {
    const descriptions = {
      'early-bird': 'Always attends 8 AM lectures',
      'middle-skipper': 'Frequently skips 10 AM lectures',
      'late-starter': 'Only attends afternoon lectures',
      'irregular': 'Inconsistent attendance pattern',
      'poor-attendance': 'Overall attendance below 60%'
    };
    return descriptions[pattern] || pattern;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
        <span className="ml-3 text-gray-600">Analyzing attendance patterns...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Attendance Patterns - Week of {format(startOfWeek(selectedWeek), 'MMM d, yyyy')}
        </h2>
      </div>

      <div className="space-y-4">
        {patterns.map((item, index) => (
          <motion.div
            key={item.student.Id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-lg border border-surface-200 p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {item.student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{item.student.name}</h3>
                  <p className="text-sm text-gray-500">{item.student.rollNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{item.percentage}%</div>
                <div className="text-sm text-gray-500">Overall</div>
              </div>
            </div>

            {/* Attendance Stats */}
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">8 AM</div>
                <div className="font-semibold">{item.stats.total8am}/{item.stats.totalDays}</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">10 AM</div>
                <div className="font-semibold">{item.stats.total10am}/{item.stats.totalDays}</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">1 PM</div>
                <div className="font-semibold">{item.stats.total1pm}/{item.stats.totalDays}</div>
              </div>
            </div>

            {/* Pattern Badges */}
            {item.patterns.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {item.patterns.map(pattern => (
                  <Badge 
                    key={pattern} 
                    variant={getPatternColor(pattern)}
                    className="flex items-center space-x-1"
                  >
                    <ApperIcon name={getPatternIcon(pattern)} className="w-3 h-3" />
                    <span>{getPatternDescription(pattern)}</span>
                  </Badge>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {patterns.length === 0 && (
        <div className="text-center py-12">
          <ApperIcon name="TrendingUp" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pattern Data</h3>
          <p className="text-gray-600">Attendance data for this week is not available.</p>
        </div>
      )}
    </div>
  );
};

export default PatternAnalysis;