import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../layouts';
import { PageHeader } from '../../components/ui/PageHeader';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { Search, Plus, User, Eye } from 'lucide-react';
import { studentService, Student } from '../../services/studentService';
import { classService, Class } from '../../services/classService';
import { AddStudentModal } from './AddStudentModal';

export function StudentsList() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsData, classesData] = await Promise.all([
        studentService.getAll(),
        classService.getAll()
      ]);
      setStudents(studentsData);
      setClasses(classesData);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.full_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = classFilter === 'all' || student.class_name === classes.find(c => c.id === classFilter)?.name;
      return matchesSearch && matchesClass;
    });
  }, [students, searchQuery, classFilter, classes]);

  const classOptions = [
    { label: 'All Classes', value: 'all' },
    ...classes.map(c => ({ label: c.name, value: c.id }))
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge variant="paid">Paid</Badge>;
      case 'partial': return <Badge variant="partial">Partial</Badge>;
      case 'unpaid': return <Badge variant="unpaid">Unpaid</Badge>;
      default: return <Badge variant="info">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Manage your student records and payment statuses"
        actions={
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        }
      />

      <div className="space-y-6">
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search students by name..."
                leftIcon={<Search className="w-4 h-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select
                options={classOptions}
                value={classFilter}
                onChange={setClassFilter}
                placeholder="Filter by Class"
              />
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <LoadingSkeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filteredStudents.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-surface-border">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Student Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Class</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Parent</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-brand-blue font-semibold text-xs">
                            {student.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <span className="font-medium text-text-primary">{student.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-text-secondary">{student.class_name}</td>
                      <td className="px-6 py-4 text-sm text-text-secondary">{student.parent_name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-text-secondary">{student.parent_phone}</td>
                      <td className="px-6 py-4">{getStatusBadge(student.status)}</td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/students/${student.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <EmptyState
            title="No students found"
            description={searchQuery || classFilter !== 'all' ? "Try adjusting your search or filters" : "Start by adding your first student"}
            icon={<User size={40} />}
          />
        )}
      </div>

      <AddStudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        classes={classes}
        onSuccess={fetchData}
      />
    </div>
  );
}
