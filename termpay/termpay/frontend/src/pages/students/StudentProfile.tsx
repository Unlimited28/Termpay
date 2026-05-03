import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../layouts';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { ArrowLeft, User, Phone, BookOpen, CreditCard } from 'lucide-react';
import { studentService, Student } from '../../services/studentService';
import { useToast } from '../../context/ToastContext';

export function StudentProfile() {
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      if (!id) return;
      try {
        const data = await studentService.getById(id);
        setStudent(data);
      } catch (error) {
        toast.error('Failed to load student details');
        navigate('/students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id, navigate]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <LoadingSkeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LoadingSkeleton className="h-64 col-span-2" />
            <LoadingSkeleton className="h-64" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!student) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge variant="paid">Paid</Badge>;
      case 'partial': return <Badge variant="partial">Partial</Badge>;
      case 'unpaid': return <Badge variant="unpaid">Unpaid</Badge>;
      default: return <Badge variant="info">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount).replace('NGN', '₦');
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <button
          onClick={() => navigate('/students')}
          className="flex items-center text-sm text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Students
        </button>
        <PageHeader
          title={student.full_name}
          description={`Admission Number: ${student.admission_number || 'N/A'}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-navy mb-6">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-brand-blue">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1">Full Name</p>
                  <p className="font-semibold text-text-primary">{student.full_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1">Class</p>
                  <p className="font-semibold text-text-primary">{student.class_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1">Parent/Guardian</p>
                  <p className="font-semibold text-text-primary">{student.parent_name || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary mb-1">Parent Phone</p>
                  <p className="font-semibold text-text-primary">{student.parent_phone}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Fee Summary */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-navy mb-6">Active Term Fee Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-surface-border">
                <span className="text-sm text-text-secondary">Current Status</span>
                {student.fee_bill ? getStatusBadge(student.fee_bill.status) : <Badge variant="unpaid">Unpaid</Badge>}
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Total Bill</span>
                  <span className="font-semibold text-text-primary">{formatCurrency(student.fee_bill?.total_amount || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Total Paid</span>
                  <span className="font-semibold text-brand-blue">{formatCurrency(student.fee_bill?.amount_paid || 0)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-surface-border">
                  <span className="font-medium text-text-primary">Balance Due</span>
                  <span className="text-lg font-bold text-brand-red">{formatCurrency(student.fee_bill?.balance || 0)}</span>
                </div>
              </div>

              <Button variant="primary" className="w-full mt-4" disabled>
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Payments
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
