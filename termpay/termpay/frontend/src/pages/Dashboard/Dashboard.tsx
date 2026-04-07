import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend
} from 'recharts';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount);
};

const CountUp: React.FC<{ end: number; duration?: number; prefix?: string }> = ({ end, duration = 800, prefix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      setCount(Math.floor(end * percentage));

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{prefix}{prefix ? count.toLocaleString() : count}</span>;
};

const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats');
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 skeleton rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-[400px] skeleton rounded-xl" />
          <div className="h-[400px] skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'border-action-blue', iconColor: 'text-action-blue', bg: 'bg-blue-50' },
    { label: 'Fully Paid', value: stats.totalPaid, icon: CheckCircle, color: 'border-success-green', iconColor: 'text-success-green', bg: 'bg-green-50' },
    { label: 'Partial Payments', value: stats.totalPartial, icon: Clock, color: 'border-warning-amber', iconColor: 'text-warning-amber', bg: 'bg-orange-50' },
    { label: 'Unpaid Students', value: stats.totalUnpaid, icon: AlertCircle, color: 'border-danger-red', iconColor: 'text-danger-red', bg: 'bg-red-50' },
    { label: 'Total Collected', value: stats.totalCollectedRevenue, icon: TrendingUp, color: 'border-success-green', iconColor: 'text-success-green', bg: 'bg-green-50', isCurrency: true },
    { label: 'Outstanding', value: stats.totalOutstandingRevenue, icon: CreditCard, color: 'border-danger-red', iconColor: 'text-danger-red', bg: 'bg-red-50', isCurrency: true },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">School Overview</h1>
          <p className="text-text-secondary">Welcome back. Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">Download Report</button>
          <button className="btn-primary">Record Payment</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className={`card p-6 border-l-4 ${card.color} flex items-start justify-between`}>
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">{card.label}</p>
              <h3 className="text-2xl font-bold text-text-primary">
                <CountUp 
                  end={card.value} 
                  prefix={card.isCurrency ? '₦' : ''} 
                />
              </h3>
            </div>
            <div className={`p-3 rounded-full ${card.bg} ${card.iconColor}`}>
              <card.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 card p-6 flex flex-col">
          <h3 className="text-lg font-bold text-text-primary mb-6">Payment Distribution</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.paymentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {stats.paymentStatusData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-text-secondary">Total Students</p>
            <p className="text-2xl font-bold text-text-primary">{stats.totalStudents}</p>
          </div>
        </div>

        <div className="lg:col-span-2 card">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-bold text-text-primary">Recent Payments</h3>
            <button className="text-action-blue text-sm font-semibold flex items-center gap-1 hover:underline">
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentPayments.map((payment: any) => (
                  <tr key={payment.id}>
                    <td className="font-medium">{payment.student_name}</td>
                    <td>{payment.class_name}</td>
                    <td className="font-bold">{formatCurrency(payment.amount)}</td>
                    <td className="text-text-secondary">{new Date(payment.payment_date).toLocaleDateString()}</td>
                    <td>
                      <span className="badge badge-paid">PAID</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-primary">Top Unpaid Students</h3>
          <button className="text-action-blue text-sm font-semibold flex items-center gap-1 hover:underline">
            View All Defaulters <ArrowRight size={16} />
          </button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Total Owed</th>
                <th>Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.unpaidStudents.map((bill: any) => (
                <tr key={bill.id}>
                  <td className="font-medium">{bill.student_name}</td>
                  <td>{bill.class_name}</td>
                  <td>{formatCurrency(bill.total_amount)}</td>
                  <td className="text-danger-red font-bold">{formatCurrency(bill.balance)}</td>
                  <td>
                    <button className="p-1 hover:bg-slate-100 rounded transition-colors text-text-secondary">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
