import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'react-toastify';
import { attendanceService } from '@/services/api/attendanceService';
import { studentService } from '@/services/api/studentService';
import StatCard from '@/components/molecules/StatCard';
import Badge from '@/components/atoms/Badge';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import ApperIcon from '@/components/ApperIcon';

const AttendanceSummary = ({ selectedDate }) => {
  const [todayStats, setTodayStats] = useState({
    present8am: 0,
    present10am: 0,
    present1pm: 0,
    totalStudents: 0
  });
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSummaryData();
  }, [selectedDate]);

  const loadSummaryData = async () => {
    setLoading(true);
    
    try {
      const [students, todayAttendance, weeklyAttendance] = await Promise.all([
        studentService.getAll(),
        attendanceService.getByDate(selectedDate),
        attendanceService.getAttendanceStats(
          startOfWeek(selectedDate),
          endOfWeek(selectedDate)
        )
      ]);

      // Calculate today's stats
      const stats = {
        present8am: todayAttendance.filter(r => r.lecture8am).length,
        present10am: todayAttendance.filter(r => r.lecture10am).length,
        present1pm: todayAttendance.filter(r => r.lecture1pm).length,
        totalStudents: students.length
      };
      setTodayStats(stats);

      // Analyze patterns
      const patternAnalysis = analyzeAttendancePatterns(todayAttendance, students);
      setPatterns(patternAnalysis);

      // Weekly stats
      setWeeklyStats(weeklyAttendance);
      
    } catch (err) {
      toast.error('Failed to load summary data');
    } finally {
      setLoading(false);
    }
  };

  const analyzeAttendancePatterns = (attendanceRecords, students) => {
    const patterns = [];
    
    // Find students who skip middle lecture
    const middleSkippers = attendanceRecords.filter(record => 
      record.lecture8am && !record.lecture10am && record.lecture1pm
    );
    
    // Find students with partial attendance
    const partialAttendance = attendanceRecords.filter(record => {
      const attendedCount = [record.lecture8am, record.lecture10am, record.lecture1pm]
        .filter(Boolean).length;
      return attendedCount > 0 && attendedCount < 3;
    });

    // Find completely absent students
    const totalAttendance = attendanceRecords.length;
    const absentCount = students.length - totalAttendance;

    if (middleSkippers.length > 0) {
      patterns.push({
        type: 'middle-skip',
        count: middleSkippers.length,
        description: 'Students skipping 10 AM lecture',
        severity: 'warning'
      });
    }

    if (partialAttendance.length > 0) {
      patterns.push({
        type: 'partial',
        count: partialAttendance.length,
        description: 'Students with partial attendance',
        severity: 'info'
      });
    }

    if (absentCount > 0) {
      patterns.push({
        type: 'absent',
        count: absentCount,
        description: 'Students completely absent',
        severity: 'error'
      });
    }

    return patterns;
  };

  const getAttendancePercentage = (present, total) => {
    if (total === 0) return 0;
    return Math.round((present / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Today's Overview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Today's Attendance - {format(selectedDate, 'MMM d, yyyy')}
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="8:00 AM Lecture"
            value={`${todayStats.present8am}/${todayStats.totalStudents}`}
            icon="Clock8"
            color="primary"
            trend={todayStats.present8am > todayStats.totalStudents * 0.8 ? 'up' : 'down'}
            trendValue={`${getAttendancePercentage(todayStats.present8am, todayStats.totalStudents)}%`}
          />
          <StatCard
            title="10:00 AM Lecture"
            value={`${todayStats.present10am}/${todayStats.totalStudents}`}
            icon="Clock10"
            color="secondary"
            trend={todayStats.present10am > todayStats.totalStudents * 0.8 ? 'up' : 'down'}
            trendValue={`${getAttendancePercentage(todayStats.present10am, todayStats.totalStudents)}%`}
          />
          <StatCard
            title="1:00 PM Lecture"
            value={`${todayStats.present1pm}/${todayStats.totalStudents}`}
            icon="Clock1"
            color="success"
            trend={todayStats.present1pm > todayStats.totalStudents * 0.8 ? 'up' : 'down'}
            trendValue={`${getAttendancePercentage(todayStats.present1pm, todayStats.totalStudents)}%`}
          />
        </div>
      </div>

      {/* Attendance Patterns */}
      {patterns.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Attendance Patterns
          </h3>
          
          <div className="bg-white rounded-lg border border-surface-200 p-4">
            <div className="space-y-3">
              {patterns.map((pattern, index) => (
                <motion.div
                  key={pattern.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <ApperIcon 
                      name={
                        pattern.severity === 'error' ? 'AlertTriangle' :
                        pattern.severity === 'warning' ? 'AlertCircle' :
                        'Info'
                      }
                      className={`w-5 h-5 ${
                        pattern.severity === 'error' ? 'text-error' :
                        pattern.severity === 'warning' ? 'text-warning' :
                        'text-info'
                      }`}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{pattern.description}</p>
                      <p className="text-sm text-gray-600">{pattern.count} students affected</p>
                    </div>
                  </div>
                  <Badge variant={pattern.severity}>
                    {pattern.count}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg border border-surface-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <ApperIcon name="Download" className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Export Attendance</h4>
                <p className="text-sm text-gray-600">Download today's attendance report</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-lg border border-surface-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <ApperIcon name="TrendingUp" className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">View Patterns</h4>
                <p className="text-sm text-gray-600">Analyze attendance trends</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSummary;