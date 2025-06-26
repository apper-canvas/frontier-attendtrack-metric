import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, startOfWeek, endOfWeek, subWeeks, addWeeks } from 'date-fns';
import { toast } from 'react-toastify';
import { attendanceService } from '@/services/api/attendanceService';
import { studentService } from '@/services/api/studentService';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import ApperIcon from '@/components/ApperIcon';

const AttendanceHistory = () => {
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistoryData();
  }, [selectedWeek]);

  const loadHistoryData = async () => {
    setLoading(true);
    
    try {
      const [studentsData, attendanceRecords] = await Promise.all([
        studentService.getAll(),
        attendanceService.getAttendanceStats(
          startOfWeek(selectedWeek),
          endOfWeek(selectedWeek)
        )
      ]);

      setStudents(studentsData);
      setAttendanceData(attendanceRecords);
    } catch (err) {
      toast.error('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  const navigateWeek = (direction) => {
    if (direction === 'prev') {
      setSelectedWeek(prev => subWeeks(prev, 1));
    } else {
      setSelectedWeek(prev => addWeeks(prev, 1));
    }
  };

  const getStudentWeeklyStats = (studentId) => {
    const studentRecords = attendanceData.filter(r => r.studentId === studentId);
    
    const stats = {
      totalDays: studentRecords.length,
      present8am: studentRecords.filter(r => r.lecture8am).length,
      present10am: studentRecords.filter(r => r.lecture10am).length,
      present1pm: studentRecords.filter(r => r.lecture1pm).length
    };

    const totalPossible = stats.totalDays * 3;
    const totalPresent = stats.present8am + stats.present10am + stats.present1pm;
    stats.percentage = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;

    return stats;
  };

  const exportData = () => {
    const csvData = [];
    csvData.push(['Student Name', 'Roll Number', 'Days Present', '8 AM', '10 AM', '1 PM', 'Overall %']);

    students.forEach(student => {
      const stats = getStudentWeeklyStats(student.Id);
      csvData.push([
        student.name,
        student.rollNumber,
        stats.totalDays,
        stats.present8am,
        stats.present10am,
        stats.present1pm,
        `${stats.percentage}%`
      ]);
    });

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${format(selectedWeek, 'yyyy-MM-dd')}.csv`;
    a.click();
    
    window.URL.revokeObjectURL(url);
    toast.success('Attendance data exported successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
        <span className="ml-3 text-gray-600">Loading attendance history...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-gray-900">
            Attendance History
          </h1>
          <p className="mt-2 text-gray-600">
            View and analyze historical attendance data
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={exportData}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Download" className="w-4 h-4" />
            <span>Export CSV</span>
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
              {format(startOfWeek(selectedWeek), 'MMM d')} - {format(endOfWeek(selectedWeek), 'MMM d, yyyy')}
            </h2>
            <p className="text-sm text-gray-600">Weekly Attendance Report</p>
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

      {/* Attendance Table */}
      <div className="bg-white rounded-lg border border-surface-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  8:00 AM
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  10:00 AM
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  1:00 PM
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overall
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student, index) => {
                const stats = getStudentWeeklyStats(student.Id);
                
                return (
                  <motion.tr
                    key={student.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.rollNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900 font-medium">
                        {stats.present8am}/{stats.totalDays}
                      </div>
                      <div className="text-xs text-gray-500">
                        {stats.totalDays > 0 ? Math.round((stats.present8am / stats.totalDays) * 100) : 0}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900 font-medium">
                        {stats.present10am}/{stats.totalDays}
                      </div>
                      <div className="text-xs text-gray-500">
                        {stats.totalDays > 0 ? Math.round((stats.present10am / stats.totalDays) * 100) : 0}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-900 font-medium">
                        {stats.present1pm}/{stats.totalDays}
                      </div>
                      <div className="text-xs text-gray-500">
                        {stats.totalDays > 0 ? Math.round((stats.present1pm / stats.totalDays) * 100) : 0}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Badge
                        variant={
                          stats.percentage >= 80 ? 'success' :
                          stats.percentage >= 60 ? 'warning' : 'error'
                        }
                      >
                        {stats.percentage}%
                      </Badge>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {students.length === 0 && (
        <div className="text-center py-12">
          <ApperIcon name="History" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No History Data</h3>
          <p className="text-gray-600">No attendance records found for this week.</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;