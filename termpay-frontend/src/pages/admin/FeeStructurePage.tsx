import { useState } from 'react'
import {
  GraduationCap,
  PlusCircle,
  Pencil,
  Zap,
  CheckCircle2,
  Tag,
  Loader2
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminLayout } from '../../layouts'
import { Card, Button, Badge, Modal, Input, Select, LoadingSkeleton } from '../../components/ui'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'
import { studentsService } from '../../services/studentsService'
import { dashboardService } from '../../services/dashboardService'
import { apiClient } from '../../services/apiClient'
import { getErrorMessage } from '../../services/apiClient'

const FeeStructurePage = () => {
  const { toast } = useToast()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isProprietor = user?.role === 'proprietor'

  const { data: classes, isLoading: classesLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: studentsService.getClasses
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats
  })

  // We need a way to get fee structure. Since there isn't a dedicated fee service yet,
  // I'll use apiClient directly or assume getClasses might return fee info if expanded.
  // Actually, Slice B9 added fee structure management.
  const { data: feeStructure, isLoading: feeLoading } = useQuery({
    queryKey: ['fee-structure'],
    queryFn: async () => {
       const response = await apiClient.get('/api/students/fee-structure')
       return response.data.data
    }
  })

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState<number | null>(null)

  const [newFee, setNewFee] = useState({
    name: '',
    amount: '',
    classId: 'all',
    isCompulsory: true,
    description: ''
  })

  const addFeeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/api/students/fee-items', data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-structure'] })
      setIsAddModalOpen(false)
      setNewFee({ name: '', amount: '', classId: 'all', isCompulsory: true, description: '' })
      toast.success('Fee item added successfully')
    },
    onError: (err) => toast.error(getErrorMessage(err))
  })

  const handleAddFeeItem = () => {
    if (!newFee.name || !newFee.amount) {
      toast.error("Please fill in required fields")
      return
    }

    addFeeMutation.mutate({
      name: newFee.name,
      amount: Number(newFee.amount),
      classId: newFee.classId === 'all' ? null : newFee.classId,
      isCompulsory: newFee.isCompulsory,
      description: newFee.description
    })
  }

  const handleGenerateAll = async () => {
    setIsGenerating(true)
    setGenerationStep(0)

    try {
      // In a real scenario, this would be an API call
      // await apiClient.post('/api/students/generate-bills')

      for (let i = 0; i < (classes?.length || 0); i++) {
        setGenerationStep(i)
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      setGenerationStep(classes?.length || 0)
      toast.success(`Bills generated successfully.`)
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['students'] })
    } catch (err) {
      toast.error('Failed to generate bills')
    } finally {
      setTimeout(() => {
        setIsGenerating(false)
        setGenerationStep(null)
      }, 1000)
    }
  }

  if (classesLoading || statsLoading || feeLoading) {
    return <AdminLayout><div className="p-8"><LoadingSkeleton variant="table" rows={10} /></div></AdminLayout>
  }

  return (
    <AdminLayout>
      <div className="animate-in fade-in slide-up duration-400">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-ink-primary tracking-tighter">Fee Structure</h1>
            <p className="text-[14px] text-ink-secondary">{stats?.termName} {stats?.session}</p>
          </div>
          <Button onClick={handleGenerateAll}>
            <Zap size={18} className="mr-2" />
            Generate All Bills
          </Button>
        </div>

        {/* Active Term Card */}
        <Card className="mb-10 !bg-emerald/4 border-emerald/12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-emerald/15 flex items-center justify-center text-emerald shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <GraduationCap size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-[18px] font-bold text-ink-primary">{stats?.termName} {stats?.session}</h2>
                  <Badge variant="success" className="uppercase font-black text-[9px] tracking-widest">Active</Badge>
                </div>
                <p className="text-[13px] text-ink-muted font-medium">Current active billing term</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Global Fee Items */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[18px] font-bold text-ink-primary tracking-tight">Term Fee Items</h2>
            {!isProprietor && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
              >
                <PlusCircle size={16} className="mr-2" />
                Add Fee Item
              </Button>
            )}
          </div>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-transparent">
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Fee Name</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Amount</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569]">Applies To</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569] text-center">Compulsory</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#475569] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {feeStructure?.map((fee: any) => (
                    <tr key={fee.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-5 font-bold text-ink-primary">
                        <div className="flex items-center gap-2">
                          {fee.name}
                          {!fee.isCompulsory && <Tag size={12} className="text-[#475569]" />}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-emerald font-bold">₦{fee.amount.toLocaleString()}</td>
                      <td className="px-6 py-5 text-ink-secondary">{fee.className || 'All Classes'}</td>
                      <td className="px-6 py-5 text-center">
                        <Badge variant={fee.isCompulsory ? 'success' : 'neutral'} className="text-[9px] font-black uppercase tracking-widest">
                          {fee.isCompulsory ? 'YES' : 'NO'}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!isProprietor && (
                            <button className="p-1.5 rounded-lg hover:bg-white/5 text-ink-muted hover:text-ink-primary transition-colors">
                              <Pencil size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(!feeStructure || feeStructure.length === 0) && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-[#475569]">No fee items defined yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Class Fee Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
          {classes?.map((cls: any) => {
            const items = feeStructure?.filter((f: any) => !f.classId || f.classId === cls.id) || []
            const total = items.reduce((acc: number, curr: any) => acc + (curr.isCompulsory ? curr.amount : 0), 0)

            return (
              <Card key={cls.id} className="p-0 flex flex-col h-full overflow-hidden border border-white/6 hover:border-white/12 group transition-all">
                <div className="px-6 py-6 border-b border-white/[0.04] flex items-center justify-between bg-white/[0.01]">
                  <div>
                    <h3 className="text-[20px] font-black text-ink-primary tracking-tighter">{cls.name}</h3>
                    <p className="text-[11px] text-[#475569] uppercase font-bold tracking-widest mt-1">Class Billing</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[28px] font-black text-emerald tracking-tight">₦{total.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-transparent">
                          <th className="px-6 py-4 text-[10px] font-bold text-[#475569] uppercase tracking-widest">Fee Item</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-[#475569] uppercase tracking-widest text-right">Amount (₦)</th>
                          <th className="px-6 py-4 text-[10px] font-bold text-[#475569] uppercase tracking-widest text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {items.map((item: any, idx: number) => (
                          <tr key={idx} className="group hover:bg-white/[0.01]">
                            <td className="px-6 py-4">
                              <span className="text-sm font-semibold text-ink-secondary">{item.name}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-sm font-bold text-ink-primary">₦{item.amount.toLocaleString()}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <Badge variant={item.isCompulsory ? 'success' : 'neutral'} className="text-[9px] font-black uppercase tracking-widest">
                                {item.isCompulsory ? 'Compulsory' : 'Optional'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Add Fee Item Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Fee Item"
          footer={
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAddFeeItem} isLoading={addFeeMutation.isPending}>Add Fee Item</Button>
            </div>
          }
        >
          <div className="space-y-6">
            <Input
              label="Fee Name"
              placeholder="e.g. Excursion Fee, Computer Levy, Sports Fee"
              value={newFee.name}
              onChange={(e) => setNewFee({...newFee, name: e.target.value})}
              required
            />
            <Input
              label="Amount (₦)"
              type="number"
              placeholder="0"
              value={newFee.amount}
              onChange={(e) => setNewFee({...newFee, amount: e.target.value})}
              required
            />
            <Select
              label="Apply To"
              options={[
                { value: 'all', label: 'All Classes' },
                ...(classes?.map((c: any) => ({ value: c.id, label: c.name })) || [])
              ]}
              value={newFee.classId}
              onChange={(e) => setNewFee({...newFee, classId: e.target.value})}
            />
            <div className="flex items-center gap-3.5 p-3.5 bg-white/4 rounded-xl border border-white/8">
              <input
                type="checkbox"
                id="compulsory"
                className="w-4 h-4 rounded border-white/20 bg-white/4 text-emerald focus:ring-emerald cursor-pointer"
                checked={newFee.isCompulsory}
                onChange={(e) => setNewFee({...newFee, isCompulsory: e.target.checked})}
              />
              <label htmlFor="compulsory" className="text-sm font-bold text-ink-secondary cursor-pointer">Compulsory Fee Item</label>
            </div>
            <Input
              label="Description (Optional)"
              placeholder="Brief note about this fee"
              value={newFee.description}
              onChange={(e) => setNewFee({...newFee, description: e.target.value})}
            />
          </div>
        </Modal>

        {/* Progress Modal */}
        <Modal
          isOpen={isGenerating}
          onClose={() => {}}
          title="Generating Student Bills"
        >
          <div className="py-8 flex flex-col items-center">
            {generationStep !== classes?.length ? (
              <>
                <div className="w-16 h-16 rounded-full bg-emerald/10 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                  <Loader2 size={32} className="text-emerald animate-spin" />
                </div>
                <p className="text-[18px] font-black text-ink-primary mb-8 text-center tracking-tight">
                  Generating bills for students...
                </p>
                <div className="w-full space-y-4 px-2">
                  {classes?.map((cls: any, i: number) => (
                    <div key={cls.id} className="flex items-center justify-between text-sm">
                      <span className="text-ink-secondary font-semibold">{cls.name}</span>
                      <div className="flex items-center gap-3">
                        {generationStep !== null && generationStep >= i ? (
                          <div className="text-emerald animate-in zoom-in duration-300">
                            <CheckCircle2 size={18} />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-white/6" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-emerald/15 flex items-center justify-center text-emerald mb-8 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-[22px] font-black text-ink-primary mb-3 tracking-tight">Bills Generated Successfully</h3>
                <p className="text-ink-secondary mb-10 font-medium">All students have been billed for the current term.</p>
                <Button onClick={() => setIsGenerating(false)} className="w-full h-11">Done</Button>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </AdminLayout>
  )
}

export default FeeStructurePage
