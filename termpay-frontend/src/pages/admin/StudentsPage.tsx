import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Plus,
  Search,
  Eye,
  MessageSquare,
  Download,
  Users,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { AdminLayout } from '../../layouts'
import {
  Card,
  Button,
  Input,
  Select,
  Badge,
  Modal,
  EmptyState
} from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { useData } from '../../context/DataContext'
import { mockClasses } from '../../mock/mockData'
import { type Student } from '../../types'

const StudentsPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuth()
  const { students, addStudent } = useData()

  const isProprietor = user?.role === 'proprietor'

  // State for filtering
  const [searchTerm, setSearchTerm] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Handle URL parameters
  useEffect(() => {
    const status = searchParams.get('status')
    if (status && ['paid', 'partial', 'unpaid'].includes(status)) {
      setStatusFilter(status)
    }
  }, [searchParams])

  // State for Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newStudent, setNewStudent] = useState({
    fullName: '',
    classId: '',
    parentName: '',
    parentPhone: '',
    parentEmail: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter logic
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.parentPhone.includes(searchTerm)
      const matchesClass = classFilter === 'all' || student.classId === classFilter
      const matchesStatus = statusFilter === 'all' || student.status === statusFilter

      return matchesSearch && matchesClass && matchesStatus
    })
  }, [students, searchTerm, classFilter, statusFilter])

  const stats = useMemo(() => {
    const total = students.length
    const paid = students.filter(s => s.status === 'paid').length
    const partial = students.filter(s => s.status === 'partial').length
    const unpaid = students.filter(s => s.status === 'unpaid').length
    return { total, paid, partial, unpaid }
  }, [students])

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleExport = () => {
    toast.info("Exporting students list...")
  }

  const handleSendReminder = (student: Student) => {
    toast.success(`Reminder sent to ${student.parentPhone}`)
  }

  const validatePhone = (phone: string) => {
    const regex = /^(07|08|09)\d{9}$/
    return regex.test(phone)
  }

  const handleAddStudent = () => {
    const newErrors: Record<string, string> = {}
    if (!newStudent.fullName) newErrors.fullName = "Full Name is required"
    if (!newStudent.classId) newErrors.classId = "Class is required"
    if (!newStudent.parentName) newErrors.parentName = "Parent Name is required"
    if (!newStudent.parentPhone) {
      newErrors.parentPhone = "Parent Phone is required"
    } else if (!validatePhone(newStudent.parentPhone)) {
      newErrors.parentPhone = "Enter a valid Nigerian phone number"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const selectedClass = mockClasses.find(c => c.id === newStudent.classId)
    const nextId = `s${students.length + 1}`
    const admissionNumber = `YOM-${(students.length + 1).toString().padStart(3, '0')}`

    const studentToAdd: Student = {
      id: nextId,
      fullName: newStudent.fullName,
      admissionNumber,
      className: selectedClass?.name || '',
      classId: newStudent.classId,
      parentName: newStudent.parentName,
      parentPhone: newStudent.parentPhone,
      parentEmail: newStudent.parentEmail,
      paymentReference: `YOM-2026-${(students.length + 1).toString().padStart(4, '0')}`,
      totalBill: 85000,
      amountPaid: 0,
      balance: 85000,
      status: 'unpaid'
    }

    addStudent(studentToAdd)
    setIsModalOpen(false)
    setNewStudent({ fullName: '', classId: '', parentName: '', parentPhone: '', parentEmail: '' })
    setErrors({})
    toast.success("Student added successfully")
  }

  const classOptions = [
    { value: 'all', label: 'All Classes' },
    ...mockClasses.map(c => ({ value: c.id, label: c.name }))
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'paid', label: 'Paid' },
    { value: 'partial', label: 'Partial' },
    { value: 'unpaid', label: 'Unpaid' },
  ]

  return (
    <AdminLayout>
      <div className="animate-in fade-in slide-up duration-400">
        {isProprietor && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-info/8 border border-info/12 rounded-xl text-info-light">
            <AlertCircle size={18} />
            <p className="text-[14px] font-medium">You are viewing as Proprietor — contact your Bursar to make changes.</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-ink-primary tracking-tighter">Students</h1>
            <p className="text-[14px] text-ink-secondary">{filteredStudents.length} students enrolled</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleExport}>
              <Download size={18} className="mr-2" />
              Export
            </Button>
            {!isProprietor && (
              <Button
                onClick={() => setIsModalOpen(true)}
              >
                <Plus size={18} className="mr-2" />
                Add Student
              </Button>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-6 mb-8 p-4 bg-white/[0.02] border border-white/6 rounded-xl text-[13px] font-medium">
          <div className="flex items-center gap-2">
            <span className="text-ink-primary font-bold">{stats.total}</span>
            <span className="text-ink-muted">Total</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-emerald font-bold">{stats.paid}</span>
            <span className="text-ink-muted">Paid</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-warning font-bold">{stats.partial}</span>
            <span className="text-ink-muted">Partial</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <span className="text-danger font-bold">{stats.unpaid}</span>
            <span className="text-ink-muted">Unpaid</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 p-4 bg-white/[0.02] border border-white/6 rounded-xl flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name, class or phone..."
              icon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full"
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              options={classOptions}
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
          <div className="w-full md:w-48">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
            />
          </div>
        </div>

        {/* Students Table */}
        <Card className="p-0 overflow-hidden">
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-transparent">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">#</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Student Name + Class</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Parent Phone</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569] text-right">Amount Paid</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569] text-right">Balance</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {paginatedStudents.length > 0 ? (
                  paginatedStudents.map((student, i) => (
                    <tr key={student.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-[13px] text-[#475569]">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-ink-primary">{student.fullName}</span>
                          <span className="text-[12px] text-[#475569]">{student.className}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-secondary">{student.parentPhone}</td>
                      <td className={`px-6 py-4 text-right text-sm ${student.status === 'paid' ? 'font-bold text-emerald' : 'text-ink-secondary'}`}>
                        ₦{student.amountPaid.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {student.balance === 0 ? (
                          <div className="flex justify-end">
                            <CheckCircle2 size={18} className="text-emerald" />
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-danger">₦{student.balance.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={student.status} className="uppercase tracking-widest font-black">
                          {student.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/students/${student.id}`)}
                            className="p-1.5 rounded-lg hover:bg-white/5 text-ink-muted hover:text-ink-primary transition-colors"
                          >
                            <Eye size={18} />
                          </button>
                          {!isProprietor && (
                            <button
                              onClick={() => handleSendReminder(student)}
                              className="p-1.5 rounded-lg hover:bg-white/5 text-ink-muted hover:text-ink-primary transition-colors"
                            >
                              <MessageSquare size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <EmptyState
                        icon={Users}
                        title="No students found"
                        description="Try adjusting your search or filters to find what you're looking for."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden divide-y divide-white/[0.04]">
            {paginatedStudents.length > 0 ? (
              paginatedStudents.map((student) => (
                <div key={student.id} className="p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-ink-primary">{student.fullName}</h3>
                      <p className="text-xs text-[#475569]">{student.className}</p>
                    </div>
                    <Badge variant={student.status} className="uppercase">
                      {student.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-[#475569] uppercase font-bold tracking-widest mb-1">Balance</p>
                      <p className={`text-sm font-bold ${student.balance === 0 ? 'text-emerald' : 'text-danger'}`}>
                        {student.balance === 0 ? 'Fully Paid' : `₦${student.balance.toLocaleString()}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/students/${student.id}`)}
                        className="p-2 bg-white/4 rounded-lg text-ink-muted"
                      >
                        <Eye size={18} />
                      </button>
                      {!isProprietor && (
                        <button
                          onClick={() => handleSendReminder(student)}
                          className="p-2 bg-white/4 rounded-lg text-ink-muted"
                        >
                          <MessageSquare size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12">
                <EmptyState
                  icon={Users}
                  title="No students found"
                  description="Try adjusting your search or filters."
                />
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-white/[0.04] flex items-center justify-between">
              <p className="text-[13px] text-ink-muted">
                Showing <span className="text-ink-secondary font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-ink-secondary font-medium">{Math.min(currentPage * itemsPerPage, filteredStudents.length)}</span> of <span className="text-ink-secondary font-medium">{filteredStudents.length}</span>
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="h-8 w-8 !p-0"
                >
                  <ChevronLeft size={16} />
                </Button>
                <div className="flex items-center px-2 text-[13px] font-medium text-ink-secondary">
                   {currentPage} / {totalPages}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="h-8 w-8 !p-0"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Add Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Student"
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddStudent}>Add Student</Button>
          </div>
        }
      >
        <div className="space-y-6">
          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            value={newStudent.fullName}
            onChange={(e) => setNewStudent({...newStudent, fullName: e.target.value})}
            error={errors.fullName}
            required
          />
          <Select
            label="Class"
            options={[{ value: '', label: 'Select a class' }, ...mockClasses.map(c => ({ value: c.id, label: c.name }))]}
            value={newStudent.classId}
            onChange={(e) => setNewStudent({...newStudent, classId: e.target.value})}
            error={errors.classId}
            required
          />
          <Input
            label="Parent Name"
            placeholder="e.g. Mr. Robert Doe"
            value={newStudent.parentName}
            onChange={(e) => setNewStudent({...newStudent, parentName: e.target.value})}
            error={errors.parentName}
            required
          />
          <Input
            label="Parent Phone"
            placeholder="e.g. 08012345678"
            value={newStudent.parentPhone}
            onChange={(e) => setNewStudent({...newStudent, parentPhone: e.target.value})}
            error={errors.parentPhone}
            required
          />
          <Input
            label="Parent Email (Optional)"
            type="email"
            placeholder="e.g. parent@example.com"
            value={newStudent.parentEmail}
            onChange={(e) => setNewStudent({...newStudent, parentEmail: e.target.value})}
          />
        </div>
      </Modal>
    </AdminLayout>
  )
}

export default StudentsPage
