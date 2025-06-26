import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, subDays, subMonths, startOfDay } from 'date-fns';
import Chart from 'react-apexcharts';
import { toast } from 'react-toastify';
import { attendanceService } from '@/services/api/attendanceService';
import { studentService } from '@/services/api/studentService';
import Button from '@/components/atoms/Button';
import LoadingSpinner from '@/components/atoms/LoadingSpinner';
import ApperIcon from '@/components/ApperIcon';

const AttendanceCharts = () => {
  const [chartData, setChartData] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [chartType, setChartType] = useState('line');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const periods = {
    '7days': { label: '7 Days', days: 7 },
    '30days': { label: '30 Days', days: 30 },
    '3months': { label: '3 Months', days: 90 }
  };

  useEffect(() => {
    loadData();
  }, [selectedPeriod, selectedStudents]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load students
      const studentsData = await studentService.getAll();
      setStudents(studentsData);

      // Calculate date range
      const endDate = new Date();
      const startDate = subDays(endDate, periods[selectedPeriod].days);

      // Load attendance trends
      const studentIds = selectedStudents.length > 0 ? selectedStudents : null;
      const trends = await attendanceService.getAttendanceTrends(startDate, endDate, studentIds);
      
      setChartData(trends);
    } catch (err) {
      console.error('Failed to load chart data:', err);
      setError('Failed to load chart data');
      toast.error('Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  const getChartOptions = () => {
    const baseOptions = {
      chart: {
        type: chartType,
        height: 350,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          }
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        }
      },
      colors: ['#3B82F6', '#10B981', '#F59E0B'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: chartType === 'line' ? 3 : 0
      },
      xaxis: {
        categories: chartData.map(item => format(new Date(item.date), 'MMM dd')),
        title: {
          text: 'Date'
        }
      },
      yaxis: {
        title: {
          text: 'Attendance Percentage (%)'
        },
        min: 0,
        max: 100
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (value) => `${value}%`
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'center'
      },
      grid: {
        show: true,
        borderColor: '#e5e7eb',
        strokeDashArray: 3
      },
      fill: {
        opacity: chartType === 'area' ? 0.6 : 1
      }
    };

    return baseOptions;
  };

  const getChartSeries = () => {
    return [
      {
        name: '8:00 AM Lecture',
        data: chartData.map(item => item.lecture8am)
      },
      {
        name: '10:00 AM Lecture',
        data: chartData.map(item => item.lecture10am)
      },
      {
        name: '1:00 PM Lecture',
        data: chartData.map(item => item.lecture1pm)
      }
    ];
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <ApperIcon name="AlertCircle" className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">{error}</p>
        <Button onClick={loadData} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Attendance Trends</h2>
          <p className="text-sm text-gray-600 mt-1">
            Visual analysis of attendance patterns over time
          </p>
        </div>

        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button
            variant="ghost"
            onClick={loadData}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="RefreshCw" className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Time Period Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Period:</span>
          <div className="flex items-center space-x-1">
            {Object.entries(periods).map(([key, period]) => (
              <Button
                key={key}
                variant={selectedPeriod === key ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedPeriod(key)}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Chart Type Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Chart:</span>
          <div className="flex items-center space-x-1">
            <Button
              variant={chartType === 'line' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setChartType('line')}
              className="flex items-center space-x-1"
            >
              <ApperIcon name="TrendingUp" className="w-4 h-4" />
              <span>Line</span>
            </Button>
            <Button
              variant={chartType === 'bar' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setChartType('bar')}
              className="flex items-center space-x-1"
            >
              <ApperIcon name="BarChart3" className="w-4 h-4" />
              <span>Bar</span>
            </Button>
            <Button
              variant={chartType === 'area' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setChartType('area')}
              className="flex items-center space-x-1"
            >
              <ApperIcon name="Activity" className="w-4 h-4" />
              <span>Area</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Student Filter */}
      {students.length > 0 && (
        <div className="border border-surface-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Filter by Students</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStudents([])}
                disabled={selectedStudents.length === 0}
              >
                Clear All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStudents(students.map(s => s.Id))}
                disabled={selectedStudents.length === students.length}
              >
                Select All
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {students.map(student => (
              <label
                key={student.Id}
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.Id)}
                  onChange={() => handleStudentToggle(student.Id)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700 truncate">
                  {student.name}
                </span>
              </label>
            ))}
          </div>
          
          {selectedStudents.length > 0 && (
            <div className="mt-3 pt-3 border-t border-surface-200">
              <p className="text-xs text-gray-600">
                Showing data for {selectedStudents.length} selected student{selectedStudents.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="bg-white border border-surface-200 rounded-lg p-6">
        {chartData.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Chart
              options={getChartOptions()}
              series={getChartSeries()}
              type={chartType}
              height="350"
            />
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <ApperIcon name="BarChart3" className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg font-medium">No data available</p>
            <p className="text-sm">No attendance records found for the selected period</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <ApperIcon name="Clock8" className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-900">8:00 AM Average</p>
                <p className="text-lg font-bold text-blue-600">
                  {Math.round(chartData.reduce((sum, item) => sum + item.lecture8am, 0) / chartData.length)}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <ApperIcon name="Clock10" className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-900">10:00 AM Average</p>
                <p className="text-lg font-bold text-green-600">
                  {Math.round(chartData.reduce((sum, item) => sum + item.lecture10am, 0) / chartData.length)}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <ApperIcon name="Clock1" className="w-5 h-5 text-yellow-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-yellow-900">1:00 PM Average</p>
                <p className="text-lg font-bold text-yellow-600">
                  {Math.round(chartData.reduce((sum, item) => sum + item.lecture1pm, 0) / chartData.length)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceCharts;