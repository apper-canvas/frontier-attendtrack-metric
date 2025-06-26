import AttendanceDashboard from '@/components/pages/AttendanceDashboard';
import AttendanceHistory from '@/components/pages/AttendanceHistory';
import StudentPatterns from '@/components/pages/StudentPatterns';
import StudentManagement from '@/components/pages/StudentManagement';

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
  }
};

export const routeArray = Object.values(routes);