import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { 
  Search, 
  UserPlus, 
  Filter, 
  Download,
  MoreVertical,
  Mail,
  Phone
} from 'lucide-react';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
};

const Students: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: students, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await api.get('/students');
      return response.data;
    }
  });

  const filteredStudents = students?.filter((s: any) => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.parent_phone.includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <span className="badge badge-paid">PAID</span>;
      case 'partial': return <span className="badge badge-partial">PARTIAL</span>;
      default: return <span className="badge badge-unpaid">UNPAID</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Students</h1>
          <p className="text-text-secondary">Manage and track all students in your school.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">
            <Download size={18} />
            Export Excel
          </button>
          <button className="btn-primary">
            <UserPlus size={18} />
            Add Student
          </button>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by name or parent phone..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary px-3">
              <Filter size={18} />
              Filter
            </button>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Class</th>
                <th>Parent Contact</th>
                <th>Fee Status</th>
                <th>Balance</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j}><div className="h-4 skeleton rounded w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : (
                filteredStudents?.map((student: any) => (
                  <tr key={student.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                          {student.full_name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <span className="font-medium text-text-primary">{student.full_name}</span>
                      </div>
                    </td>
                    <td>{student.class_name}</td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <Phone size={12} />
                          {student.parent_phone}
                        </div>
                        {student.parent_email && (
                          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                            <Mail size={12} />
                            {student.parent_email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{getStatusBadge(student.status)}</td>
                    <td className={student.balance > 0 ? "text-danger-red font-bold" : "text-success-green font-bold"}>
                      {formatCurrency(student.balance)}
                    </td>
                    <td className="text-right">
                      <button className="p-2 hover:bg-slate-100 rounded-full transition-colors text-text-secondary">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Students;
