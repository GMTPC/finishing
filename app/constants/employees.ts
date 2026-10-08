/**
 * รายชื่อพนักงานสำหรับเลือกตอนเข้าระบบและตอนสร้าง job
 * TODO: เปลี่ยนไปดึงจาก Laravel (`/api/employees`) แทนรายชื่อคงที่ชุดนี้
 */
export interface Employee {
  id: number
  username: string
  name: string
  role?: string
  /** เคยใช้ล่าสุด — โชว์ไว้บนสุดให้กดง่ายหน้างาน */
  isRecent?: boolean
}

export const EMPLOYEES: Employee[] = [
  { id: 1, username: 'S01', name: 'S01 - พนักงานสถานี 1', isRecent: true },
  { id: 2, username: 'S02', name: 'S02 - พนักงานสถานี 2', isRecent: true },
  { id: 3, username: 'S03', name: 'S03 - พนักงานสถานี 3', isRecent: true },
  { id: 4, username: 'S04', name: 'S04 - พนักงานสถานี 4' },
  { id: 5, username: 'S05', name: 'S05 - พนักงานสถานี 5' },
  { id: 6, username: 'admin01', name: 'admin01 - ผู้ดูแลระบบ 1', role: 'admin' },
  { id: 7, username: 'admin02', name: 'admin02 - ผู้ดูแลระบบ 2', role: 'admin' },
]

export function searchEmployees(keyword: string): Employee[] {
  const q = keyword.trim().toLowerCase()
  return q
    ? EMPLOYEES.filter(e => e.name.toLowerCase().includes(q) || e.username.toLowerCase().includes(q))
    : EMPLOYEES
}

