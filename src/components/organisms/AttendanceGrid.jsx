import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { studentService } from '@/services/api/studentService';
import { attendanceService } from '@/services/api/attendanceService';
import StudentCard from '@/components/molecules/StudentCard';
import SearchBar from '@/components/molecules/SearchBar';
import Button from '@/components/atoms/Button';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import ApperIcon from '@/components/ApperIcon';

const AttendanceGrid = ({ selectedDate, onAttendanceUpdate }) => {
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [studentsData, attendanceData] = await Promise.all([
        studentService.getAll(),
        attendanceService.getByDate(selectedDate)
      ]);
      
      setStudents(studentsData);
      setAttendanceRecords(attendanceData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (!searchTerm) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const handleAttendanceChange = async (studentId, lectureSlot, present) => {
    try {
      await attendanceService.markAttendance(
        studentId,
        selectedDate,
        lectureSlot,
        present
      );
      
      // Update local state
      setAttendanceRecords(prev => {
        const existing = prev.find(r => r.studentId === studentId);
        if (existing) {
          return prev.map(r => 
            r.studentId === studentId 
              ? { ...r, [lectureSlot]: present }
              : r
          );
        } else {
          return [...prev, {
            Id: Date.now(),
            studentId,
            date: selectedDate.toISOString().split('T')[0],
            lecture8am: lectureSlot === 'lecture8am' ? present : false,
            lecture10am: lectureSlot === 'lecture10am' ? present : false,
            lecture1pm: lectureSlot === 'lecture1pm' ? present : false,
            notes: ''
          }];
        }
      });
      
      if (onAttendanceUpdate) {
        onAttendanceUpdate();
      }
      
    } catch (err) {
      toast.error('Failed to update attendance');
    }
  };

  const markAllPresent = async (lectureSlot) => {
    try {
      const updates = students.map(student => ({
        studentId: student.Id,
        date: selectedDate,
        lectureSlot,
        present: true
      }));
      
      await attendanceService.bulkMarkAttendance(updates);
      await loadData();
      toast.success(`All students marked present for ${lectureSlot.replace('lecture', '').replace('am', ' AM').replace('pm', ' PM')}`);
      
      if (onAttendanceUpdate) {
        onAttendanceUpdate();
      }
    } catch (err) {
      toast.error('Failed to mark all students present');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
        <span className="ml-3 text-gray-600">Loading attendance data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ApperIcon name="AlertCircle" className="w-12 h-12 text-error mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={loadData}>Try Again</Button>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <ApperIcon name="Users" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
        <p className="text-gray-600">Add students to start tracking attendance.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchBar
          placeholder="Search students by name or roll number..."
          onSearch={setSearchTerm}
          className="w-full sm:w-80"
        />
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="small"
            onClick={() => markAllPresent('lecture8am')}
            className="whitespace-nowrap"
          >
            <ApperIcon name="Clock8" className="w-4 h-4 mr-1" />
            Mark All 8AM
          </Button>
          <Button
            variant="outline"
            size="small"
            onClick={() => markAllPresent('lecture10am')}
            className="whitespace-nowrap"
          >
            <ApperIcon name="Clock10" className="w-4 h-4 mr-1" />
            Mark All 10AM
          </Button>
          <Button
            variant="outline"
            size="small"
            onClick={() => markAllPresent('lecture1pm')}
            className="whitespace-nowrap"
          >
            <ApperIcon name="Clock1" className="w-4 h-4 mr-1" />
            Mark All 1PM
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredStudents.length} of {students.length} students
      </div>

      {/* Student Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredStudents.map((student, index) => {
            const attendanceRecord = attendanceRecords.find(
              r => r.studentId === student.Id
            );
            
            return (
              <motion.div
                key={student.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <StudentCard
                  student={student}
                  attendanceRecord={attendanceRecord}
                  onAttendanceChange={handleAttendanceChange}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredStudents.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <ApperIcon name="Search" className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No students found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceGrid;