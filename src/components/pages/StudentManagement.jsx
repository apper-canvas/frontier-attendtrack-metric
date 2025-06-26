import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { studentService } from '@/services/api/studentService';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import SearchBar from '@/components/molecules/SearchBar';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import ApperIcon from '@/components/ApperIcon';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: ''
  });

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm]);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await studentService.getAll();
      setStudents(data);
    } catch (err) {
      setError(err.message || 'Failed to load students');
      toast.error('Failed to load students');
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
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.rollNumber || !formData.email) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      if (editingStudent) {
        await studentService.update(editingStudent.Id, formData);
        toast.success('Student updated successfully');
      } else {
        await studentService.create(formData);
        toast.success('Student added successfully');
      }
      
      await loadStudents();
      resetForm();
    } catch (err) {
      toast.error(editingStudent ? 'Failed to update student' : 'Failed to add student');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      rollNumber: student.rollNumber,
      email: student.email
    });
    setShowAddForm(true);
  };

  const handleDelete = async (student) => {
    if (window.confirm(`Are you sure you want to delete ${student.name}?`)) {
      try {
        await studentService.delete(student.Id);
        toast.success('Student deleted successfully');
        await loadStudents();
      } catch (err) {
        toast.error('Failed to delete student');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', rollNumber: '', email: '' });
    setEditingStudent(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="large" />
        <span className="ml-3 text-gray-600">Loading students...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <ApperIcon name="AlertCircle" className="w-12 h-12 text-error mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Students</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={loadStudents}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-gray-900">
            Student Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage student information and enrollment
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Plus" className="w-4 h-4" />
            <span>Add Student</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          placeholder="Search students by name, roll number, or email..."
          onSearch={setSearchTerm}
          className="max-w-md"
        />
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg border border-surface-200 p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h2>
              <Button
                variant="ghost"
                onClick={resetForm}
                className="p-2"
              >
                <ApperIcon name="X" className="w-4 h-4" />
              </Button>
            </div>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter student name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Roll Number
                </label>
                <Input
                  type="text"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                  placeholder="Enter roll number"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                  required
                />
              </div>
              
              <div className="md:col-span-3 flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingStudent ? 'Update Student' : 'Add Student'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Students List */}
      <div className="bg-white rounded-lg border border-surface-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-200">
          <h3 className="text-lg font-medium text-gray-900">
            Students ({filteredStudents.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roll Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student, index) => (
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
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.rollNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleEdit(student)}
                        className="text-primary hover:text-primary/80"
                      >
                        <ApperIcon name="Edit2" className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="small"
                        onClick={() => handleDelete(student)}
                        className="text-error hover:text-error/80"
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredStudents.length === 0 && !loading && (
        <div className="text-center py-12">
          <ApperIcon name="Users" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No matching students' : 'No students found'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? `No students found matching "${searchTerm}"`
              : 'Get started by adding your first student'
            }
          </p>
          {!searchTerm && (
            <Button onClick={() => setShowAddForm(true)}>
              Add First Student
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentManagement;