import attendanceData from '../mockData/attendanceRecords.json';
import { format, isToday, parseISO } from 'date-fns';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let attendanceRecords = [...attendanceData];

export const attendanceService = {
  async getAll() {
    await delay(300);
    return [...attendanceRecords];
  },

  async getByDate(date) {
    await delay(250);
    const dateString = format(new Date(date), 'yyyy-MM-dd');
    const records = attendanceRecords.filter(record => record.date === dateString);
    return [...records];
  },

  async getByStudentId(studentId) {
    await delay(200);
    const records = attendanceRecords.filter(record => record.studentId === parseInt(studentId, 10));
    return [...records];
  },

  async getTodaysAttendance() {
    await delay(300);
    const today = format(new Date(), 'yyyy-MM-dd');
    const records = attendanceRecords.filter(record => record.date === today);
    return [...records];
  },

  async markAttendance(studentId, date, lectureSlot, present, notes = '') {
    await delay(400);
    const dateString = format(new Date(date), 'yyyy-MM-dd');
    const existingIndex = attendanceRecords.findIndex(
      record => record.studentId === parseInt(studentId, 10) && record.date === dateString
    );

    if (existingIndex !== -1) {
      // Update existing record
      const updatedRecord = {
        ...attendanceRecords[existingIndex],
        [lectureSlot]: present,
        notes: notes || attendanceRecords[existingIndex].notes
      };
      attendanceRecords[existingIndex] = updatedRecord;
      return { ...updatedRecord };
    } else {
      // Create new record
      const maxId = Math.max(...attendanceRecords.map(r => r.Id), 0);
      const newRecord = {
        Id: maxId + 1,
        studentId: parseInt(studentId, 10),
        date: dateString,
        lecture8am: lectureSlot === 'lecture8am' ? present : false,
        lecture10am: lectureSlot === 'lecture10am' ? present : false,
        lecture1pm: lectureSlot === 'lecture1pm' ? present : false,
        notes: notes || ''
      };
      attendanceRecords.push(newRecord);
      return { ...newRecord };
    }
  },

  async bulkMarkAttendance(attendanceData) {
    await delay(500);
    const results = [];
    
    for (const item of attendanceData) {
      const result = await this.markAttendance(
        item.studentId,
        item.date,
        item.lectureSlot,
        item.present,
        item.notes
      );
      results.push(result);
    }
    
    return results;
  },

  async getAttendanceStats(startDate, endDate) {
    await delay(300);
    const start = format(new Date(startDate), 'yyyy-MM-dd');
    const end = format(new Date(endDate), 'yyyy-MM-dd');
    
    const records = attendanceRecords.filter(record => 
      record.date >= start && record.date <= end
    );
    
    return [...records];
  },

  async delete(id) {
    await delay(300);
    const index = attendanceRecords.findIndex(r => r.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Attendance record not found');
    }
    
const deletedRecord = attendanceRecords[index];
    attendanceRecords.splice(index, 1);
    return { ...deletedRecord };
  },

  async getAttendanceTrends(startDate, endDate, studentIds = null) {
    await delay(400);
    const start = format(new Date(startDate), 'yyyy-MM-dd');
    const end = format(new Date(endDate), 'yyyy-MM-dd');
    
    let records = attendanceRecords.filter(record => 
      record.date >= start && record.date <= end
    );
    
    if (studentIds && studentIds.length > 0) {
      records = records.filter(record => studentIds.includes(record.studentId));
    }
    
    // Group by date for trend analysis
    const dateGroups = {};
    records.forEach(record => {
      if (!dateGroups[record.date]) {
        dateGroups[record.date] = { date: record.date, students: [] };
      }
      dateGroups[record.date].students.push(record);
    });
    
    // Calculate daily attendance percentages
    const trendData = Object.values(dateGroups).map(group => {
      const total = group.students.length;
      const present8am = group.students.filter(s => s.lecture8am).length;
      const present10am = group.students.filter(s => s.lecture10am).length;
      const present1pm = group.students.filter(s => s.lecture1pm).length;
      
      return {
        date: group.date,
        lecture8am: total > 0 ? Math.round((present8am / total) * 100) : 0,
        lecture10am: total > 0 ? Math.round((present10am / total) * 100) : 0,
        lecture1pm: total > 0 ? Math.round((present1pm / total) * 100) : 0,
        totalStudents: total
      };
    }).sort((a, b) => a.date.localeCompare(b.date));
    
    return trendData;
  }
};