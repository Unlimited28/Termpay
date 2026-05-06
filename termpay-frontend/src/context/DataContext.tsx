import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { mockStudents as initialStudents, mockDashboardStats as initialStats } from '../mock/mockData'
import type { Student, DashboardStats } from '../types'

interface DataContextType {
  students: Student[]
  stats: DashboardStats
  generateBills: (classFees: Record<string, number>) => void
  addStudent: (student: Student) => void
}

const DataContext = createContext<DataContextType | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('termpay_students')
    return saved ? JSON.parse(saved) : initialStudents
  })

  const [stats, setStats] = useState<DashboardStats>(() => {
    const saved = localStorage.getItem('termpay_stats')
    return saved ? JSON.parse(saved) : initialStats
  })

  useEffect(() => {
    localStorage.setItem('termpay_students', JSON.stringify(students))

    // Recalculate stats whenever students change
    const paidCount = students.filter(s => s.status === 'paid').length
    const partialCount = students.filter(s => s.status === 'partial').length
    const unpaidCount = students.filter(s => s.status === 'unpaid').length
    const totalCollected = students.reduce((acc, s) => acc + s.amountPaid, 0)
    const totalOutstanding = students.reduce((acc, s) => acc + s.balance, 0)
    const totalExpected = totalCollected + totalOutstanding

    const newStats: DashboardStats = {
      totalStudents: students.length,
      paidCount,
      paidPercent: Math.round((paidCount / students.length) * 100),
      partialCount,
      partialPercent: Math.round((partialCount / students.length) * 100),
      unpaidCount,
      unpaidPercent: Math.round((unpaidCount / students.length) * 100),
      totalCollected,
      totalOutstanding,
      totalExpected
    }
    setStats(newStats)
    localStorage.setItem('termpay_stats', JSON.stringify(newStats))
  }, [students])

  const generateBills = (classFees: Record<string, number>) => {
    const updatedStudents = students.map(student => {
      const newTotalBill = classFees[student.className] || student.totalBill
      return {
        ...student,
        totalBill: newTotalBill,
        balance: newTotalBill - student.amountPaid,
        status: (newTotalBill - student.amountPaid) <= 0 ? 'paid' :
                (student.amountPaid > 0 ? 'partial' : 'unpaid')
      } as Student
    })
    setStudents(updatedStudents)
  }

  const addStudent = (student: Student) => {
    setStudents(prev => [student, ...prev])
  }

  return (
    <DataContext.Provider value={{ students, stats, generateBills, addStudent }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
