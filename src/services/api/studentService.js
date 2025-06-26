import studentsData from '../mockData/students.json';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let students = [...studentsData];

export const studentService = {
  async getAll() {
    await delay(300);
    return [...students];
  },

  async getById(id) {
    await delay(200);
    const student = students.find(s => s.Id === parseInt(id, 10));
    if (!student) {
      throw new Error('Student not found');
    }
    return { ...student };
  },

  async create(studentData) {
    await delay(400);
    const maxId = Math.max(...students.map(s => s.Id), 0);
    const newStudent = {
      Id: maxId + 1,
      ...studentData
    };
    students.push(newStudent);
    return { ...newStudent };
  },

  async update(id, studentData) {
    await delay(350);
    const index = students.findIndex(s => s.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Student not found');
    }
    
    const updatedStudent = {
      ...students[index],
      ...studentData,
      Id: students[index].Id // Ensure ID cannot be modified
    };
    
    students[index] = updatedStudent;
    return { ...updatedStudent };
  },

  async delete(id) {
    await delay(300);
    const index = students.findIndex(s => s.Id === parseInt(id, 10));
    if (index === -1) {
      throw new Error('Student not found');
    }
    
    const deletedStudent = students[index];
    students.splice(index, 1);
    return { ...deletedStudent };
  }
};