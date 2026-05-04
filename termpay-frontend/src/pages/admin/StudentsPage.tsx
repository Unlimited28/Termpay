import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Eye,
  MessageSquare,
  Download,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { AdminLayout } from '../../layouts'
import {
  PageHeader,
  Card,
  Button,
  Input,
  Select,
  Badge,
  Modal,
  EmptyState
} from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import { mockStudents, mockClasses } from '../../mock/mockData'
import { type Student } from '../../types'

const StudentsPage = () => {
  const navigate = useNavigate()
  const { toast } = useToast()

  // State for filtering
  const [searchTerm, setSearchTerm] = useState('')
  const [classFilter, setClassFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [students, setStudents] = useState<Student[]>(mockStudents)

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
                           student.parentPhone.includes(searchTerm)
      const matchesClass = classFilter === 'all' || student.classId === classFilter
      const matchesStatus = statusFilter === 'all' || student.status === statusFilter

      return matchesSearch && matchesClass && matchesStatus
    })
  }, [students, searchTerm, classFilter, statusFilter])

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

    setStudents([studentToAdd, ...students])
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
      <PageHeader
        title="Students"
        subtitle={`${filteredStudents.length} students enrolled`}
        actions={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleExport}>
              <Download size={18} className="mr-2" />
              Export
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={18} className="mr-2" />
              Add Student
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <Card className="mb-6 overflow-visible">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by name or phone..."
              icon={<Search size={18} />}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
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
      </Card>

      {/* Students Table */}
      <Card className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-xs text-text-secondary font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">#</th>
                <th className="px-6 py-4">Admission No</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4">Parent Phone</th>
                <th className="px-6 py-4 text-right">Amount Paid</th>
                <th className="px-6 py-4 text-right">Balance</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((student, i) => (
                  <tr key={student.id} className="text-sm hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-text-secondary">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                    <td className="px-6 py-4 font-medium text-text-primary">{student.admissionNumber}</td>
                    <td className="px-6 py-4 font-medium text-text-primary">{student.fullName}</td>
                    <td className="px-6 py-4 text-text-secondary">{student.className}</td>
                    <td className="px-6 py-4 text-text-secondary">{student.parentPhone}</td>
                    <td className="px-6 py-4 text-right font-medium text-brand-green">₦{student.amountPaid.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-medium text-brand-red">₦{student.balance.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <Badge variant={student.status}>{student.status.charAt(0).toUpperCase() + student.status.slice(1)}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/students/${student.id}`)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-text-secondary hover:text-text-primary transition-colors"
                          title="View Profile"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleSendReminder(student)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-text-secondary hover:text-text-primary transition-colors"
                          title="Send Reminder"
                        >
                          <MessageSquare size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-surface-border flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredStudents.length)}</span> of <span className="font-medium">{filteredStudents.length}</span> students
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                <ChevronLeft size={16} />
              </Button>
              <div className="flex items-center px-4 text-sm font-medium">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Student"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddStudent}>Add Student</Button>
          </>
        }
      >
        <div className="space-y-4">
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
