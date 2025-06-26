import AttendanceDashboard from '@/components/pages/AttendanceDashboard';
import AttendanceHistory from '@/components/pages/AttendanceHistory';
import StudentPatterns from '@/components/pages/StudentPatterns';
import StudentManagement from '@/components/pages/StudentManagement';
import AttendanceCharts from '@/components/organisms/AttendanceCharts';
export const routes = {
  dashboard: {
    id: 'dashboard',
    label: 'Today\'s Attendance',
    path: '/',
    icon: 'Calendar',
    component: AttendanceDashboard
  },
  history: {
    id: 'history',
    label: 'History',
    path: '/history',
    icon: 'History',
    component: AttendanceHistory
  },
  patterns: {
    id: 'patterns',
    label: 'Patterns',
    path: '/patterns',
    icon: 'TrendingUp',
    component: StudentPatterns
  },
  students: {
    id: 'students',
    label: 'Students',
    path: '/students',
icon: 'Users',
    component: StudentManagement
  },
  charts: {
    id: 'charts',
    label: 'Charts',
    path: '/charts',
    icon: 'BarChart3',
    component: AttendanceCharts
  }
};

export const routeArray = Object.values(routes);